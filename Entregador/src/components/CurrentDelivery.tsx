import React from 'react';
import { Order } from '../lib/supabase';

interface CurrentDeliveryProps {
  order: Order;
  onMarkArrived: (orderId: string) => void;
  onCompleteDelivery: (orderId: string) => void;
  disabled?: boolean;
}

export const CurrentDelivery: React.FC<CurrentDeliveryProps> = ({ order, onMarkArrived, onCompleteDelivery, disabled }) => {
  return (
    <div className="bg-white rounded-xl border border-blue-200 p-4 flex flex-col gap-2" data-testid="current-delivery">
      <div>
        <h3 className="font-bold text-lg text-blue-900">Pedido #{order.id}</h3>
        <p className="text-gray-600 text-sm">Cliente: {order.customer_name}</p>
        <p className="text-gray-600 text-sm">Endereço: {order.delivery_address}</p>
        <p className="text-gray-600 text-sm">Itens: {order.items_count}</p>
        <p className="text-gray-600 text-sm">Total: R$ {order.total_amount.toFixed(2)}</p>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50"
          onClick={() => onMarkArrived(order.id)}
          disabled={disabled}
        >
          Cheguei ao destino
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
          onClick={() => onCompleteDelivery(order.id)}
          disabled={disabled}
        >
          Finalizar Entrega
        </button>
      </div>
    </div>
  );
};
