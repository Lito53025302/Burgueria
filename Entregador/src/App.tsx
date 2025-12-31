import { Truck, Package, RefreshCw, Volume2, VolumeX } from 'lucide-react'
import { playNotificationSound } from './utils/audio';
import { useOrders } from './hooks/useOrders'
import { OrderCard } from './components/OrderCard'
import { CurrentDelivery } from './components/CurrentDelivery'
import { EmptyState } from './components/EmptyState'
import { LoadingSpinner } from './components/LoadingSpinner'
import { Login } from './components/Login'
import { useAuth } from './hooks/useAuth'
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const { user, loading: authLoading } = useAuth();
  const ordersHooks = useOrders(user?.id || null);

  if (authLoading || ordersHooks.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={() => window.location.reload()} />
  }

  const {
    availableOrders = [],
    currentDelivery = null,
    updating = false,
    collectOrder = () => { },
    markArrived = () => { },
    completeDelivery = () => { },
    isRinging = false,
    silenceAlarm = () => { }
  } = ordersHooks;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 para espaço do botão */}
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="px-4 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900">Burger Express</h1>
                  <p className="text-sm text-gray-500">Painel do Entregador</p>
                </div>
                <button
                  onClick={() => playNotificationSound()}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Testar Som"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Current Delivery Section */}

            {/* ... restante do código ... */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Minha Entrega Atual</h2>
              </div>

              {currentDelivery ? (
                <CurrentDelivery
                  order={currentDelivery}
                  onMarkArrived={markArrived}
                  onCompleteDelivery={completeDelivery}
                  disabled={updating}
                />
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <EmptyState type="delivery" />
                </div>
              )}
            </div>

            {/* Available Orders Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Pedidos para Coletar</h2>
                </div>
                {availableOrders.length > 0 && (
                  <div className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {availableOrders.length}
                  </div>
                )}
              </div>

              {availableOrders.length > 0 ? (
                <div className="space-y-3">
                  {availableOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onCollect={collectOrder}
                      disabled={updating || !!currentDelivery}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <EmptyState type="orders" />
                </div>
              )}
            </div>

            {/* Status indicator */}
            {updating && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Atualizando...</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Silence Button */}
        {isRinging && (
          <div className="fixed bottom-6 left-6 right-6 z-50 animate-bounce">
            <button
              onClick={silenceAlarm}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-2xl flex items-center justify-center space-x-3 transition-colors border-2 border-white"
            >
              <VolumeX className="w-8 h-8" />
              <span className="text-xl">SILENCIAR ALERTA</span>
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App