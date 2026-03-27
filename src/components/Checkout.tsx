import { useState, useEffect } from 'react';
import { X, MapPin, CreditCard, Clock, CheckCircle, User, Phone, Home, Plus, Ticket, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { supabase } from '../lib/supabase';
import OrderProgress from './OrderProgress';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useStoreTenant } from '../hooks/useStoreTenant';
import { useCepLookup } from '../hooks/useCepLookup';
import { useCoupons } from '../hooks/useCoupons';
import { paymentService } from '../services/paymentService';
import { customerSchema, orderSchema } from '../lib/schemas';
import { z } from 'zod';
import { logger } from '../utils/logger';

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
}

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  onOrderComplete: (amount: number, orderId?: string) => void;
  isStoreOpen: boolean;
}

interface ProfileData {
  name?: string;
  phone?: string;
  address?: Address;
}

const Checkout = ({ isOpen, onClose, items, totalPrice, onOrderComplete, isStoreOpen }: CheckoutProps) => {
  const { user } = useCustomerAuth();
  const { tenant } = useStoreTenant();
  const [step, setStep] = useState(1); // 1: Dados, 2: Pagamento, 3: Confirmação
  const [orderData, setOrderData] = useState<{
    name: string;
    phone: string;
    cpf: string;
    address: Address;
    paymentMethod: string;
    deliveryTime: string;
    changeFor?: string;
  }>({
    name: '',
    phone: '',
    cpf: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      zipCode: ''
    },
    paymentMethod: 'credit',
    deliveryTime: 'normal',
    changeFor: ''
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState('');
  const [cpf, setCpf] = useState('');
  const { searchCep, formatCep, loading: cepLoading, error: cepError, clearError: clearCepError } = useCepLookup();
  const { 
    validateCoupon, 
    calculateDiscount, 
    removeCoupon, 
    appliedCoupon, 
    loading: couponLoading, 
    error: couponError 
  } = useCoupons(tenant?.id || null);

  // Carregar dados iniciais do usuário logado
  useEffect(() => {
    if (isOpen && user) {
      const metadata = user.user_metadata;
      setOrderData(prev => ({
        ...prev,
        name: metadata?.name || '',
        phone: metadata?.phone || '',
      }));

      // Buscar perfil completo no banco (incluindo endereço salvo)
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data as ProfileData);
          if (data.address) {
            setOrderData(prev => ({
              ...prev,
              address: data.address
            }));
            setUseNewAddress(false);
          } else {
            setUseNewAddress(true);
          }
        }
      };

      fetchProfile();
    }
  }, [isOpen, user]);

  // Atualiza endereço no resumo após login/cadastro
  useEffect(() => {
    if (profile) {
      setOrderData(prev => ({
        ...prev,
        name: prev.name || profile.name || '',
        phone: prev.phone || profile.phone || '',
        address: profile.address || {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          zipCode: ''
        }
      }));
    }
  }, [profile]);

  // Recupera o último pedido salvo ao abrir o app/modal



  const deliveryFee = 8.99;
  const serviceFee = 0.50; // Taxa de serviço por pedido
  const discount = appliedCoupon ? calculateDiscount(totalPrice, appliedCoupon) : 0;
  const finalTotal = totalPrice + deliveryFee + serviceFee - discount;

  // Calcula o valor total do pedido
  const getOrderTotal = () => {
    let total = totalPrice + deliveryFee + serviceFee - discount;
    if (orderData.deliveryTime === 'fast') total += 5;
    return total;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setOrderData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField as keyof Address]: value }
      }));
    } else {
      setOrderData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCepSearch = async (cep: string) => {
    const data = await searchCep(cep);

    if (data) {
      setOrderData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          street: data.logradouro || prev.address.street,
          neighborhood: data.bairro || prev.address.neighborhood,
          city: data.localidade || prev.address.city,
          zipCode: formatCep(data.cep)
        }
      }));
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCep(value);
    handleInputChange('address.zipCode', formatted);
    clearCepError();

    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      handleCepSearch(cleanCep);
    }
  };

  const formatCpf = (value: string) => {
    const clean = value.replace(/\D/g, '');
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCpf(value);
    setCpf(formatted);
    handleInputChange('cpf', formatted);
  };

  if (!isOpen) return null;

  const getActiveAddress = () => {
    if (!useNewAddress && profile?.address?.street) {
      return profile.address;
    }
    return orderData.address;
  };

  const handleNextStep = () => {
    if (!isStoreOpen) {
      alert('A loja está fechada no momento.');
      return;
    }
    if (step === 1) {
      if (validateStep1()) {
        setStep(step + 1);
      } else {
        logger.warn('Tentativa de avançar step 1 com dados inválidos', { errors });
      }
    } else if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  /* 
   * Validação Final e Envio do Pedido
   */
  const handleFinishOrder = async () => {
    if (!user) {
      alert("Você precisa estar logado para finalizar o pedido.");
      return;
    }
    if (!isStoreOpen) {
      alert('A loja está fechada no momento.');
      return;
    }
    if (!tenant?.id) {
      alert('Não foi possível identificar a loja. Recarregue a página e tente novamente.');
      return;
    }

    const totalAmount = finalTotal + (orderData.deliveryTime === 'fast' ? 5 : 0);
    const activeAddress = getActiveAddress();
    const fullAddress = `${activeAddress.street}, ${activeAddress.number}${activeAddress.complement ? ' - ' + activeAddress.complement : ''} - ${activeAddress.neighborhood}, ${activeAddress.city} - ${activeAddress.zipCode}`;

    // Validação de segurança final antes do envio
    try {
      orderSchema.parse({
        items: items,
        total: totalAmount,
        paymentMethod: orderData.paymentMethod,
        changeFor: orderData.changeFor,
        deliveryAddress: fullAddress
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Tentativa de finalizar pedido inválido', error);
        alert('Dados do pedido inválidos: ' + error.errors.map((e) => e.message).join(', '));
        return;
      }
    }

    setIsProcessing(true);
    try {
      // Se 'Salvar Endereço' estiver marcado, atualiza o perfil do usuário
      if (saveAddress) {
        await supabase
          .from('profiles')
          .update({
            address: activeAddress,
            phone: orderData.phone,
            name: orderData.name,
            cpf: orderData.cpf
          })
          .eq('id', user.id);
      }

      // Salvar pedido no Supabase
      const { data: orderInsertData, error } = await supabase.from('orders').insert([
        {
          cliente_id: user.id,
          customer_name: orderData.name,
          customer_phone: orderData.phone,
          customer_cpf: orderData.cpf, // Adicionado para NF-e
          items: JSON.stringify(items),
          status: 'pending',
          total: totalAmount,
          tenant_id: tenant.id,
          address: fullAddress,
          payment_method: orderData.paymentMethod,
          payment_status: ['pix_online', 'card_online'].includes(orderData.paymentMethod) ? 'pending' : 'awaiting_payment',
          change_for: orderData.paymentMethod === 'money' ? orderData.changeFor : null,
          created_at: new Date().toISOString(),
          // CAMPOS DE CUPOM
          coupon_id: appliedCoupon?.id || null,
          discount_amount: discount,
          // CAMPOS PARA O APP DO ENTREGADOR
          delivery_address: fullAddress,
          items_count: items.length,
          total_amount: getOrderTotal()
        }
      ]).select();

      if (error) throw error;

      // Salva o ID do pedido criado para o progresso real
      const newOrderId = orderInsertData?.[0]?.id ? String(orderInsertData[0].id) : null;
      setLastOrderId(newOrderId);

      // Se for pagamento online (PIX ou Cartão), criar preferência no Mercado Pago
      if (newOrderId && (orderData.paymentMethod === 'pix_online' || orderData.paymentMethod === 'card_online')) {
        const preference = await paymentService.createPreference(newOrderId, items, totalAmount);
        if (preference) {
          // Redireciona para o checkout do Mercado Pago
          // Em um app real, poderíamos usar o SDK do Mercado Pago para abrir um Modal (Brick)
          window.location.href = preference.sandbox_init_point;
          return;
        }
      }

      if (newOrderId) {
        try {
          localStorage.setItem('lastOrderId', newOrderId);
        } catch (storageError) {
          logger.debug('Não foi possível salvar lastOrderId no localStorage', { storageError });
        }
      }

      // Simular processamento visual
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsProcessing(false);
      setOrderCompleted(true);

      setTimeout(() => {
        setOrderCompleted(false);
        setShowProgress(true);
        onOrderComplete(totalAmount, newOrderId || undefined);
      }, 3000);
    } catch (error) {
      logger.error('Erro ao finalizar pedido', error);
      setIsProcessing(false);
      alert('Erro ao salvar pedido: ' + (error instanceof Error ? error.message : 'Tente novamente.'));
    }
  };

  const handleProgressClose = () => {
    setShowProgress(false);
    onOrderComplete();
    onClose();
    setStep(1);
    try {
      localStorage.removeItem('lastOrderId');
    } catch (storageError) {
      logger.debug('Não foi possível remover lastOrderId do localStorage', { storageError });
    }
  };



  const validateStep1 = () => {
    try {
      const activeAddress = getActiveAddress();
      customerSchema.parse({
        name: orderData.name,
        phone: orderData.phone,
        address: `${activeAddress.street}, ${activeAddress.number}, ${activeAddress.neighborhood}, ${activeAddress.city}, ${activeAddress.zipCode}`
      });

      // Validação extra para endereço detalhado
      if (!activeAddress.street || !activeAddress.number || !activeAddress.neighborhood || !activeAddress.city || !activeAddress.zipCode) {
        setErrors({ address: 'Endereço incompleto' });
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      // Validação visual básica para habilitar botão, a validação completa Zod ocorre ao tentar avançar ou no onBlur
      const activeAddress = getActiveAddress();
      return orderData.name.length >= 3 &&
        orderData.phone.length >= 10 &&
        activeAddress.street &&
        activeAddress.number &&
        activeAddress.neighborhood &&
        activeAddress.city &&
        activeAddress.zipCode;
    }
    if (step === 2) {
      if (orderData.paymentMethod === 'money') {
        if (orderData.changeFor && Number(orderData.changeFor) < getOrderTotal()) {
          return false;
        }
      }
      return !!orderData.paymentMethod;
    }
    return true;
  };

  if (orderCompleted) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center border border-gray-800">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Pedido Confirmado!</h2>
          <p className="text-gray-400 mb-4">
            Seu pedido foi recebido e está sendo preparado.
          </p>
          <p className="text-yellow-400 font-semibold">
            Tempo estimado: 25-35 minutos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Finalizar Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= stepNumber
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 text-gray-400'
                  }`}>
                  {stepNumber}
                </div>
                <span className={`ml-2 ${step >= stepNumber ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                  {stepNumber === 1 ? 'Dados' : stepNumber === 2 ? 'Pagamento' : 'Confirmação'}
                </span>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-4 ${step > stepNumber ? 'bg-yellow-500' : 'bg-gray-700'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {!isStoreOpen && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
                  A loja está fechada no momento. Não é possível continuar o pedido.
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-yellow-400" />
                  Dados de Entrega
                </h3>
                {profile?.address && profile.address.street && (
                  <button
                    onClick={() => setUseNewAddress(!useNewAddress)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-sm text-yellow-400 hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {useNewAddress ? 'Usar endereço salvo' : 'Entregar em outro endereço'}
                  </button>
                )}
              </div>

              {/* Se tem endereço salvo e não está usando novo endereço, mostra o endereço salvo */}
              {profile?.address && profile.address.street && !useNewAddress && (
                <div className="bg-gray-800/50 p-4 rounded-xl mb-6">
                  <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    Endereço Salvo
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {profile.address.street}, {profile.address.number}
                    {profile.address.complement && `, ${profile.address.complement}`}
                    <br />
                    {profile.address.neighborhood}, {profile.address.city}
                    <br />
                    CEP: {profile.address.zipCode}
                  </p>
                </div>
              )}

              {/* Se não tem endereço salvo ou está usando novo endereço, mostra o formulário */}
              {(!profile?.address?.street || useNewAddress) && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                      <input
                        type="text"
                        value={orderData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full p-3 bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:border-yellow-500 focus:outline-none`}
                        placeholder="Seu nome completo"
                      />
                      {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Telefone</label>
                      <input
                        type="tel"
                        value={orderData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full p-3 bg-gray-800 border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:border-yellow-500 focus:outline-none`}
                        placeholder="(11) 99999-9999"
                      />
                      {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone}</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">CEP</label>
                    <input
                      type="text"
                      value={orderData.address.zipCode}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className={`w-full p-3 bg-gray-800 border ${errors.address ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:border-yellow-500 focus:outline-none`}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {cepLoading && <span className="text-xs text-gray-400 mt-1 block">Buscando CEP...</span>}
                    {cepError && <span className="text-xs text-red-500 mt-1 block">{cepError}</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Rua</label>
                      <input
                        type="text"
                        value={orderData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        className={`w-full p-3 bg-gray-800 border ${errors.address ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:border-yellow-500 focus:outline-none`}
                        placeholder="Nome da rua"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Número</label>
                      <input
                        type="text"
                        value={orderData.address.number}
                        onChange={(e) => handleInputChange('address.number', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  {errors.address && <span className="text-xs text-red-500 mt-1">{errors.address}</span>}

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">CPF (Para Nota Fiscal)</label>
                    <input
                      type="text"
                      value={orderData.cpf || ''}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      className={`w-full p-3 bg-gray-800 border ${errors.cpf ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:border-yellow-500 focus:outline-none`}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    {errors.cpf && <span className="text-xs text-red-500 mt-1">{errors.cpf}</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Complemento</label>
                      <input
                        type="text"
                        value={orderData.address.complement}
                        onChange={(e) => handleInputChange('address.complement', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                        placeholder="Apto, bloco, etc. (opcional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Bairro</label>
                      <input
                        type="text"
                        value={orderData.address.neighborhood}
                        onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                        placeholder="Nome do bairro"
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Cidade</label>
                      <input
                        type="text"
                        value={orderData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                        placeholder="Nome da cidade"
                      />
                    </div>
                  </div>
                  {(useNewAddress || !profile?.address?.street) && (
                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                      />
                      <label htmlFor="saveAddress" className="text-sm text-gray-300">
                        Salvar este endereço para próximos pedidos
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-400" />
                Forma de Pagamento
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'money', name: 'Dinheiro (Na Entrega)', icon: Home, type: 'offline' },
                  { id: 'card_delivery', name: 'Cartão (Na Entrega)', icon: CreditCard, type: 'offline' },
                  { id: 'pix_delivery', name: 'PIX (Na Entrega)', icon: Phone, type: 'offline' },
                  { id: 'pix_online', name: 'PIX Online (Pague Agora)', icon: Phone, type: 'online' },
                  { id: 'card_online', name: 'Cartão Online (Pague Agora)', icon: CreditCard, type: 'online' }
                ]
                .filter(method => tenant?.acceptedPaymentMethods?.includes(method.id))
                .map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleInputChange('paymentMethod', method.id)}
                    className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${orderData.paymentMethod === method.id
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <method.icon className="w-5 h-5" />
                      <span>{method.name}</span>
                    </div>
                    {method.type === 'online' && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full uppercase font-bold">Online</span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Informação do PIX Direto (Se selecionado PIX na Entrega e a loja tiver chave) */}
              {orderData.paymentMethod === 'pix_delivery' && tenant?.pixKey && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-xs text-blue-400 font-bold mb-1">CHAVE PIX DA LOJA:</p>
                  <p className="text-sm text-white font-mono break-all">{tenant.pixKey}</p>
                  <p className="text-[10px] text-blue-500/70 mt-2">Você poderá fazer o pagamento diretamente para a loja ao receber seu pedido.</p>
                </div>
              )}

              {orderData.paymentMethod === 'money' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Troco para quanto?</label>
                  <input
                    type="number"
                    min={getOrderTotal()}
                    value={orderData.changeFor || ''}
                    onChange={e => handleInputChange('changeFor', e.target.value)}
                    className={`w-full p-3 bg-gray-800 border ${orderData.changeFor && Number(orderData.changeFor) < getOrderTotal() ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:border-yellow-500 focus:outline-none`}
                    placeholder={`Ex: ${getOrderTotal().toFixed(2)}`}
                  />
                  {orderData.changeFor && Number(orderData.changeFor) < getOrderTotal() && (
                    <span className="text-xs text-red-500">O valor do troco deve ser igual ou maior que o total do pedido.</span>
                  )}
                  <span className="text-xs text-gray-400">Se não precisar de troco, deixe em branco.</span>
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Tempo de Entrega
                </h4>
                <div className="space-y-3">
                  {[
                    { id: 'normal', name: 'Normal (25-35 min)', extra: 'Grátis' },
                    { id: 'fast', name: 'Rápida (15-25 min)', extra: '+ R$ 5,00' }
                  ].map((delivery) => (
                    <button
                      key={delivery.id}
                      onClick={() => handleInputChange('deliveryTime', delivery.id)}
                      className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${orderData.deliveryTime === delivery.id
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                        }`}
                    >
                      <span>{delivery.name}</span>
                      <span className="text-sm">{delivery.extra}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h3>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-800/50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{item.name}</h4>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.customizations.map((custom, idx) => (
                            <span key={idx} className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                              {custom}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-400">Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-yellow-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Cupom de Desconto */}
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-yellow-400" />
                  Cupom de Desconto
                </h4>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO DO CUPOM"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500 outline-none"
                    />
                    <button
                      onClick={() => validateCoupon(couponCode, totalPrice)}
                      disabled={couponLoading || !couponCode}
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold text-sm">{appliedCoupon.code}</span>
                      <span className="text-green-500/70 text-xs">Aplicado</span>
                    </div>
                    <button
                      onClick={() => {
                        removeCoupon();
                        setCouponCode('');
                      }}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 mt-2">{couponError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>Desconto ({appliedCoupon.code}):</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Taxa de entrega:</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Taxa de serviço:</span>
                  <span>R$ {serviceFee.toFixed(2)}</span>
                </div>
                {orderData.deliveryTime === 'fast' && (
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Entrega rápida:</span>
                    <span>R$ 5,00</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-yellow-400 border-t border-gray-700 pt-2">
                  <span>Total:</span>
                  <span>R$ {getOrderTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Address Summary */}
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  Endereço de Entrega
                </h4>
                <p className="text-gray-300 text-sm">
                  {orderData.address.street}, {orderData.address.number}
                  {orderData.address.complement && `, ${orderData.address.complement}`}
                  <br />
                  {orderData.address.neighborhood}, {orderData.address.city}
                  <br />
                  CEP: {orderData.address.zipCode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex gap-4">
          {step > 1 && (
            <button
              onClick={handlePreviousStep}
              className="px-6 py-3 border border-gray-700 text-gray-300 rounded-xl hover:border-gray-600 transition-colors duration-300"
            >
              Voltar
            </button>
          )}

          <button
            onClick={step === 3 ? handleFinishOrder : handleNextStep}
            disabled={!isStepValid() || isProcessing || !isStoreOpen}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${isStepValid() && !isProcessing && isStoreOpen
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:scale-[1.02]'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Processando...
              </div>
            ) : step === 3 ? (
              'Confirmar Pedido'
            ) : (
              'Continuar'
            )}
          </button>
        </div>

        {/* Order Progress Modal */}
        {/*
          Para exibir o progresso real do pedido, precisamos passar o orderId do pedido recém-criado.
          Vamos salvar o orderId ao criar o pedido e passar aqui.
        */}
        <OrderProgress
          isOpen={showProgress}
          onClose={handleProgressClose}
          estimatedTime={orderData.deliveryTime === 'fast' ? 20 : 30}
          orderId={lastOrderId}
        />
      </div>
    </div>
  );
};

export default Checkout;
