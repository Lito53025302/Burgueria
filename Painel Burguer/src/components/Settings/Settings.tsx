import { useState, useEffect } from 'react';
import { User, Bell, Shield, Store, Palette, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [storeInfo, setStoreInfo] = useState({
    id: 1,
    nome: '',
    endereco: '',
    horario_funcionamento: '',
    tempo_maximo_preparo: 15, // Add new field
    premio_dia: '', // Novo campo
  });
  const [loading, setLoading] = useState(true);

  // State for notification settings
  const [notificationsSettings, setNotificationsSettings] = useState({
    newOrders: true,
    lateOrders: true,
    dailyReports: false,
    lowStock: true,
  });

  // Load saved settings from localStorage or backend on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: storeData, error: storeError } = await supabase
        .from('loja_info')
        .select('*')
        .eq('id', 1)
        .single();

      if (storeError) {
        console.error('Error fetching store info:', storeError);
        alert('Erro ao carregar as informações da loja.');
      } else if (storeData) {
        setStoreInfo(storeData);
      }

      const savedSettings = localStorage.getItem('notificationsSettings');
      if (savedSettings) {
        setNotificationsSettings(JSON.parse(savedSettings));
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  // Save settings to localStorage or backend when changed
  useEffect(() => {
    localStorage.setItem('notificationsSettings', JSON.stringify(notificationsSettings));
  }, [notificationsSettings]);

  const handleNotificationChange = (key: string) => {
    setNotificationsSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleStoreInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (activeTab === 'store') {
      const { error } = await supabase
        .from('loja_info')
        .update({
          nome: storeInfo.nome,
          endereco: storeInfo.endereco,
          horario_funcionamento: storeInfo.horario_funcionamento,
          tempo_maximo_preparo: storeInfo.tempo_maximo_preparo, // Save new field
          premio_dia: storeInfo.premio_dia,
        })
        .eq('id', storeInfo.id);

      if (error) {
        alert('Erro ao salvar as informações da loja.');
        console.error('Error updating store info:', error);
      } else {
        alert('Informações da loja salvas com sucesso!');
      }
    } else {
      // For other tabs, you can add their save logic here
      alert('Configurações salvas!');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'store', label: 'Loja', icon: Store },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
  ];

  const renderTabContent = () => {
    if (loading) {
      return <div>Carregando...</div>;
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  defaultValue="Admin"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="premio_dia" className="block text-sm font-medium text-gray-700">
                  Prêmio do Dia (Jogo Cronômetro)
                </label>
                <input
                  type="text"
                  id="premio_dia"
                  name="premio_dia"
                  value={storeInfo.premio_dia}
                  onChange={handleStoreInfoChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ex: 1 Milkshake grátis, 10% de desconto, etc."
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue="admin@burgueria.com"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Foto de Perfil
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.993A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                <button
                  type="button"
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Alterar
                </button>
              </div>
            </div>
          </div>
        );

      case 'store':
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  id="storeName"
                  name="nome"
                  value={storeInfo.nome}
                  onChange={handleStoreInfoChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="tempo_maximo_preparo" className="block text-sm font-medium text-gray-700">
                  Tempo Máximo de Preparo (min)
                </label>
                <input
                  type="number"
                  id="tempo_maximo_preparo"
                  name="tempo_maximo_preparo"
                  value={storeInfo.tempo_maximo_preparo}
                  onChange={handleStoreInfoChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700">
                Endereço
              </label>
              <input
                  type="text"
                  id="storeAddress"
                  name="endereco"
                  value={storeInfo.endereco}
                  onChange={handleStoreInfoChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
             <div>
                <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700">
                  Horário de Funcionamento
                </label>
                <input
                  type="text"
                  id="openingHours"
                  name="horario_funcionamento"
                  value={storeInfo.horario_funcionamento}
                  onChange={handleStoreInfoChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Novos Pedidos</h4>
                  <p className="text-sm text-gray-600">Receber notificação quando um novo pedido for feito</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsSettings.newOrders}
                  onChange={() => handleNotificationChange('newOrders')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Pedidos Atrasados</h4>
                  <p className="text-sm text-gray-600">Alertar sobre pedidos que estão atrasados</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsSettings.lateOrders}
                  onChange={() => handleNotificationChange('lateOrders')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Relatórios Diários</h4>
                  <p className="text-sm text-gray-600">Receber resumo diário de vendas por email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsSettings.dailyReports}
                  onChange={() => handleNotificationChange('dailyReports')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Estoque Baixo</h4>
                  <p className="text-sm text-gray-600">Alertar quando itens estão com estoque baixo</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsSettings.lowStock}
                  onChange={() => handleNotificationChange('lowStock')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Senha Atual
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nova Senha
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Autenticação de Dois Fatores (2FA)</h4>
                  <p className="text-sm text-gray-600">Adicione uma camada extra de segurança à sua conta.</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Ativar
                </button>
              </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Tema</h4>
              <p className="text-sm text-gray-600">Personalize a aparência do painel.</p>
              <div className="mt-4 flex items-center space-x-4">
                <button className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 font-medium">
                  Claro
                </button>
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium">
                  Escuro
                </button>
                 <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium">
                  Sistema
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {renderTabContent()}

          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
