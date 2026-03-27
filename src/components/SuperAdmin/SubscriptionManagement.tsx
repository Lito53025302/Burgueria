import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    CreditCard,
    TrendingUp,
    DollarSign,
    Calendar,
    CheckCircle,
    XCircle,
    FileText
} from 'lucide-react';

interface SubscriptionPlan {
    id: string;
    name: string;
    display_name: string;
    monthly_fee: number;
    commission_rate: number;
    max_orders_per_month: number | null;
    features: string[];
    is_highlighted: boolean;
}

interface TenantSubscription {
    id: string;
    name: string;
    subdomain: string;
    owner_email: string;
    plan_name: string;
    plan_display_name: string;
    monthly_fee: number;
    commission_rate: number;
    orders_this_month: number;
    max_orders: number | null;
    subscription_started_at: string;
    is_active: boolean;
}

interface TenantWithPlanRow {
    id: string;
    name: string;
    subdomain: string;
    owner_email: string;
    orders_this_month: number;
    subscription_started_at: string;
    is_active: boolean;
    subscription_plans?: {
        name?: string;
        display_name?: string;
        monthly_fee?: number;
        commission_rate?: number;
        max_orders_per_month?: number | null;
    } | null;
}

export default function SubscriptionManagement() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [tenants, setTenants] = useState<TenantSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyRecurring: 0,
        totalCommissions: 0,
        activeSubscriptions: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Buscar planos
            const { data: plansData } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .order('monthly_fee', { ascending: true });

            setPlans(plansData || []);

            // Buscar tenants com seus planos
            const { data: tenantsData } = await supabase
                .from('tenants')
                .select(`
                    id,
                    name,
                    subdomain,
                    owner_email,
                    orders_this_month,
                    subscription_started_at,
                    is_active,
                    subscription_plans:subscription_plan_id (
                        name,
                        display_name,
                        monthly_fee,
                        commission_rate,
                        max_orders_per_month
                    )
                `)
                .order('created_at', { ascending: false });

            const formattedTenants = (tenantsData as TenantWithPlanRow[] | null)?.map((t) => ({
                id: t.id,
                name: t.name,
                subdomain: t.subdomain,
                owner_email: t.owner_email,
                plan_name: t.subscription_plans?.name || 'free',
                plan_display_name: t.subscription_plans?.display_name || 'Plano FREE',
                monthly_fee: t.subscription_plans?.monthly_fee || 0,
                commission_rate: t.subscription_plans?.commission_rate || 0.05,
                orders_this_month: t.orders_this_month || 0,
                max_orders: t.subscription_plans?.max_orders_per_month,
                subscription_started_at: t.subscription_started_at,
                is_active: t.is_active
            })) || [];

            setTenants(formattedTenants);

            // Calcular estatísticas
            const monthlyRecurring = formattedTenants
                .filter((t) => t.is_active)
                .reduce((sum: number, t) => sum + t.monthly_fee, 0);

            const activeSubscriptions = formattedTenants.filter((t) => t.is_active).length;

            setStats({
                totalRevenue: 0, // TODO: Calcular do histórico
                monthlyRecurring,
                totalCommissions: 0, // TODO: Calcular do histórico
                activeSubscriptions
            });

        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    const changePlan = async (tenantId: string, tenantName: string, newPlanId: string) => {
        const plan = plans.find(p => p.id === newPlanId);
        if (!plan) return;

        if (!confirm(`Alterar plano de "${tenantName}" para "${plan.display_name}"?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('tenants')
                .update({
                    subscription_plan_id: newPlanId,
                    subscription_started_at: new Date().toISOString()
                })
                .eq('id', tenantId);

            if (error) throw error;

            alert(`Plano alterado com sucesso para ${plan.display_name}!`);
            fetchData();
        } catch (err) {
            console.error('Erro ao alterar plano:', err);
            alert('Erro ao alterar plano');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">💳 Assinaturas e Comissões</h2>
                <p className="text-gray-400">Gerencie planos e receitas das lojas</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="h-8 w-8" />
                        <span className="text-3xl font-bold">
                            R$ {stats.monthlyRecurring.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-green-100 text-sm">Receita Recorrente Mensal (MRR)</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="h-8 w-8" />
                        <span className="text-3xl font-bold">
                            R$ {stats.totalCommissions.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-blue-100 text-sm">Comissões Este Mês</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <CreditCard className="h-8 w-8" />
                        <span className="text-3xl font-bold">{stats.activeSubscriptions}</span>
                    </div>
                    <p className="text-purple-100 text-sm">Assinaturas Ativas</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Calendar className="h-8 w-8" />
                        <span className="text-3xl font-bold">
                            R$ {stats.totalRevenue.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-orange-100 text-sm">Receita Total</p>
                </div>
            </div>

            {/* Planos Disponíveis */}
            <div>
                <h3 className="text-2xl font-bold text-white mb-4">📋 Planos Disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-2xl p-6 border-2 ${plan.is_highlighted
                                    ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500'
                                    : 'bg-gray-800/50 border-gray-700'
                                }`}
                        >
                            {plan.is_highlighted && (
                                <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                                    ⭐ RECOMENDADO
                                </div>
                            )}
                            <h4 className="text-2xl font-bold text-white mb-2">{plan.display_name}</h4>
                            <div className="text-4xl font-bold text-orange-500 mb-4">
                                R$ {plan.monthly_fee.toFixed(2)}
                                <span className="text-sm text-gray-400">/mês</span>
                            </div>
                            <div className="text-gray-300 mb-4">
                                <p className="font-semibold">Comissão: {(plan.commission_rate * 100).toFixed(0)}%</p>
                                <p className="text-sm text-gray-400">
                                    {plan.max_orders_per_month
                                        ? `Até ${plan.max_orders_per_month} pedidos/mês`
                                        : 'Pedidos ilimitados'}
                                </p>
                            </div>
                            <ul className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabela de Assinaturas */}
            <div>
                <h3 className="text-2xl font-bold text-white mb-4">🏪 Assinaturas das Lojas</h3>
                <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Loja</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Plano Atual</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Mensalidade</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Comissão</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Pedidos/Mês</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white font-semibold">{tenant.name}</p>
                                                <p className="text-gray-400 text-sm">{tenant.subdomain}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tenant.plan_name === 'pro'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : tenant.plan_name === 'basic'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {tenant.plan_display_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            R$ {tenant.monthly_fee.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {(tenant.commission_rate * 100).toFixed(0)}%
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-300">
                                                <span className="font-semibold">{tenant.orders_this_month}</span>
                                                {tenant.max_orders && (
                                                    <span className="text-gray-500 text-sm">
                                                        {' '}/ {tenant.max_orders}
                                                    </span>
                                                )}
                                            </div>
                                            {tenant.max_orders && tenant.orders_this_month >= tenant.max_orders && (
                                                <span className="text-red-400 text-xs">⚠️ Limite atingido</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {tenant.is_active ? (
                                                <span className="flex items-center gap-1 text-green-400 text-sm">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Ativa
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-400 text-sm">
                                                    <XCircle className="h-4 w-4" />
                                                    Inativa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <select
                                                    onChange={(e) => changePlan(tenant.id, tenant.name, e.target.value)}
                                                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Alterar Plano</option>
                                                    {plans.map((plan) => (
                                                        <option key={plan.id} value={plan.id}>
                                                            {plan.display_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => alert(`Fatura de ${tenant.name}\n\nEm desenvolvimento...`)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                    title="Ver Fatura"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
