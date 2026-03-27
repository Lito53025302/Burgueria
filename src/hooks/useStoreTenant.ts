import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface TenantCustomization {
    id: string;
    name: string;
    subdomain: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    openingTime: string;
    closingTime: string;
    acceptedPaymentMethods: string[];
    pixKey?: string;
    pixKeyType?: string;
}

export function useStoreTenant() {
    const { subdomain } = useParams<{ subdomain: string }>();
    const [tenant, setTenant] = useState<TenantCustomization | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTenant = useCallback(async (subdomainToFetch: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('tenants')
                .select('id, name, subdomain, primary_color, secondary_color, logo_url, banner_url, opening_time, closing_time, accepted_payment_methods, pix_key, pix_key_type')
                .eq('subdomain', subdomainToFetch)
                .eq('is_active', true)
                .single();

            if (fetchError) {
                logger.error('Erro ao buscar tenant', fetchError);
                throw new Error(`Loja não encontrada: ${subdomainToFetch}`);
            }

            if (!data) {
                throw new Error('Loja não encontrada ou inativa');
            }

            const tenantData: TenantCustomization = {
                id: data.id,
                name: data.name,
                subdomain: data.subdomain,
                primaryColor: data.primary_color,
                secondaryColor: data.secondary_color,
                logoUrl: data.logo_url,
                bannerUrl: data.banner_url,
                openingTime: data.opening_time,
                closingTime: data.closing_time,
                acceptedPaymentMethods: data.accepted_payment_methods || ['money', 'card_delivery', 'pix_delivery'],
                pixKey: data.pix_key,
                pixKeyType: data.pix_key_type
            };

            setTenant(tenantData);
            applyCustomization(tenantData);

        } catch (err) {
            logger.error('Erro ao carregar tenant', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar loja');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!subdomain) {
            // Se não tem subdomain, usar "principal" (default)
            fetchTenant('principal');
        } else {
            fetchTenant(subdomain);
        }
    }, [subdomain, fetchTenant]);

    useEffect(() => {
        const activeSubdomain = subdomain || 'principal';

        const handleVisibilityOrFocus = () => {
            // Recarrega customização ao voltar para a aba/janela
            if (document.visibilityState === 'visible') {
                fetchTenant(activeSubdomain);
            }
        };

        window.addEventListener('focus', handleVisibilityOrFocus);
        document.addEventListener('visibilitychange', handleVisibilityOrFocus);

        return () => {
            window.removeEventListener('focus', handleVisibilityOrFocus);
            document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
        };
    }, [subdomain, fetchTenant]);

    const applyCustomization = (tenantData: TenantCustomization) => {
        // Aplicar CSS variables para cores
        document.documentElement.style.setProperty('--primary-color', tenantData.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', tenantData.secondaryColor);

        // Atualizar title da página
        document.title = `${tenantData.name} - Delivery`;

        // Atualizar favicon se houver logo
        if (tenantData.logoUrl) {
            const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
            if (favicon) {
                favicon.href = tenantData.logoUrl;
            } else {
                // Criar favicon se não existir
                const newFavicon = document.createElement('link');
                newFavicon.rel = 'icon';
                newFavicon.href = tenantData.logoUrl;
                document.head.appendChild(newFavicon);
            }
        }
    };

    return {
        tenant,
        loading,
        error
    };
}
