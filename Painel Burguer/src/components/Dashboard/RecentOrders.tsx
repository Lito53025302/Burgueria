import React from 'react';
import { Clock, User, Phone } from 'lucide-react';
import { Order } from '../../types';

interface RecentOrdersProps {
  orders: Order[];
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800' },
  delivered: { label: 'Entregue', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtra pedidos criados nas últimas 24 horas
  const now = new Date();
  const ordersLast24h = orders.filter(order => {
    const created = new Date(order.createdAt);
    return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-50 p-2 rounded-lg">
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h3>
          <p className="text-sm text-gray-600">Últimos 5 pedidos</p>
        </div>
      </div>

      <div className="space-y-4">
        {ordersLast24h.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{order.customerPhone}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {statusConfig[order.status] ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                    {statusConfig[order.status].label}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Status desconhecido
                  </span>
                )}
                <p className="text-sm text-gray-600 mt-1">{formatTime(order.createdAt)}</p>
              </div>
            </div>
            
            <div className="space-y-1 mb-3">
              {Array.isArray(order.items) ? order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.quantity}x {item.menuItem ? item.menuItem.name : 'Item desconhecido'}
                  </span>
                  <span className="text-gray-900 font-medium">
                    R$ {item.menuItem ? (item.quantity * item.menuItem.price).toFixed(2) : '0.00'}
                  </span>
                </div>
              )) : null}
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-bold text-gray-900">
                R$ {order.total.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}