import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export function useAdmin() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function checkAdminRole() {
            if (!user) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    logger.error('Erro ao verificar role do usuário', error);
                    setIsAdmin(false);
                } else {
                    // Se a role for admin ou se não tiver role (para compatibilidade inicial) assume true temporariamente
                    // TODO: Remover a verificação de 'undefined' quando todos tiverem role
                    const hasAdminRole = data?.role === 'admin';
                    setIsAdmin(hasAdminRole);

                    if (!hasAdminRole) {
                        logger.warn('Usuário tentou acessar área admin sem permissão', { userId: user.id });
                    }
                }
            } catch (err) {
                logger.error('Erro inesperado ao verificar admin', err);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        }

        checkAdminRole();
    }, [user]);

    return { isAdmin, loading };
}
