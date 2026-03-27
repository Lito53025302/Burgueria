import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface AdminCheckResult {
  isAdmin: boolean;
  userId: string | null;
  tenantId: string | null;
  error?: string;
}

/**
 * Verifica se o usuário atual é admin
 * Retorna informações sobre o usuário e seu tenant
 */
export async function checkAdminAuth(): Promise<AdminCheckResult> {
  try {
    // Verificar se há usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        isAdmin: false,
        userId: null,
        tenantId: null,
        error: 'Usuário não autenticado'
      };
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Erro ao buscar perfil do usuário', profileError);
      return {
        isAdmin: false,
        userId: user.id,
        tenantId: null,
        error: 'Perfil não encontrado'
      };
    }

    // Verificar se é admin
    const isAdmin = profile.role === 'admin';

    if (!isAdmin) {
      logger.warn('Tentativa de acesso não autorizado', { userId: user.id, role: profile.role });
    }

    return {
      isAdmin,
      userId: user.id,
      tenantId: profile.tenant_id,
      error: isAdmin ? undefined : 'Usuário não é administrador'
    };
  } catch (err) {
    logger.error('Erro ao verificar autenticação de admin', err);
    return {
      isAdmin: false,
      userId: null,
      tenantId: null,
      error: 'Erro ao verificar permissões'
    };
  }
}

/**
 * Middleware para proteger rotas que requerem admin
 * Lança erro se o usuário não for admin
 */
export async function requireAdmin(): Promise<{ userId: string; tenantId: string }> {
  const result = await checkAdminAuth();

  if (!result.isAdmin || !result.userId) {
    throw new Error(result.error || 'Acesso negado');
  }

  return {
    userId: result.userId,
    tenantId: result.tenantId || ''
  };
}
