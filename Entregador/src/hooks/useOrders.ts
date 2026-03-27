import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../lib/supabase';
import { logger } from '../utils/logger';
import { startAlarm, stopAlarm } from '../utils/audio';
import { geolocation } from '../utils/geolocation';

export const useOrders = (authenticatedUserId: string | null = null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState<Order | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [assignedTenantIds, setAssignedTenantIds] = useState<string[]>([]);
  const [isRinging, setIsRinging] = useState(false);
  const prevOrdersRef = useRef<Order[]>([]);

  // Pega o ID do entregador logado
  useEffect(() => {
    if (authenticatedUserId) {
      setUserId(authenticatedUserId);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || null);
    });
  }, [authenticatedUserId]);

  // Carrega os tenants vinculados ao entregador
  useEffect(() => {
    async function fetchAssignedTenants() {
      if (!userId) {
        setAssignedTenantIds([]);
        return;
      }

      const { data, error } = await supabase
        .from('deliverer_tenants')
        .select('tenant_id')
        .eq('deliverer_id', userId)
        .eq('is_active', true);

      if (error) {
        logger.error('Erro ao buscar vínculos de lojas do entregador', error);
        setAssignedTenantIds([]);
        return;
      }

      const ids = (data || [])
        .map((row: { tenant_id?: string | null }) => row.tenant_id)
        .filter((id): id is string => !!id);

      setAssignedTenantIds(ids);
    }

    fetchAssignedTenants();
  }, [userId]);

  // Só mostra loading na primeira busca
  const fetchOrders = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      if (!userId || assignedTenantIds.length === 0) {
        prevOrdersRef.current = [];
        setOrders([]);
        setCurrentDelivery(null);
        if (showLoading) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from<Order>('orders')
        .select('*')
        .in('tenant_id', assignedTenantIds);
      if (error) throw error;

      const newOrders = data || [];

      // Verificação de Som no Polling (Fallback Robusto)
      if (!showLoading && prevOrdersRef.current.length > 0) {
        const hasNewPickup = newOrders.some(newOrder => {
          const oldOrder = prevOrdersRef.current.find(o => o.id === newOrder.id);
          // Se o pedido é novo nessa lista OU mudou de status para awaiting_pickup, E não tem motoboy
          const isFresh = !oldOrder || oldOrder.status !== 'awaiting_pickup';
          return newOrder.status === 'awaiting_pickup' && !newOrder.motoboy_id && isFresh;
        });

        if (hasNewPickup) {
          logger.info("Novo pedido detectado via polling (fallback)");
          startAlarm();
          setIsRinging(true);
        }
      }

      // Para o alarme automaticamente se não houver mais pedidos pendentes (ex: alguém pegou)
      const pendingCount = newOrders.filter(o => o.status === 'awaiting_pickup' && !o.motoboy_id).length;
      if (pendingCount === 0 && isRinging) {
        stopAlarm();
        setIsRinging(false);
      }

      prevOrdersRef.current = newOrders;
      setOrders(newOrders);

      // Mostra entrega atual só se for do entregador logado
      const delivery = newOrders.find(order => order.status === 'in_transit' && order.motoboy_id === userId);
      setCurrentDelivery(delivery || null);
    } catch (error) {
      logger.error('Error fetching orders', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [assignedTenantIds, isRinging, userId]);

  useEffect(() => {
    // Primeira busca mostra loading
    fetchOrders(true);

    const subscription = supabase
      .channel(`public:orders:${userId || 'anonymous'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          logger.info('Atualização realtime recebida', { event: payload.eventType });

          // Toca som se for um novo pedido aguardando coleta
          const newOrder = (payload.new ?? null) as Partial<Order> | null;

          if (
            newOrder &&
            newOrder.status === 'awaiting_pickup' &&
            !newOrder.motoboy_id &&
            !!newOrder.tenant_id &&
            assignedTenantIds.includes(newOrder.tenant_id)
          ) {
            logger.info("Novo pedido aguardando coleta - tocando alarme");
            startAlarm();
            setIsRinging(true);
          }

          fetchOrders(false);
        }
      )
      .subscribe();

    // Atualização periódica (fallback)
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000); // Atualiza a cada 10 segundos (fallback)

    return () => {
      supabase.removeChannel(subscription);
      clearInterval(interval);
    };
  }, [assignedTenantIds, fetchOrders, userId]);

  // Efeito para Rastreamento GPS durante a entrega
  useEffect(() => {
    let watchId: number | null = null;

    if (currentDelivery && currentDelivery.id && geolocation.isAvailable()) {
      logger.info('Iniciando rastreamento GPS para o pedido', { orderId: currentDelivery.id });
      
      watchId = geolocation.watchPosition(
        async (pos) => {
          try {
            const { error } = await supabase
              .from('orders')
              .update({
                motoboy_lat: pos.latitude,
                motoboy_lng: pos.longitude
              })
              .eq('id', currentDelivery.id);
            
            if (error) throw error;
            logger.info('Posição GPS atualizada no banco', { lat: pos.latitude, lng: pos.longitude });
          } catch (err) {
            logger.error('Erro ao atualizar posição GPS no banco', err);
          }
        },
        (error) => {
          logger.error('Erro ao capturar posição GPS', error);
        }
      );
    }

    return () => {
      if (watchId !== null) {
        logger.info('Parando rastreamento GPS');
        geolocation.clearWatch(watchId);
      }
    };
  }, [currentDelivery?.id]);

  const acceptOrder = async (orderId: string) => {
    if (!userId) return;
    setUpdating(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const motoboyName = userData?.user?.user_metadata?.name || userData?.user?.email || 'Motoboy';
      const { error } = await supabase
        .from<Order>('orders')
        .update({ motoboy_id: userId, motoboy_name: motoboyName })
        .eq('id', orderId)
        .is('motoboy_id', null); // Só permite se ainda não foi aceito
      if (error) throw error;
    } catch (error) {
      logger.error('Erro ao aceitar pedido', error);
    } finally {
      setUpdating(false);
    }
  };

  const collectOrder = async (orderId: string) => {
    if (!userId) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from<Order>('orders')
        .update({ status: 'in_transit' })
        .eq('id', orderId)
        .eq('motoboy_id', userId);
      if (error) throw error;
    } catch (error) {
      logger.error('Erro ao iniciar coleta', error);
    } finally {
      setUpdating(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from<Order>('orders')
        .update({ status })
        .eq('id', orderId)
        .select();
      if (error) throw error;
      if (status === 'in_transit') {
        setCurrentDelivery(data?.[0] || null);
      } else if (status === 'delivered') {
        setCurrentDelivery(null);
      }
      return data;
    } catch (error) {
      logger.error('Erro ao atualizar status do pedido', error);
    } finally {
      setUpdating(false);
    }
  };

  const markArrived = async (orderId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from<Order>('orders')
        .update({ motoboy_arrived: true })
        .eq('id', orderId);
      if (error) throw error;
    } catch (error) {
      logger.error('Erro ao atualizar chegada do motoboy', error);
    } finally {
      setUpdating(false);
    }
  };

  const completeDelivery = async (orderId: string) => {
    await updateOrderStatus(orderId, 'delivered');
  };

  // Só mostra pedidos disponíveis para aceitar se status = awaiting_pickup e motoboy_id nulo
  const availableOrders = useMemo(() => {
    return orders.filter(order => order.status === 'awaiting_pickup' && !order.motoboy_id);
  }, [orders]);

  const acceptedOrders = useMemo(() => {
    return orders.filter(order => order.status === 'awaiting_pickup' && order.motoboy_id === userId);
  }, [orders, userId]);

  const silenceAlarm = () => {
    stopAlarm();
    setIsRinging(false);
  };

  return { availableOrders, acceptedOrders, currentDelivery, loading, updating, acceptOrder, collectOrder, markArrived, completeDelivery, isRinging, silenceAlarm };
};
