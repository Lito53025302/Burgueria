import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    customizations?: string[];
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'awaiting_pickup' | 'in_transit' | 'delivered' | 'cancelled';
  payment_method: string;
  created_at: string;
  tenant_id?: string;
  motoboy_id?: string;
  motoboy_name?: string;
  motoboy_arrived?: boolean;
  won_reward?: boolean;
  reward_description?: string;
}

export function useOrders(tenantId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (showLoading = false) => {
    if (!tenantId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setOrders(data || []);
      logger.info('Pedidos carregados', { count: data?.length || 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pedidos';
      setError(errorMessage);
      logger.error('Erro ao carregar pedidos', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [tenantId]);

  // Carregar pedidos inicialmente e configurar realtime
  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    // Primeira carga
    fetchOrders(true);

    // Configurar subscription realtime
    const channel = supabase
      .channel(`orders:tenant:${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          logger.info('Atualização realtime de pedido', { 
            event: payload.eventType,
            orderId: (payload.new as any)?.id || (payload.old as any)?.id 
          });
          
          // Recarregar pedidos sem mostrar loading
          fetchOrders(false);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info('Inscrito em atualizações realtime de pedidos');
        }
      });

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error: updateError } = await (supabase
        .from('orders')
        .update as any)({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;

      logger.info('Status do pedido atualizado', { orderId, newStatus });
      
      // Atualizar localmente para feedback imediato
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } as Order : order
        )
      );
    } catch (err) {
      logger.error('Erro ao atualizar status do pedido', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refetch: () => fetchOrders(true)
  };
}
