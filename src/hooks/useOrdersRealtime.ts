import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'awaiting_pickup' | 'in_transit' | 'delivered' | 'cancelled';
  payment_method: string;
  created_at: string;
  tenant_id?: string;
  motoboy_id?: string;
  motoboy_name?: string;
}

export function useOrdersRealtime(customerId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (showLoading = false) => {
    if (!customerId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      logger.info('Pedidos do cliente carregados', { count: data?.length || 0 });
    } catch (err) {
      logger.error('Erro ao carregar pedidos do cliente', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    // Primeira carga
    fetchOrders(true);

    // Configurar subscription realtime
    const channel = supabase
      .channel(`orders:customer:${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${customerId}`
        },
        (payload) => {
          logger.info('Atualização realtime de pedido do cliente', { 
            event: payload.eventType 
          });
          
          // Recarregar pedidos
          fetchOrders(false);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info('Inscrito em atualizações realtime de pedidos do cliente');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId, fetchOrders]);

  return { orders, loading, refetch: () => fetchOrders(true) };
}
