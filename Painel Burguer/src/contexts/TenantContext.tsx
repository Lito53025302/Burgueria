import { createContext, useContext, ReactNode } from 'react';
import { Tenant } from '../types/tenant';
import { useTenant } from '../hooks/useTenant';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface TenantContextType {
    tenant: Tenant | null;
    tenantId: string | undefined;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const { user, isLoading: authLoading } = useAuth();
    const { tenant, tenantId, loading, error, refetch } = useTenant();

    // Sem sessão, deixa o fluxo de login seguir sem bloquear por tenant
    if (!authLoading && !user) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Carregando configurações...</p>
                </div>
            </div>
        );
    }

    if (error || !tenant) {
        const handleLogout = async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
        };

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
                    <p className="text-gray-600 mb-6">
                        {error || 'Não foi possível carregar as configurações desta loja.'}
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={refetch}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Tentar Novamente
                        </button>

                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Sair e Voltar ao Login
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                        Verifique se você está acessando o endereço correto.
                    </p>
                </div>
            </div>
        );
    }

    // Verificar assinatura expirada
    if (tenant.subscriptionExpiresAt && new Date(tenant.subscriptionExpiresAt) < new Date()) {
        const handleLogout = async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
        };

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Assinatura Expirada</h1>
                    <p className="text-gray-600 mb-6">
                        A assinatura desta loja expirou. Entre em contato com o suporte para renovar.
                    </p>

                    <div className="flex flex-col gap-3">
                        <a
                            href={`mailto:suporte@seusistema.com?subject=Renovar assinatura - ${tenant.name}`}
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Falar com Suporte
                        </a>

                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Sair e Voltar ao Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <TenantContext.Provider value={{ tenant, tenantId, loading, error, refetch }}>
            {children}
        </TenantContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTenantContext() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenantContext deve ser usado dentro de TenantProvider');
    }
    return context;
}
