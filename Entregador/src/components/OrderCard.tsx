import React from 'react';
import { Order } from '../lib/supabase';

interface OrderCardProps {
  order: Order;
  onCollect: (orderId: string) => void;
  disabled?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onCollect, disabled }) => {
  // Utilitário para exibir número curto do pedido
  const getShortOrderId = (id: string) => {
    // Se for UUID, pega os últimos 4 caracteres
    if (id.length > 6) return id.slice(-4);
    return id;
  };

  // Labels de pagamento
  const paymentLabels: Record<string, string> = {
    money: 'Dinheiro',
    card: 'Cartão',
    credit: 'Crédito',
    debit: 'Débito',
    pix: 'PIX',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Pedido #{getShortOrderId(order.id)}</h3>
          <p className="text-gray-600 text-sm">Cliente: {order.customer_name}</p>
          <p className="text-gray-600 text-sm">
            Endereço:{' '}
            {order.delivery_address ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                {order.delivery_address}
              </a>
            ) : (
              '-'
            )}
          </p>
          <p className="text-gray-600 text-sm">Itens: {order.items_count}</p>
          <p className="text-gray-600 text-sm">Total: R$ {(order.total_amount ?? 0).toFixed(2)}</p>
          {/* Pagamento */}
          <p className="text-gray-600 text-sm">
            Pagamento: {paymentLabels[order.payment_method] || order.payment_method}
            {order.payment_method === 'money' && order.change_for && (
              <span className="ml-2 text-red-600">Troco para: R$ {Number(order.change_for).toFixed(2)}</span>
            )}
          </p>
        </div>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          {order.status === 'ready' ? 'Pronto para entrega' : order.status}
        </span>
      </div>
      <button
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
        onClick={() => onCollect(order.id)}
        disabled={disabled}
      >
        Coletar Pedido
      </button>
    </div>
  );
};
