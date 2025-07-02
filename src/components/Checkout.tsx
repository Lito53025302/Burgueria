import { useState, useEffect } from 'react';
import { X, MapPin, CreditCard, Clock, CheckCircle, User, Phone, Home, Plus } from 'lucide-react';
import { CartItem } from '../types';
import { supabase } from '../lib/supabase';
import OrderProgress from './OrderProgress';

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
  onOrderComplete: () => void;
}

const Checkout = ({ isOpen, onClose, items, totalPrice, onOrderComplete }: CheckoutProps) => {
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
  const [profile] = useState<any>(null); // placeholder para manter o fluxo de endereço salvo, se desejar

  // Função para buscar ou criar cliente pelo celular
  interface ClienteInput {
    nome: string;
    celular: string;
    cpf: string;
    endereco: Address;
  }
  async function getOrCreateCliente({ nome, celular, cpf, endereco }: ClienteInput) {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('celular', celular)
      .single();

    if (cliente) {
      return cliente;
    } else {
      // Cria novo cliente
      const { data: novoCliente, error: insertError } = await supabase
        .from('clientes')
        .insert([{ nome, celular, cpf, endereco }])
        .select()
        .single();
      if (insertError) throw insertError;
      return novoCliente;
    }
  }

  // Carregar dados do perfil quando o modal abrir
  useEffect(() => {
    if (isOpen && profile) {
      setOrderData(prev => ({
        ...prev,
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          zipCode: ''
        }
      }));
      
      // Se já tem endereço salvo, não usar novo endereço
      if (profile.address && profile.address.street) {
        setUseNewAddress(false);
      } else {
        setUseNewAddress(true);
      }
    }
  }, [isOpen, profile]);

  // Atualiza endereço no resumo após login/cadastro
  useEffect(() => {
    if (profile) {
      setOrderData(prev => ({
        ...prev,
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

  if (!isOpen) return null;

  const deliveryFee = 8.99;
  const finalTotal = totalPrice + deliveryFee;

  // Calcula o valor total do pedido
  const getOrderTotal = () => {
    let total = totalPrice + deliveryFee;
    if (orderData.deliveryTime === 'fast') total += 5;
    return total;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setOrderData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setOrderData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinishOrder = async () => {
    setIsProcessing(true);
    try {
      // Busca ou cria cliente pelo celular
      const cliente = await getOrCreateCliente({
        nome: orderData.name,
        celular: orderData.phone,
        cpf: orderData.cpf,
        endereco: orderData.address
      });

      // Salvar pedido no Supabase

      const { data: orderInsertData, error } = await supabase.from('orders').insert([
        {
          cliente_id: cliente.id,
          customer_name: orderData.name,
          customer_phone: orderData.phone,
          items: JSON.stringify(items),
          status: orderData.paymentMethod === 'cash' ? 'pending' : 'pending',
          total: finalTotal + (orderData.deliveryTime === 'fast' ? 5 : 0),
          address: `${orderData.address.street}, ${orderData.address.number}${orderData.address.complement ? ' - ' + orderData.address.complement : ''} - ${orderData.address.neighborhood}, ${orderData.address.city} - ${orderData.address.zipCode}`,
          payment_method: orderData.paymentMethod === 'cash' ? 'money' : orderData.paymentMethod,
          change_for: orderData.paymentMethod === 'cash' ? orderData.changeFor : null,
          created_at: new Date().toISOString(),
          // CAMPOS PARA O APP DO ENTREGADOR
          delivery_address: `${orderData.address.street}, ${orderData.address.number}${orderData.address.complement ? ' - ' + orderData.address.complement : ''} - ${orderData.address.neighborhood}, ${orderData.address.city} - ${orderData.address.zipCode}`,
          items_count: items.length,
          total_amount: getOrderTotal()
        }
      ]).select();
      if (error) throw error;
      // Salva o ID do pedido criado para o progresso real
      const newOrderId = orderInsertData?.[0]?.id || null;
      setLastOrderId(newOrderId);
      if (newOrderId) {
        try {
          localStorage.setItem('lastOrderId', newOrderId);
        } catch {}
      }
  // Recupera o último pedido salvo ao abrir o app/modal
  useEffect(() => {
    if (isOpen && !lastOrderId) {
      try {
        const savedOrderId = localStorage.getItem('lastOrderId');
        if (savedOrderId) setLastOrderId(savedOrderId);
      } catch {}
    }
  }, [isOpen, lastOrderId]);

      // Simular processamento do pedido
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsProcessing(false);
      setOrderCompleted(true);
      setTimeout(() => {
        setOrderCompleted(false);
        setShowProgress(true);
        onOrderComplete();
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error);
      setIsProcessing(false);
      alert('Erro ao salvar pedido: ' + (error?.message || error?.details || 'Tente novamente.'));
    }
  };

  const handleProgressClose = () => {
    setShowProgress(false);
    onOrderComplete();
    onClose();
    setStep(1);
    try {
      localStorage.removeItem('lastOrderId');
    } catch {}
  };

  const isStepValid = () => {
    if (step === 1) {
      return orderData.name && orderData.phone && 
             orderData.address.street && orderData.address.number && 
             orderData.address.neighborhood && orderData.address.city && 
             orderData.address.zipCode;
    }
    if (step === 2) {
      if (orderData.paymentMethod === 'cash') {
        // Se o campo de troco estiver preenchido, precisa ser maior ou igual ao total
        if (orderData.changeFor && Number(orderData.changeFor) < getOrderTotal()) {
          return false;
        }
      }
      return orderData.paymentMethod;
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= stepNumber 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNumber}
                </div>
                <span className={`ml-2 ${
                  step >= stepNumber ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {stepNumber === 1 ? 'Dados' : stepNumber === 2 ? 'Pagamento' : 'Confirmação'}
                </span>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-4 ${
                    step > stepNumber ? 'bg-yellow-500' : 'bg-gray-700'
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
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Telefone</label>
                      <input
                        type="tel"
                        value={orderData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Rua</label>
                      <input
                        type="text"
                        value={orderData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">CPF</label>
                    <input
                      type="text"
                      value={orderData.cpf || ''}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">CEP</label>
                      <input
                        type="text"
                        value={orderData.address.zipCode}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                        placeholder="00000-000"
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
                  { id: 'credit', name: 'Cartão de Crédito', icon: CreditCard },
                  { id: 'debit', name: 'Cartão de Débito', icon: CreditCard },
                  { id: 'pix', name: 'PIX', icon: Phone },
                  { id: 'cash', name: 'Dinheiro', icon: Home }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleInputChange('paymentMethod', method.id)}
                    className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                      orderData.paymentMethod === method.id
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <method.icon className="w-5 h-5" />
                    {method.name}
                  </button>
                ))}
              </div>
              {orderData.paymentMethod === 'cash' && (
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
                      className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                        orderData.deliveryTime === delivery.id
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

              {/* Totals */}
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Taxa de entrega:</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
                {orderData.deliveryTime === 'fast' && (
                  <div className="flex justify-between text-gray-300">
                    <span>Entrega rápida:</span>
                    <span>R$ 5,00</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-yellow-400 border-t border-gray-700 pt-2">
                  <span>Total:</span>
                  <span>R$ {(finalTotal + (orderData.deliveryTime === 'fast' ? 5 : 0)).toFixed(2)}</span>
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
            disabled={!isStepValid() || isProcessing}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
              isStepValid() && !isProcessing
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
          isOpen={showProgress || !!lastOrderId}
          onClose={handleProgressClose}
          estimatedTime={orderData.deliveryTime === 'fast' ? 20 : 30}
          orderId={lastOrderId}
        />
      </div>
    </div>
  );
};

export default Checkout;
