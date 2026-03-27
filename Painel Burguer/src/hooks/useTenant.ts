import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Tenant } from '../types/tenant';
import { getSubdomain } from '../utils/tenant';
import { logger } from '../utils/logger';

export function useTenant() {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastAuthUserIdRef = useRef<string | null>(null);
    const tenantRef = useRef<Tenant | null>(null);
    const warnedMissingJwtTenantForUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        tenantRef.current = tenant;
    }, [tenant]);

    const applyTenantTheme = useCallback((tenantData: Tenant) => {
        // Aplicar CSS variables
        document.documentElement.style.setProperty('--primary-color', tenantData.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', tenantData.secondaryColor);

        // Atualizar title
        document.title = `${tenantData.name} - Painel Admin`;

        // Atualizar favicon se houver logo
        if (tenantData.logoUrl) {
            const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
            if (favicon) {
                favicon.href = tenantData.logoUrl;
            }
        }
    }, []);

    const fetchTenant = useCallback(async () => {
        try {
            // Só mostra loading de tela cheia no primeiro carregamento real
            if (!tenantRef.current) {
                setLoading(true);
            }
            setError(null);

            // 1. Verificar se usuário está autenticado
            const { data: { user } } = await supabase.auth.getUser();

            let tenantId: string | undefined;

            if (user) {
                lastAuthUserIdRef.current = user.id;
                // SE AUTENTICADO -> usar tenant_id do JWT (app_metadata)
                tenantId = user.app_metadata?.tenant_id;

                if (tenantId) {
                    logger.info('🔑 Usuário autenticado - usando tenant_id do JWT', {
                        userId: user.id,
                        email: user.email,
                        tenantId
                    });
                } else {
                    if (warnedMissingJwtTenantForUserIdRef.current !== user.id) {
                        logger.warn('⚠️ Usuário autenticado mas sem tenant_id no JWT', {
                            userId: user.id,
                            email: user.email
                        });
                        warnedMissingJwtTenantForUserIdRef.current = user.id;
                    }

                    // Fallback 1: buscar tenant_id no profile
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('tenant_id')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (profileData?.tenant_id) {
                        tenantId = profileData.tenant_id;
                        logger.info('🔁 tenant_id encontrado via profile', { tenantId });
                    }

                    // Fallback 2: buscar tenant pelo email do proprietário
                    if (!tenantId && user.email) {
                        const { data: ownerTenantData } = await supabase
                            .from('tenants')
                            .select('id')
                            .eq('owner_email', user.email)
                            .maybeSingle();

                        if (ownerTenantData?.id) {
                            tenantId = ownerTenantData.id;
                            logger.info('🔁 tenant_id encontrado via owner_email', { tenantId });
                        }
                    }
                }
            }

            // Sem sessão autenticada no painel: não tenta resolver tenant por subdomain.
            // Isso evita erro em / (localhost:5174) antes do login.
            if (!user) {
                lastAuthUserIdRef.current = null;
                setTenant(null);
                setError(null);
                setLoading(false);
                return;
            }

            // 2. Se não tem tenant_id (não autenticado ou sem tenant), usar subdomain
            if (!tenantId) {
                const subdomain = getSubdomain();
                logger.info('🌐 Detectando tenant por subdomain', { subdomain });

                const { data: tenantData, error: subdomainError } = await supabase
                    .from('tenants')
                    .select('id')
                    .eq('subdomain', subdomain)
                    .maybeSingle();

                if (subdomainError || !tenantData) {
                    throw new Error(`Loja não encontrada: ${subdomain}`);
                }

                tenantId = tenantData.id;
            }

            // 3. Buscar dados completos do tenant pelo ID
            const { data, error: fetchError } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', tenantId)
                .single();

            if (fetchError) {
                throw new Error(`Erro ao carregar tenant: ${fetchError.message}`);
            }

            if (!data) {
                throw new Error('Loja não encontrada ou inativa');
            }

            // 4. Mapear campos snake_case → camelCase
            const mappedTenant: Tenant = {
                id: data.id,
                name: data.name,
                subdomain: data.subdomain,
                slug: data.slug,
                primaryColor: data.primary_color,
                secondaryColor: data.secondary_color,
                logoUrl: data.logo_url,
                bannerUrl: data.banner_url,
                isActive: data.is_active,
                published: data.published ?? false,
                subscriptionPlan: data.subscription_plan,
                subscriptionExpiresAt: data.subscription_expires_at,
                ownerName: data.owner_name,
                ownerEmail: data.owner_email,
                ownerPhone: data.owner_phone,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zip_code,
                openingTime: data.opening_time,
                closingTime: data.closing_time,
                deliveryFee: data.delivery_fee,
                minimumOrder: data.minimum_order,
                deliveryRadiusKm: data.delivery_radius_km,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };

            setTenant(mappedTenant);
            logger.info('✅ Tenant carregado', {
                tenantId: mappedTenant.id,
                name: mappedTenant.name,
                subdomain: mappedTenant.subdomain
            });

            // Aplicar tema do tenant
            applyTenantTheme(mappedTenant);

        } catch (err) {
            logger.error('❌ Erro ao carregar tenant', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar configurações da loja');
        } finally {
            setLoading(false);
        }
    }, [applyTenantTheme]);

    useEffect(() => {
        fetchTenant();

        // Ouvir mudanças de autenticação (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            logger.info('🔄 Auth state changed', { event, hasSession: !!session });
            const currentUserId = session?.user?.id ?? null;

            // Evita refetch e "reset" visual em SIGNED_IN repetido do mesmo usuário (troca de aba/foco)
            if (event === 'SIGNED_IN') {
                if (currentUserId && currentUserId !== lastAuthUserIdRef.current) {
                    fetchTenant();
                }
                return;
            }

            // Recarrega ao sair
            if (event === 'SIGNED_OUT') {
                fetchTenant();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchTenant]);

    return {
        tenant,
        tenantId: tenant?.id,
        loading,
        error,
        refetch: fetchTenant
    };
}
