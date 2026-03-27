import { useState } from 'react';
import { Store, CreditCard, ArrowLeft, Truck } from 'lucide-react';
import SuperAdminDashboard from './SuperAdminDashboard';
import SubscriptionManagement from './SubscriptionManagement';
import DelivererManagement from './DelivererManagement';

export default function SuperAdminLayout() {
    const [activeTab, setActiveTab] = useState<'stores' | 'subscriptions' | 'deliverers'>('stores');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Header */}
            <div className="bg-black/50 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                👑 Super Admin
                            </h1>
                            <p className="text-gray-400 mt-1">Gerencie todas as lojas do marketplace</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar ao Marketplace
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('stores')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'stores'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Store className="h-5 w-5" />
                            Lojas
                        </button>
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'subscriptions'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <CreditCard className="h-5 w-5" />
                            Assinaturas & Comissões
                        </button>
                        <button
                            onClick={() => setActiveTab('deliverers')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'deliverers'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Truck className="h-5 w-5" />
                            Entregadores
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'stores' && <SuperAdminDashboard />}
                {activeTab === 'subscriptions' && <SubscriptionManagement />}
                {activeTab === 'deliverers' && <DelivererManagement />}
            </div>
        </div>
    );
}
