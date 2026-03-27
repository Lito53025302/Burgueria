export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    slug: string;

    // Customização Visual
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    bannerUrl?: string;

    // Configurações
    isActive: boolean;
    published: boolean; // Indica se a loja está publicada na vitrine
    subscriptionPlan: 'trial' | 'basic' | 'pro' | 'enterprise';
    subscriptionExpiresAt?: string;

    // Contato
    ownerName: string;
    ownerEmail: string;
    ownerPhone?: string;

    // Endereço
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;

    // Horário
    openingTime: string;
    closingTime: string;

    // Delivery
    deliveryFee: number;
    minimumOrder: number;
    deliveryRadiusKm: number;

    // Pagamentos
    acceptedPaymentMethods: string[];
    pixKey?: string;
    pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface TenantSettings {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    bannerUrl?: string;
}
