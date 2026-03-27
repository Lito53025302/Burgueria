import { useEffect, useState } from 'react';
import { Utensils, ChefHat, Bike, MapPin, FileText, ExternalLink } from 'lucide-react';
import { useOrderStatus } from '../hooks/useOrderStatus';


interface OrderProgressProps {
  isOpen: boolean;
  onClose: () => void;
  estimatedTime: number;
  orderId?: string | null;
}


const statusToStep = (status: string | undefined) => {
  switch (status) {
    case 'pending':
    case 'preparing':
      return 1;
    case 'ready':
    case 'awaiting_pickup':
      return 2;
    case 'in_transit':
    case 'delivered':
      return 3;
    default:
      return 1;
  }
};

const OrderProgress = ({ isOpen, onClose, estimatedTime, orderId }: OrderProgressProps) => {
  const [timeLeft, setTimeLeft] = useState(estimatedTime);
  const { order } = useOrderStatus(orderId || null);
  const currentStep = statusToStep(order?.status);

  // Status da Nota Fiscal (Adicionado para visualização do cliente)
  const invoiceStatus = (order as any)?.invoice_status;
  const invoiceUrl = (order as any)?.invoice_url;
  const nfeAccessKey = (order as any)?.nfe_access_key;

  const isArrived = order?.motoboy_arrived;

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(estimatedTime);
    const timeInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timeInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 60 * 1000); // 1 minuto
    return () => clearInterval(timeInterval);
  }, [isOpen, estimatedTime]);

  if (!isOpen) return null;

  const steps = [
    {
      icon: ChefHat,
      title: 'Preparando',
      description: 'Seu pedido está sendo preparado com todo cuidado',
    },
    {
      icon: Utensils,
      title: order?.status === 'awaiting_pickup' ? 'Aguardando Coleta' : 'Finalizando',
      description: order?.status === 'awaiting_pickup' ? 'Seu pedido está pronto aguardando o entregador' : 'Adicionando os últimos toques especiais',
    },
    {
      icon: isArrived ? MapPin : Bike,
      title: isArrived ? 'O MOTOBOY CHEGOU!' : 'Saiu para Entrega',
      description: isArrived ? 'Seu pedido está na sua porta!' : 'Seu pedido está a caminho',
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-t-[2rem] md:rounded-3xl p-8 max-w-md w-full text-center border-t md:border border-gray-800 animate-slide-up md:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8">
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-gray-400 mt-2">
            Tempo estimado: {timeLeft} minutos
          </p>
        </div>

        {/* Nota Fiscal Status (Adicionado) */}
        {invoiceStatus === 'issued' && invoiceUrl && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-400">Nota Fiscal Emitida</h4>
                <p className="text-xs text-blue-500/70 truncate w-40">{nfeAccessKey}</p>
              </div>
            </div>
            <a 
              href={invoiceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400"
              title="Visualizar Nota Fiscal"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        )}

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index + 1 === currentStep;
            const isCompleted = index + 1 < currentStep;
            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${isActive ? 'bg-yellow-500/10 border border-yellow-500' :
                  isCompleted ? 'opacity-50' : 'opacity-30'
                  }`}
              >
                <div className={`p-3 rounded-xl ${isActive ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'
                  }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className={`font-bold ${isActive ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderProgress;
