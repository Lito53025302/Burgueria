import React from 'react';
import { Store, Clock, Settings, Calendar } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

export function StoreStatus() {
  const { storeStatus, toggleStoreStatus } = useStore();

  const formatLastUpdated = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Status da Loja</h2>
        <p className="text-gray-600">Controle o funcionamento da sua loja</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Control */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-lg ${storeStatus.isOpen ? 'bg-green-50' : 'bg-red-50'}`}>
              <Store className={`h-6 w-6 ${storeStatus.isOpen ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status Atual</h3>
              <p className="text-sm text-gray-600">Controle se a loja está aceitando pedidos</p>
            </div>
          </div>

          <div className="text-center py-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              storeStatus.isOpen ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Store className={`h-12 w-12 ${storeStatus.isOpen ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            
            <h4 className={`text-2xl font-bold mb-2 ${
              storeStatus.isOpen ? 'text-green-600' : 'text-red-600'
            }`}>
              {storeStatus.isOpen ? 'LOJA ABERTA' : 'LOJA FECHADA'}
            </h4>
            
            <p className="text-gray-600 mb-6">
              {storeStatus.isOpen 
                ? 'Sua loja está recebendo pedidos normalmente' 
                : 'Sua loja não está aceitando novos pedidos'
              }
            </p>

            <button
              onClick={toggleStoreStatus}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                storeStatus.isOpen
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {storeStatus.isOpen ? 'Fechar Loja' : 'Abrir Loja'}
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Última atualização:</span>
              <span className="font-medium">{formatLastUpdated(storeStatus.lastUpdated)}</span>
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Horário de Funcionamento</h3>
              <p className="text-sm text-gray-600">Configure os horários da sua loja</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">Segunda a Domingo</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {storeStatus.openingTime} - {storeStatus.closingTime}
                </div>
                <div className="text-sm text-gray-600">Horário padrão</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Abertura
                </label>
                <input
                  type="time"
                  value={storeStatus.openingTime}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Fechamento
                </label>
                <input
                  type="time"
                  value={storeStatus.closingTime}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurar Horários</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Histórico de Status</h3>
            <p className="text-sm text-gray-600">Últimas alterações no status da loja</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { time: '25/01/2024 19:30', action: 'Loja aberta', user: 'Administrador' },
            { time: '25/01/2024 12:00', action: 'Loja fechada', user: 'Administrador' },
            { time: '25/01/2024 08:00', action: 'Loja aberta', user: 'Sistema' },
            { time: '24/01/2024 23:00', action: 'Loja fechada', user: 'Sistema' },
          ].map((entry, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  entry.action.includes('aberta') ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-gray-900">{entry.action}</span>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>{entry.time}</div>
                <div>por {entry.user}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}