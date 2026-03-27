import { useState, useEffect, useCallback } from 'react';
import { User, Bell, Shield, Store, Palette, Save, CreditCard, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StoreCustomization } from './StoreCustomization';
import { logger } from '../../utils/logger';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [tenantData, setTenantData] = useState({
    id: '',
    name: '',
    email: '',
    subdomain: '',
    logo_url: '',
    accepted_payment_methods: ['money', 'card_delivery', 'pix_delivery'] as string[],
    pix_key: '',
    pix_key_type: 'random' as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
  });
  const [storeInfo, setStoreInfo] = useState({
    id: 1,
    nome: '',
    endereco: '',
    horario_funcionamento: '',
    tempo_maximo_preparo: 15,
    premio_dia: '',
    document_type: 'cpf' as 'cpf' | 'cnpj',
    document_number: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(true);
  const [storeInfoColumns, setStoreInfoColumns] = useState<Set<string>>(new Set());

  // State for notification settings
  const [notificationsSettings, setNotificationsSettings] = useState({
    newOrders: true,
    lateOrders: true,
    dailyReports: false,
    lowStock: true,
  });

  // State for theme
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Aplicar tema ao documento
  useEffect(() => {
    const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
      let effectiveTheme = selectedTheme;

      // Se for 'system', detecta preferência do SO
      if (selectedTheme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      // Aplica classe ao documento
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Salva preferência
      localStorage.setItem('theme', selectedTheme);
    };

    applyTheme(theme);

    // Listener para mudanças no tema do sistema
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Carregar tema salvo ao montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const normalizeStoreInfo = useCallback((data: Partial<typeof storeInfo> | null | undefined) => ({
    id: typeof data?.id === 'number' ? data.id : 1,
    nome: data?.nome ?? '',
    endereco: data?.endereco ?? '',
    horario_funcionamento: data?.horario_funcionamento ?? '',
    tempo_maximo_preparo: typeof data?.tempo_maximo_preparo === 'number' ? data.tempo_maximo_preparo : 15,
    premio_dia: data?.premio_dia ?? '',
    document_type: data?.document_type === 'cnpj' ? 'cnpj' : 'cpf',
    document_number: data?.document_number ?? '',
    latitude: data?.latitude ?? '',
    longitude: data?.longitude ?? '',
  }), []);

  // Load saved settings from localStorage or backend on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // 1. Buscar dados do tenant (usuário logado)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Buscar dados do tenant na tabela tenants usando owner_email
        const { data: tenantInfo } = await supabase
          .from('tenants')
          .select('id, name, subdomain, logo_url, address, city, state, zip_code, opening_time, closing_time, owner_name, owner_phone, accepted_payment_methods, pix_key, pix_key_type')
          .eq('owner_email', user.email)
          .single();
        
        if (tenantInfo) {
          setTenantData({
            id: tenantInfo.id || '',
            name: tenantInfo.name || '',
            email: user.email || '',
            subdomain: tenantInfo.subdomain || '',
            logo_url: tenantInfo.logo_url || '',
            accepted_payment_methods: tenantInfo.accepted_payment_methods || ['money', 'card_delivery', 'pix_delivery'],
            pix_key: tenantInfo.pix_key || '',
            pix_key_type: tenantInfo.pix_key_type || 'random',
          });
          
          // Preencher também os dados da loja com informações do tenant
          setStoreInfo(prev => ({
            ...prev,
            nome: tenantInfo.name || prev.nome,
            endereco: tenantInfo.address || prev.endereco,
            horario_funcionamento: tenantInfo.opening_time && tenantInfo.closing_time 
              ? `${tenantInfo.opening_time} - ${tenantInfo.closing_time}` 
              : prev.horario_funcionamento,
          }));
        } else {
          // Fallback: usar dados do user
          setTenantData({
            name: user.user_metadata?.name || '',
            email: user.email || '',
            subdomain: '',
            logo_url: '',
          });
        }
      }
      
      // 2. Buscar informações da loja (loja_info)
      const { data: storeData, error: storeError } = await supabase
        .from('loja_info')
        .select('*')
        .eq('id', 1)
        .single();

      if (storeError) {
        logger.error('Erro ao carregar informações da loja', storeError);
      } else if (storeData) {
        setStoreInfoColumns(new Set(Object.keys(storeData)));
        setStoreInfo(normalizeStoreInfo(storeData as Partial<typeof storeInfo>));
      }

      const savedSettings = localStorage.getItem('notificationsSettings');
      if (savedSettings) {
        setNotificationsSettings(JSON.parse(savedSettings));
      }

      setLoading(false);
    }

    fetchData();
  }, [normalizeStoreInfo]);

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
      const rawPayload: Record<string, unknown> = {
        nome: storeInfo.nome,
        endereco: storeInfo.endereco,
        horario_funcionamento: storeInfo.horario_funcionamento,
        tempo_maximo_preparo: storeInfo.tempo_maximo_preparo,
        premio_dia: storeInfo.premio_dia,
        document_type: storeInfo.document_type,
        document_number: storeInfo.document_number.replace(/\D/g, ''),
        latitude: storeInfo.latitude ? parseFloat(storeInfo.latitude) : null,
        longitude: storeInfo.longitude ? parseFloat(storeInfo.longitude) : null,
      };

      // Envia somente colunas que existem na tabela (evita spam de PATCH 400)
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([column]) =>
          storeInfoColumns.size === 0 || storeInfoColumns.has(column)
        )
      );

      const { error } = await supabase
        .from('loja_info')
        .update(payload)
        .eq('id', storeInfo.id);

      // Fallback único (sem loop): se ainda houver coluna ausente no schema cache
      if (error?.code === 'PGRST204') {
        const missingColumnMatch = error.message?.match(/Could not find the '([^']+)' column/i);
        const missingColumn = missingColumnMatch?.[1];
        if (missingColumn && missingColumn in payload) {
          const retryPayload = { ...payload };
          delete retryPayload[missingColumn];
          const retryResult = await supabase
            .from('loja_info')
            .update(retryPayload)
            .eq('id', storeInfo.id);

          if (retryResult.error) {
            alert('Erro ao salvar as informações da loja.');
            logger.error('Erro ao atualizar informações da loja', retryResult.error);
          } else {
            alert('Informações da loja salvas com sucesso!');
          }
          return;
        }
      }

      if (error) {
        alert('Erro ao salvar as informações da loja.');
        logger.error('Erro ao atualizar informações da loja', error);
      } else {
        alert('Informações da loja salvas com sucesso!');
      }
    } else if (activeTab === 'payments') {
      const { error } = await supabase
        .from('tenants')
        .update({
          accepted_payment_methods: tenantData.accepted_payment_methods,
          pix_key: tenantData.pix_key,
          pix_key_type: tenantData.pix_key_type,
        })
        .eq('id', tenantData.id);

      if (error) {
        alert('Erro ao salvar as configurações de pagamento.');
        logger.error('Erro ao atualizar configurações de pagamento', error);
      } else {
        alert('Configurações de pagamento salvas com sucesso!');
      }
    } else if (activeTab === 'profile') {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: tenantData.name,
        })
        .eq('id', tenantData.id);

      if (error) {
        alert('Erro ao salvar o perfil.');
        logger.error('Erro ao atualizar perfil', error);
      } else {
        alert('Perfil salvo com sucesso!');
      }
    } else {
      // For other tabs, you can add their save logic here
      alert('Configurações salvas!');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'store', label: 'Loja', icon: Store },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'customization', label: 'Personalização', icon: Palette },
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
                  value={tenantData.name}
                  onChange={(e) => setTenantData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nome da loja"
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
                  placeholder="Ex: Mini pizza napolitano"
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
                  value={tenantData.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed sm:text-sm"
                  title="Email não pode ser alterado"
                />
                <p className="mt-1 text-xs text-gray-500">
                  O email não pode ser alterado por questões de segurança
                </p>
              </div>
              {tenantData.subdomain && (
                <div>
                  <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                    Subdomínio
                  </label>
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={tenantData.subdomain}
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Seu link: <a href={`/${tenantData.subdomain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      /{tenantData.subdomain}
                    </a>
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Foto de Perfil
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {tenantData.logo_url ? (
                  <img 
                    src={tenantData.logo_url} 
                    alt="Logo da loja" 
                    className="h-16 w-16 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                    onError={(e) => {
                      // Se a imagem falhar ao carregar, mostra o fallback
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                ) : null}
                <span 
                  className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"
                  style={{ display: tenantData.logo_url ? 'none' : 'flex' }}
                >
                  <svg className="h-10 w-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </span>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('customization')}
                    className="px-4 py-2 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                  >
                    {tenantData.logo_url ? 'Alterar Logo' : 'Adicionar Logo'}
                  </button>
                  <p className="mt-1 text-xs text-gray-500">
                    {tenantData.logo_url 
                      ? 'Clique para alterar o logo da loja' 
                      : 'Adicione um logo para personalizar sua loja'}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 A edição de logo e banner está em <strong>Configurações &gt; Personalização</strong>.
              </p>
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

            {/* CPF/CNPJ Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📄 CPF ou CNPJ
              </label>

              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setStoreInfo(prev => ({ ...prev, document_type: 'cpf', document_number: '' }));
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${storeInfo.document_type === 'cpf'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  CPF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStoreInfo(prev => ({ ...prev, document_type: 'cnpj', document_number: '' }));
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${storeInfo.document_type === 'cnpj'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  CNPJ
                </button>
              </div>

              <input
                type="text"
                  value={storeInfo.document_number || ''}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');

                  // Aplicar máscara
                  if (storeInfo.document_type === 'cpf') {
                    value = value.substring(0, 11);
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                  } else {
                    value = value.substring(0, 14);
                    value = value.replace(/(\d{2})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1/$2');
                    value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
                  }

                  setStoreInfo(prev => ({ ...prev, document_number: value }));
                }}
                placeholder={storeInfo.document_type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {storeInfo.document_type === 'cpf'
                  ? 'CPF do proprietário'
                  : 'CNPJ da empresa'
                }
              </p>
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

            {/* Campos de Geolocalização */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                  📍 Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={storeInfo.latitude || ''}
                  onChange={handleStoreInfoChange}
                  placeholder="-23.5505"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ex: -23.5505 (use ponto, não vírgula)
                </p>
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                  📍 Longitude
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={storeInfo.longitude || ''}
                  onChange={handleStoreInfoChange}
                  placeholder="-46.6333"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ex: -46.6333 (use ponto, não vírgula)
                </p>
              </div>
            </div>

            {/* Dica para obter coordenadas */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Para obter as coordenadas da sua loja:
              </p>
              <ol className="mt-2 text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Abra o <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Maps</a></li>
                <li>Procure o endereço da sua loja</li>
                <li>Clique com o botão direito no local exato</li>
                <li>Clique nas coordenadas que aparecem no topo</li>
                <li>Cole aqui os valores (latitude e longitude)</li>
              </ol>
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

      case 'customization':
        return <StoreCustomization />;

      case 'payments':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Métodos de Pagamento Aceitos
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Selecione os métodos que seus clientes poderão escolher no checkout.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'money', label: 'Dinheiro (Pagamento na Entrega)', desc: 'Cliente paga em espécie ao entregador.' },
                  { id: 'card_delivery', label: 'Maquininha (Pagamento na Entrega)', desc: 'O entregador deve levar a maquininha de cartão.' },
                  { id: 'pix_delivery', label: 'PIX (Pagamento na Entrega)', desc: 'Cliente faz o PIX direto para você no ato da entrega.' },
                  { id: 'pix_online', label: 'PIX Online (Automático)', desc: 'Pagamento via Mercado Pago ou Gateway configurado.' },
                  { id: 'card_online', label: 'Cartão Online (App)', desc: 'Pagamento via Cartão de Crédito direto pelo App.' },
                ].map((method) => (
                  <label 
                    key={method.id}
                    className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      tenantData.accepted_payment_methods.includes(method.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={tenantData.accepted_payment_methods.includes(method.id)}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...tenantData.accepted_payment_methods, method.id]
                          : tenantData.accepted_payment_methods.filter(m => m !== method.id);
                        setTenantData(prev => ({ ...prev, accepted_payment_methods: methods }));
                      }}
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-bold text-gray-900">{method.label}</span>
                      <span className="block text-xs text-gray-500">{method.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Configuração de PIX Direto
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Informe sua chave PIX para que o cliente possa pagar diretamente para sua conta (usado em "PIX na Entrega").
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Chave</label>
                  <select
                    value={tenantData.pix_key_type}
                    onChange={(e) => setTenantData(prev => ({ ...prev, pix_key_type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Chave Aleatória</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sua Chave PIX</label>
                  <input
                    type="text"
                    value={tenantData.pix_key}
                    onChange={(e) => setTenantData(prev => ({ ...prev, pix_key: e.target.value }))}
                    placeholder="Sua chave aqui..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
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
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${theme === 'light'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  Claro
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  Escuro
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${theme === 'system'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  Sistema
                </button>
              </div>

              {theme === 'system' && (
                <p className="text-xs text-gray-500 mt-2">
                  ℹ️ Seguirá as preferências do seu sistema operacional
                </p>
              )}
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
                  className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
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
          <div key={activeTab}>
            {renderTabContent()}
          </div>

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
