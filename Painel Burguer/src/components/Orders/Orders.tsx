import { useState, useEffect } from 'react';
import { Filter, Clock, AlertTriangle } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { OrderCard } from './OrderCard';
import { Order } from '../../types';
import { supabase } from '../../lib/supabase';

const statusFilters = [
  { value: 'all', label: 'Todos', count: 0 },
  { value: 'pending', label: 'Pendentes', count: 0 },
  { value: 'preparing', label: 'Preparando', count: 0 },
  { value: 'ready', label: 'Prontos', count: 0 },
  { value: 'awaiting_pickup', label: 'Aguardando Motoboy', count: 0 },
  { value: 'in_transit', label: 'Em trânsito', count: 0 },
  { value: 'delivered', label: 'Entregues', count: 0 },
  { value: 'cancelled', label: 'Cancelados', count: 0 },
];

export function Orders() {
  const { orders, updateOrderStatus } = useStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [storeInfo, setStoreInfo] = useState({ tempo_maximo_preparo: 15 });

  useEffect(() => {
    async function fetchStoreInfo() {
      const { data, error } = await supabase
        .from('loja_info')
        .select('tempo_maximo_preparo')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching store info for orders:', error);
      } else if (data) {
        setStoreInfo(data);
      }
    }

    fetchStoreInfo();
  }, []);

  // Calculate counts for each status
  const filtersWithCounts = statusFilters.map(filter => ({
    ...filter,
    count: filter.value === 'all' ? orders.length : orders.filter(order => order.status === filter.value).length
  }));

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  const isOverdue = (order: Order) => {
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const timeDiff = (now.getTime() - orderTime.getTime()) / (1000 * 60); // minutes
    return timeDiff > storeInfo.tempo_maximo_preparo && order.status !== 'delivered' && order.status !== 'cancelled';
  };

  const overdueOrders = orders.filter(isOverdue);
  const activeOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Pedidos</h2>
          <p className="text-gray-600">Acompanhe e gerencie todos os pedidos</p>
        </div>
      </div>

      {/* Alert for overdue orders */}
      {overdueOrders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">
              {overdueOrders.length} pedido(s) atrasado(s)
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedidos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Atrasados</p>
              <p className="text-2xl font-bold text-red-600">{overdueOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Prontos</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'ready').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-50 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrar por status:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filtersWithCounts.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeFilter === filter.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Order Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onStatusChange={updateOrderStatus} 
            maxPrepTime={storeInfo.tempo_maximo_preparo}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum pedido encontrado</p>
        </div>
      )}
    </div>
  );
}