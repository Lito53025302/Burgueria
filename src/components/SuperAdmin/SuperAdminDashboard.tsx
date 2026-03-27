import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Store,
    DollarSign,
    TrendingUp,
    MapPin,
    Trash2,
    Plus,
    Search,
    CheckCircle,
    XCircle,
    Eye,
    Info,
    FileText
} from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    city: string;
    state: string;
    is_active: boolean;
    subscription_plan: string;
    created_at: string;
    latitude?: number;
    longitude?: number;
    owner_email: string;
    owner_phone: string;
}

type TenantRow = Tenant;

export default function SuperAdminDashboard() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalStores: 0,
        activeStores: 0,
        totalRevenue: 0,
        newStoresThisMonth: 0
    });

    useEffect(() => {
        fetchTenants();
        fetchStats();
    }, []);

    const fetchTenants = async () => {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTenants((data as TenantRow[]) || []);
        } catch (err) {
            console.error('Erro ao carregar lojas:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data: tenantsData } = await supabase
                .from('tenants')
                .select('*');
            const typedTenants = (tenantsData as TenantRow[]) || [];

            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const newStoresThisMonth = typedTenants.filter((t) =>
                new Date(t.created_at) >= firstDayOfMonth
            ).length;

            setStats({
                totalStores: typedTenants.length,
                activeStores: typedTenants.filter((t) => t.is_active).length,
                totalRevenue: 0, // TODO: Calcular do banco
                newStoresThisMonth
            });
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
        }
    };

    const toggleStoreStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('tenants')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            fetchTenants();
            fetchStats();
            alert(`Loja ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`);
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            alert('Erro ao atualizar status da loja');
        }
    };

    const deleteTenant = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir a loja "${name}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('tenants')
                .delete()
                .eq('id', id);

            if (error) throw error;

            fetchTenants();
            fetchStats();
            alert('Loja excluída com sucesso!');
        } catch (err) {
            console.error('Erro ao excluir loja:', err);
            alert('Erro ao excluir loja');
        }
    };

    const filteredTenants = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-400 text-lg">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Header */}
            <div className="bg-black/50 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                👑 Super Admin
                            </h1>
                            <p className="text-gray-400 mt-1">Gerencie todas as lojas do marketplace</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/cadastro'}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all hover:shadow-lg hover:shadow-orange-500/50 flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Nova Loja
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <Store className="h-8 w-8" />
                            <span className="text-3xl font-bold">{stats.totalStores}</span>
                        </div>
                        <p className="text-blue-100 text-sm">Total de Lojas</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle className="h-8 w-8" />
                            <span className="text-3xl font-bold">{stats.activeStores}</span>
                        </div>
                        <p className="text-green-100 text-sm">Lojas Ativas</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="h-8 w-8" />
                            <span className="text-3xl font-bold">{stats.newStoresThisMonth}</span>
                        </div>
                        <p className="text-purple-100 text-sm">Novas Este Mês</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="h-8 w-8" />
                            <span className="text-3xl font-bold">R$ 0</span>
                        </div>
                        <p className="text-orange-100 text-sm">Receita Total</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, subdomain ou cidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Stores Table */}
                <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Loja</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Localização</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Plano</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Coordenadas</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredTenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white font-semibold">{tenant.name}</p>
                                                <p className="text-gray-400 text-sm">{tenant.subdomain}</p>
                                                <p className="text-gray-500 text-xs">{tenant.owner_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span>{tenant.city}, {tenant.state}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tenant.subscription_plan === 'pro'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : tenant.subscription_plan === 'basic'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {tenant.subscription_plan?.toUpperCase() || 'FREE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStoreStatus(tenant.id, tenant.is_active)}
                                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${tenant.is_active
                                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                    }`}
                                            >
                                                {tenant.is_active ? (
                                                    <>
                                                        <CheckCircle className="h-3 w-3" />
                                                        Ativa
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        Inativa
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tenant.latitude && tenant.longitude ? (
                                                <span className="text-green-400 text-xs">✓ Configurado</span>
                                            ) : (
                                                <span className="text-yellow-400 text-xs">⚠ Pendente</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.open(`/${tenant.subdomain}`, '_blank')}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                    title="Ver Loja"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => alert(`Detalhes da loja:\n\nNome: ${tenant.name}\nEmail: ${tenant.owner_email}\nTelefone: ${tenant.owner_phone}\nCriada em: ${new Date(tenant.created_at).toLocaleDateString('pt-BR')}`)}
                                                    className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                                                    title="Ver Detalhes"
                                                >
                                                    <Info className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => alert(`Fatura de ${tenant.name}:\n\nPlano: ${tenant.subscription_plan?.toUpperCase()}\nStatus: ${tenant.is_active ? 'Ativa' : 'Inativa'}\n\n(TODO: Integrar com sistema de pagamentos)`)}
                                                    className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                                    title="Ver Fatura"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteTenant(tenant.id, tenant.name)}
                                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                    title="Excluir Loja"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredTenants.length === 0 && (
                        <div className="text-center py-12">
                            <Store className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">Nenhuma loja encontrada</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
