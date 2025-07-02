import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useOrderStatus(orderId: string | null) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let isMounted = true;

    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (isMounted) {
        if (!error) setOrder(data);
        setLoading(false);
      }
    };

    fetchOrder();
    // Realtime updates
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, fetchOrder)
      .subscribe();
    // Polling fallback
    const interval = setInterval(fetchOrder, 3000);

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [orderId]);

  return { order, loading };
}
