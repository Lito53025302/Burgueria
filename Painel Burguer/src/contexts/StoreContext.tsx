import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem, Order, DashboardStats, StoreStatus } from '../types';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

interface StoreContextType {
  menuItems: MenuItem[];
  orders: Order[];
  storeStatus: StoreStatus;
  dashboardStats: DashboardStats;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'soldCount'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  toggleStoreStatus: () => void;
  getFilteredOrders: (status?: Order['status']) => Order[];
  refreshStats: () => void;
  getVisibleOrders: () => Order[]; // <-- novo método
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock data
const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mozzarella, manjericão fresco',
    price: 32.90,
    image: 'https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Pizza',
    available: true,
    soldCount: 87,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Hambúrguer Artesanal',
    description: 'Carne 180g, queijo cheddar, bacon, alface, tomate',
    price: 28.50,
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Hambúrguer',
    available: true,
    soldCount: 156,
    createdAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    name: 'Salada Caesar',
    description: 'Alface romana, croutons, parmesão, molho caesar',
    price: 22.90,
    image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Salada',
    available: true,
    soldCount: 43,
    createdAt: '2024-01-20T09:15:00Z'
  },
  {
    id: '4',
    name: 'Lasanha Bolonhesa',
    description: 'Massa artesanal, molho bolonhesa, queijos',
    price: 35.90,
    image: 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Massas',
    available: false,
    soldCount: 72,
    createdAt: '2024-01-05T16:45:00Z'
  }
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [orders, setOrders] = useState<Order[]>([]); // Começa vazio
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    isOpen: true,
    openingTime: '18:00',
    closingTime: '23:00',
    lastUpdated: new Date().toISOString()
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 25847.60,
    totalOrders: 342,
    completedOrders: 298,
    cancelledOrders: 15,
    averageOrderValue: 75.58,
    dailyRevenue: [1250, 1480, 1320, 1650, 1890, 2100, 1750],
    weeklyRevenue: [8500, 9200, 7800, 8900, 9500, 8200, 7600],
    monthlyRevenue: [15000, 18000, 22000, 25000, 28000, 24000],
    topSellingItems: mockMenuItems.sort((a, b) => b.soldCount - a.soldCount).slice(0, 5),
    recentOrders: [] // Corrigido: não usa mais mockOrders
  });

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'createdAt' | 'soldCount'>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          ...item,
          sold_count: 0
        }])
        .select();

      if (error) throw error;
      if (data) {
        setMenuItems(prev => [...prev, data[0] as MenuItem]);
      }
    } catch (error) {
      logger.error('Erro ao adicionar item ao cardápio', error);
      alert('Erro ao adicionar item.');
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setMenuItems(prev => prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (error) {
      logger.error('Erro ao atualizar item do cardápio', error);
      alert('Erro ao atualizar item.');
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      logger.error('Erro ao excluir item do cardápio', error);
      alert('Erro ao excluir item.');
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    logger.debug('Atualizando status do pedido', { orderId: id, newStatus: status });
    // Atualiza no Supabase
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
    if (error) {
      logger.error('Erro ao atualizar status do pedido', error);
      alert('Erro ao atualizar status do pedido.');
      return;
    }
    // Atualiza no estado local
    setOrders(prev => prev.map(order =>
      order.id === id ? { ...order, status } : order
    ));
    logger.info('Status do pedido atualizado com sucesso', { orderId: id, status });
  };

  const toggleStoreStatus = () => {
    setStoreStatus(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      lastUpdated: new Date().toISOString()
    }));
  };

  const getFilteredOrders = (status?: Order['status']) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  // Retorna apenas pedidos "visíveis" (menos de 24h OU não enviados)
  const getVisibleOrders = () => {
    const now = new Date();
    return orders.filter(order => {
      // Considera enviado se status for 'delivered' ou 'cancelled'
      const enviado = order.status === 'delivered' || order.status === 'cancelled';
      const criadoEm = new Date(order.createdAt);
      const diffHoras = (now.getTime() - criadoEm.getTime()) / (1000 * 60 * 60);
      // Se não enviado, sempre mostra. Se enviado, só mostra se <24h
      return !enviado || diffHoras < 24;
    });
  };

  const refreshStats = () => {
    // Recalculate stats based on current data
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);

    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

    setDashboardStats(prev => ({
      ...prev,
      totalRevenue,
      totalOrders: orders.length,
      completedOrders,
      cancelledOrders,
      averageOrderValue: totalRevenue / (completedOrders || 1),
      // Mantém os arrays de gráficos (mock data)
      dailyRevenue: prev.dailyRevenue,
      weeklyRevenue: prev.weeklyRevenue,
      monthlyRevenue: prev.monthlyRevenue,
      topSellingItems: menuItems.sort((a, b) => b.soldCount - a.soldCount).slice(0, 5),
      recentOrders: orders.slice(0, 5)
    }));
  };

  // Buscar itens do cardápio e pedidos reais do Supabase ao iniciar
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchMenuItems() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');

      if (error) {
        logger.error('Erro ao buscar itens do cardápio', error);
        return;
      }

      if (data) {
        const mappedItems = data.map((item: any) => ({
          ...item,
          soldCount: item.sold_count,
          createdAt: item.created_at
        }));
        setMenuItems(mappedItems as MenuItem[]);
      }
    }

    async function fetchOrders() {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) {
        logger.error('Erro ao buscar pedidos do Supabase', error);
        return;
      }
      // Mapeamento dos campos do Supabase para o formato esperado pelo frontend
      const mappedOrders = (data || []).map((order: any) => ({
        id: order.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
        estimatedTime: order.estimated_time,
        address: order.address,
        paymentMethod: order.payment_method,
        changeFor: order.change_for,
        motoboy_id: order.motoboy_id,
        motoboyName: order.motoboy_name, // se existir na tabela, senão ficará undefined
        motoboy_arrived: order.motoboy_arrived,
      }));
      setOrders(mappedOrders);
    }

    fetchMenuItems();
    fetchOrders();
    // Polling: busca pedidos a cada 10 segundos (fallback)
    intervalId = setInterval(fetchOrders, 10000);

    // Subscribe realtime para atualizar automaticamente
    const channel = supabase.channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          logger.info('Atualização realtime recebida', { event: payload.eventType });
          fetchOrders();
        }
      )
      .subscribe((status) => {
        logger.debug('Status da conexão Realtime', { status });
      });

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    refreshStats();
  }, [orders, menuItems]);

  return (
    <StoreContext.Provider value={{
      menuItems,
      orders,
      storeStatus,
      dashboardStats,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      updateOrderStatus,
      toggleStoreStatus,
      getFilteredOrders,
      refreshStats,
      getVisibleOrders // <-- novo método
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}