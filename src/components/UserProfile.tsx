import { useState, useEffect } from 'react';
import { X, User, Package, Clock, MapPin, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import OrderProgress from './OrderProgress';

interface UserProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Order {
    id: string;
    created_at: string;
    status: string;
    total: number;
    items: any;
    delivery_address: string;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
    const { user, signOut } = useCustomerAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchOrders();
        }
    }, [isOpen, user]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('cliente_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        preparing: 'bg-blue-500/20 text-blue-400',
        ready: 'bg-green-500/20 text-green-400',
        awaiting_pickup: 'bg-purple-500/20 text-purple-400',
        in_transit: 'bg-purple-500/20 text-purple-400',
        delivered: 'bg-gray-500/20 text-gray-400',
        cancelled: 'bg-red-500/20 text-red-400'
    } as const;

    const statusLabels = {
        pending: 'Pendente',
        preparing: 'Preparando',
        ready: 'Pronto',
        awaiting_pickup: 'Aguardando Motoboy',
        in_transit: 'Em Rota',
        delivered: 'Entregue',
        cancelled: 'Cancelado'
    } as const;

    const handleLogout = async () => {
        await signOut();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 z-50 shadow-2xl border-l border-gray-800 flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Minha Conta</h2>
                            <p className="text-sm text-gray-400">{user?.user_metadata?.name || user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Package className="w-5 h-5 text-yellow-400" />
                            Meus Pedidos
                        </h3>
                        <button
                            onClick={fetchOrders}
                            className="text-xs text-yellow-500 hover:text-yellow-400"
                        >
                            Atualizar
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-800">
                            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">Nenhum pedido encontrado</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                const status = order.status as keyof typeof statusLabels;

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (status !== 'delivered' && status !== 'cancelled') {
                                                setSelectedOrderId(order.id);
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status] || statusColors.pending}`}>
                                                    {statusLabels[status] || status}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(order.created_at).toLocaleString('pt-BR')}
                                                </p>
                                            </div>
                                            <span className="font-bold text-white">
                                                R$ {order.total.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="space-y-1 mb-3">
                                            {items.map((item: any, idx: number) => (
                                                <p key={idx} className="text-sm text-gray-300">
                                                    {item.quantity}x {item.name}
                                                </p>
                                            ))}
                                        </div>

                                        {status !== 'delivered' && status !== 'cancelled' && (
                                            <div className="border-t border-gray-700 pt-3 mt-3">
                                                <p className="text-xs text-yellow-500 text-center font-medium">
                                                    Clique para ver andamento
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </button>
                </div>
            </div>

            {/* Order Progress Modal */}
            <OrderProgress
                isOpen={!!selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
                orderId={selectedOrderId}
                estimatedTime={30} // Estimado
            />
        </>
    );
}
