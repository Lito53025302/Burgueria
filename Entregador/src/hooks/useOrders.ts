import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../lib/supabase';
import { logger } from '../utils/logger';
import { playNotificationSound, startAlarm, stopAlarm } from '../utils/audio';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState<Order | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isRinging, setIsRinging] = useState(false);
  const prevOrdersRef = import.meta.env.VITE_NO_REF_CHECK ? { current: [] as Order[] } : useMemo(() => ({ current: [] as Order[] }), []); // Ref estável

  // Pega o ID do entregador logado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || null);
    });
  }, []);

  // Só mostra loading na primeira busca
  const fetchOrders = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*');
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
          console.log("🔔 ALERTA VIA POLLING (Fallback)!");
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
  };

  useEffect(() => {
    // Primeira busca mostra loading
    fetchOrders(true);



    const subscription = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          logger.info('Atualização realtime recebida', { event: payload.eventType });
          console.log("🔥 Payload Realtime:", payload);

          // Toca som se for um novo pedido aguardando coleta
          const newOrder = payload.new as any;
          console.log("🔍 Check Som:", { status: newOrder?.status, motoboy_id: newOrder?.motoboy_id });

          if (newOrder && newOrder.status === 'awaiting_pickup' && !newOrder.motoboy_id) {
            console.log("🔔 CONDICAO ACEITA! TOCANDO SOM...");
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
  }, [userId]);

  // Atualiza status e motoboy_id ao coletar
  const collectOrder = async (orderId: string) => {
    if (!userId) return;
    setUpdating(true);
    try {
      // Busca o nome do entregador logado
      const { data: userData } = await supabase.auth.getUser();
      const motoboyName = userData?.user?.user_metadata?.name || userData?.user?.email || 'Motoboy';
      const { error } = await supabase
        .from('orders')
        .update({ status: 'in_transit', motoboy_id: userId, motoboy_name: motoboyName })
        .eq('id', orderId)
        .is('motoboy_id', null); // Só permite se ainda não foi aceito
      if (error) throw error;
    } catch (error) {
      console.error('Error collecting order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('orders')
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
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const markArrived = async (orderId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ motoboy_arrived: true })
        .eq('id', orderId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating motoboy_arrived:', error);
    } finally {
      setUpdating(false);
    }
  };

  const completeDelivery = async (orderId: string) => {
    await updateOrderStatus(orderId, 'delivered');
  };

  // Só mostra pedidos disponíveis para coleta se status = awaiting_pickup e motoboy_id nulo
  const availableOrders = useMemo(() => {
    return orders.filter(order => order.status === 'awaiting_pickup' && !order.motoboy_id);
  }, [orders]);

  const silenceAlarm = () => {
    stopAlarm();
    setIsRinging(false);
  };

  return { availableOrders, currentDelivery, loading, updating, collectOrder, markArrived, completeDelivery, isRinging, silenceAlarm };
};
