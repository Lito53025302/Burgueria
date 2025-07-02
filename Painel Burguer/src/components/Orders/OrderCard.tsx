import { Clock, User, Phone, MapPin, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Order } from '../../types';

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: string, status: Order['status']) => void;
  maxPrepTime: number;
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', buttonColor: 'bg-blue-600 hover:bg-blue-700' },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', buttonColor: 'bg-green-600 hover:bg-green-700' },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800', buttonColor: 'bg-gray-600 hover:bg-gray-700' },
  awaiting_pickup: { label: 'Aguardando Motoboy', color: 'bg-orange-100 text-orange-800', buttonColor: 'bg-yellow-600 hover:bg-yellow-700' },
  in_transit: { label: 'Em trânsito', color: 'bg-blue-100 text-blue-800', buttonColor: 'bg-blue-600 hover:bg-blue-700' },
  delivered: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', buttonColor: '' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', buttonColor: '' }
};

const paymentMethodLabels = {
  money: 'Dinheiro',
  card: 'Cartão',
  pix: 'PIX'
};

export function OrderCard({ order, onStatusChange, maxPrepTime }: OrderCardProps) {
  const isOverdue = () => {
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const timeDiff = (now.getTime() - orderTime.getTime()) / (1000 * 60); // minutes
    return timeDiff > maxPrepTime && order.status !== 'delivered' && order.status !== 'cancelled';
  };

  // Novo: determina se é entrega (tem endereço preenchido)
  const isEntrega = order.address && String(order.address).trim() !== '';

  // Ajusta o próximo status e label conforme o tipo de entrega
  const getNextStatus = () => {
    switch (order.status) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready':
        // Se for entrega, não muda status aqui (motoboy faz isso)
        // Se for retirada, pode marcar como entregue direto
        return isEntrega ? null : 'delivered';
      default: return null;
    }
  };

  const getNextStatusLabel = () => {
    switch (order.status) {
      case 'pending': return 'Iniciar Preparo';
      case 'preparing': return 'Marcar como Pronto';
      case 'ready':
        if (isEntrega) return 'Chamar o Motoboy';
        return 'Pronto para retirada';
      default: return null;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para formatar o endereço caso seja um objeto
  const formatAddress = (address: any) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    // Se for objeto, monta uma string
    const { street, number, neighborhood, city, zipCode, complement } = address;
    return `${street || ''}, ${number || ''}${complement ? ' - ' + complement : ''} - ${neighborhood || ''}, ${city || ''} ${zipCode ? '- ' + zipCode : ''}`.replace(/(, | - |  )+/g, ' ').trim();
  };

  const nextStatus = getNextStatus();
  const nextStatusLabel = getNextStatusLabel();
  const overdue = isOverdue();

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all border-gray-200 ${overdue ? 'animate-pulse-red' : ''}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
              {/* Exibe o motoboy se o pedido estiver em trânsito */}
              {order.status === 'in_transit' && order.motoboy_id && (
                <div className="flex items-center space-x-1 text-xs text-blue-700 mt-1">
                  <User className="h-3 w-3" />
                  <span>Motoboy: {order.motoboyName || order.motoboy_id}</span>
                </div>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(order.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {order.status === 'in_transit' && order.motoboy_arrived ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Chegou ao local
              </span>
            ) : statusConfig[order.status] ? (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status].color}`}>
                {statusConfig[order.status].label}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Status desconhecido
              </span>
            )}
            {overdue && (
              <p className="text-xs text-red-600 mt-1 font-medium">ATRASADO</p>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {Array.isArray(order.items) && order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">
                {item.quantity}x {item.menuItem ? item.menuItem.name : 'Item desconhecido'}
                {item.notes && <span className="text-gray-500 italic"> - {item.notes}</span>}
              </span>
              <span className="font-medium text-gray-900">
                R$ {item.menuItem ? (item.quantity * item.menuItem.price).toFixed(2) : '0.00'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{formatAddress(order.address)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CreditCard className="h-4 w-4" />
            <span>{paymentMethodLabels[order.paymentMethod]}</span>
          </div>
          {order.paymentMethod === 'money' && order.changeFor && (
            <div className="flex items-center space-x-1 text-red-600 font-semibold">
              <span>Troco para:</span>
              <span>R$ {Number(order.changeFor).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-lg font-bold text-gray-900">
            Total: R$ {order.total.toFixed(2)}
          </div>
          
          <div className="flex items-center space-x-2">
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <button
                onClick={() => onStatusChange(order.id, 'cancelled')}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm flex items-center space-x-1"
              >
                <XCircle className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            )}
            
            {nextStatusLabel && (
              <button
                onClick={() => {
                  if (order.status === 'ready' && isEntrega) {
                    // Atualiza status para 'awaiting_pickup' ao chamar motoboy
                    onStatusChange(order.id, 'awaiting_pickup');
                  } else if (nextStatus) {
                    onStatusChange(order.id, nextStatus);
                  }
                }}
                className={`px-4 py-2 text-white rounded-lg transition-colors text-sm flex items-center space-x-2 ${statusConfig[order.status].buttonColor}`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>{nextStatusLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}