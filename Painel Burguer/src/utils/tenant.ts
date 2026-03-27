/**
 * Extrair o subdomain da URL atual
 * 
 * Exemplos:
 * - pizzaria-joao.seusistema.com → "pizzaria-joao"
 * - icburguer.localhost → "icburguer"
 * - localhost:5174 → "principal" (desenvolvimento)
 * - 127.0.0.1:5174 → "principal" (desenvolvimento)
 */
export function getSubdomain(): string {
    const hostname = window.location.hostname;

    // Desenvolvimento local com subdomain (ex: icburguer.localhost)
    if (hostname.includes('.localhost') || hostname.includes('.127.0.0.1')) {
        const parts = hostname.split('.');
        if (parts.length >= 2) {
            return parts[0]; // Retorna o subdomain (ex: "icburguer")
        }
    }

    // Desenvolvimento local SEM subdomain (localhost puro ou 127.0.0.1)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
        return 'principal'; // Fallback para desenvolvimento
    }

    // Produção: extrair subdomain
    const parts = hostname.split('.');

    // Se tem pelo menos 3 partes (subdomain.domain.com)
    if (parts.length >= 3) {
        return parts[0];
    }

    // Fallback: tenant principal
    return 'principal';
}

/**
 * Verificar se está em modo de desenvolvimento
 */
export function isDevelopment(): boolean {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.includes('.localhost');
}

/**
 * Gerar URL absoluta para um tenant específico
 */
export function getTenantUrl(subdomain: string): string {
    if (isDevelopment()) {
        return `http://localhost:5173`;
    }

    // Produção
    const baseDomain = 'seusistema.com'; // ← ALTERAR para seu domínio real
    return `https://${subdomain}.${baseDomain}`;
}

/**
 * Validar subdomain (formato correto)
 */
export function isValidSubdomain(subdomain: string): boolean {
    // Apenas letras minúsculas, números e hífens
    // Não pode começar ou terminar com hífen
    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return regex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 30;
}

/**
 * Converter nome da loja em slug válido
 * "Pizzaria do João" → "pizzaria-do-joao"
 */
export function nameToSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD') // Normalizar acentos
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9]+/g, '-') // Substituir caracteres especiais por hífen
        .replace(/^-+|-+$/g, '') // Remover hífens do início/fim
        .substring(0, 30); // Limitar tamanho
}
