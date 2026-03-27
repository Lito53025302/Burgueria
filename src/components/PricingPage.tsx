import { Check, X, TrendingUp, DollarSign, Users, Zap, Shield, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">FoodHub</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Modelo de Cobrança <span className="text-orange-600">Revolucionário</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Esqueça mensalidades caras e comissões abusivas. Você só paga quando vende!
        </p>
        
        {/* Destaque Principal */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 max-w-2xl mx-auto text-white shadow-2xl">
          <div className="text-6xl font-bold mb-2">R$ 0,50</div>
          <div className="text-2xl mb-4">por pedido realizado</div>
          <div className="text-lg opacity-90">
            Taxa paga pelo cliente • Você não paga nada!
          </div>
        </div>
      </div>

      {/* Comparação com Concorrentes */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">
          Compare com os Concorrentes
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Concorrente 1 */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-gray-900 mb-2">iFood</div>
              <div className="text-red-600 text-4xl font-bold mb-2">12-27%</div>
              <div className="text-sm text-gray-600">do valor do pedido</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Comissão alta por pedido</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Taxas adicionais</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Pedido de R$ 50 = R$ 6-13,50 de taxa</span>
              </div>
            </div>
          </div>

          {/* Concorrente 2 */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-gray-900 mb-2">Rappi</div>
              <div className="text-red-600 text-4xl font-bold mb-2">15-30%</div>
              <div className="text-sm text-gray-600">do valor do pedido</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Comissão muito alta</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Custos variáveis</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Pedido de R$ 50 = R$ 7,50-15 de taxa</span>
              </div>
            </div>
          </div>

          {/* Seu Serviço */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 border-2 border-orange-600 shadow-xl transform scale-105">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-white mb-2">FoodHub</div>
              <div className="text-white text-4xl font-bold mb-2">R$ 0,50</div>
              <div className="text-sm text-white opacity-90">fixo por pedido</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">Taxa fixa e previsível</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">Cliente paga a taxa</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white font-bold">Pedido de R$ 50 = R$ 0,50 de taxa!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exemplo Prático */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-center mb-8">
            Veja na Prática
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Exemplo 1 */}
            <div className="border-2 border-orange-200 rounded-xl p-6">
              <div className="text-xl font-bold mb-4 text-orange-600">
                Pedido de R$ 30,00
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor dos produtos:</span>
                  <span className="font-semibold">R$ 30,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de serviço:</span>
                  <span className="font-semibold text-orange-600">+ R$ 0,50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de entrega:</span>
                  <span className="font-semibold">+ R$ 5,00</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold">Total para o cliente:</span>
                  <span className="font-bold text-xl">R$ 35,50</span>
                </div>
                <div className="bg-green-50 p-3 rounded-lg mt-4">
                  <div className="flex justify-between text-green-700">
                    <span className="font-semibold">Você recebe:</span>
                    <span className="font-bold">R$ 30,00</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    100% do valor dos produtos!
                  </div>
                </div>
              </div>
            </div>

            {/* Exemplo 2 */}
            <div className="border-2 border-orange-200 rounded-xl p-6">
              <div className="text-xl font-bold mb-4 text-orange-600">
                Pedido de R$ 100,00
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor dos produtos:</span>
                  <span className="font-semibold">R$ 100,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de serviço:</span>
                  <span className="font-semibold text-orange-600">+ R$ 0,50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de entrega:</span>
                  <span className="font-semibold">+ R$ 5,00</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold">Total para o cliente:</span>
                  <span className="font-bold text-xl">R$ 105,50</span>
                </div>
                <div className="bg-green-50 p-3 rounded-lg mt-4">
                  <div className="flex justify-between text-green-700">
                    <span className="font-semibold">Você recebe:</span>
                    <span className="font-bold">R$ 100,00</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    100% do valor dos produtos!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-orange-50 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-bold text-gray-900 mb-2">
                  Quanto mais você vende, mais você ganha!
                </div>
                <div className="text-gray-600">
                  Com 100 pedidos/mês de R$ 50 em média, você fatura R$ 5.000 e paga apenas R$ 50 de taxa.
                  No iFood, você pagaria entre R$ 600 e R$ 1.350!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">
          Por Que Nosso Modelo é Melhor?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Previsível</h4>
            <p className="text-gray-600">
              Sempre R$ 0,50 por pedido. Sem surpresas, sem taxas escondidas.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Sem Risco</h4>
            <p className="text-gray-600">
              Você só paga quando vende. Sem pedidos = sem custos.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Justo</h4>
            <p className="text-gray-600">
              Cliente paga a taxa, você recebe 100% do valor dos produtos.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Rápido</h4>
            <p className="text-gray-600">
              Cadastre sua loja em 5 minutos e comece a vender hoje mesmo.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Suporte</h4>
            <p className="text-gray-600">
              Equipe dedicada para ajudar você a crescer seu negócio.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Escalável</h4>
            <p className="text-gray-600">
              Quanto mais você vende, melhor fica sua margem de lucro.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-12 text-center text-white">
          <h3 className="text-4xl font-bold mb-4">
            Pronto para Começar?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Cadastre sua loja agora e comece a vender sem mensalidades!
          </p>
          <button
            onClick={() => navigate('/cadastro')}
            className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Cadastrar Minha Loja Grátis
          </button>
          <div className="mt-6 text-sm opacity-75">
            Sem cartão de crédito • Sem mensalidade • Sem compromisso
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">
          Perguntas Frequentes
        </h3>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow">
            <h4 className="font-bold text-lg mb-2">Quem paga a taxa de R$ 0,50?</h4>
            <p className="text-gray-600">
              O cliente paga a taxa de serviço no momento do checkout. Você recebe 100% do valor dos seus produtos.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <h4 className="font-bold text-lg mb-2">Tem mensalidade?</h4>
            <p className="text-gray-600">
              Não! Você só paga R$ 0,50 por pedido realizado. Sem pedidos = sem custos.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <h4 className="font-bold text-lg mb-2">Como recebo o pagamento?</h4>
            <p className="text-gray-600">
              O cliente paga na entrega (dinheiro, PIX ou cartão). Você recebe o valor total dos produtos.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <h4 className="font-bold text-lg mb-2">Posso cancelar a qualquer momento?</h4>
            <p className="text-gray-600">
              Sim! Não há contrato ou fidelidade. Você pode pausar ou cancelar quando quiser.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <h4 className="font-bold text-lg mb-2">Tem limite de pedidos?</h4>
            <p className="text-gray-600">
              Não! Você pode receber quantos pedidos quiser. Quanto mais vende, mais ganha!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
