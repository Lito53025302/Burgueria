import React from 'react';
import { Order } from '../lib/supabase';
import { Gift } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onAction: (orderId: string) => void;
  actionLabel: string;
  disabled?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onAction, actionLabel, disabled }) => {
  // Utilitário para exibir número curto do pedido
  const getShortOrderId = (id: string) => {
    // Se for UUID, pega os últimos 4 caracteres
    if (id.length > 6) return id.slice(-4);
    return id;
  };

  // Labels de pagamento
  const paymentLabels: Record<string, string> = {
    money: 'Dinheiro (Entrega)',
    card_delivery: 'Cartão (Entrega)',
    pix_delivery: 'PIX (Entrega)',
    pix_online: 'PIX (Online)',
    card_online: 'Cartão (Online)',
    pix: 'PIX', // Legado
    card: 'Cartão', // Legado
    credit: 'Crédito', // Legado
    debit: 'Débito' // Legado
  };

  const paymentLabel = order.payment_method ? paymentLabels[order.payment_method] : 'Indefinido';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
      {/* Aviso de Brinde */}
      {order.won_reward && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center gap-3 mb-2">
          <Gift className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-yellow-800 uppercase">🎁 BRINDE NO PEDIDO!</p>
            <p className="text-yellow-900 font-semibold">{order.reward_description || 'Brinde do Jogo'}</p>
          </div>
        </div>
      )}

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
            Pagamento: {paymentLabel}
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
        onClick={() => onAction(order.id)}
        disabled={disabled}
      >
        {actionLabel}
      </button>
    </div>
  );
};
