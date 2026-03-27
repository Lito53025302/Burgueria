const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yoprdgfhznxdrypinmkx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcHJkZ2Zoem54ZHJ5cGlubWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU0MDgzMSwiZXhwIjoyMDgyMTE2ODMxfQ.0L-BEQG0FjwvbEBSBANOvcBvDfZGalSGAMoLKmm1kWM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const USER_UID = 'ac37874d-5d2d-47ac-b32c-20472746e6b0';

async function setSuperAdmin() {
    console.log(`🚀 Promovendo usuário ${USER_UID} para Super Admin...`);

    try {
        // 1. Atualizar o Profile
        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                role: 'super_admin',
            })
            .eq('id', USER_UID)
            .select();

        if (error) {
            console.error('❌ Erro ao atualizar perfil:', error.message);
            return;
        }

        if (data && data.length > 0) {
            console.log('✅ Usuário promovido com sucesso no banco de dados!');
            console.log('Dados atualizados:', JSON.stringify(data[0], null, 2));
        } else {
            console.warn('⚠️ Perfil não encontrado. Criando um novo perfil...');
            
            // Tentar buscar o usuário no auth para pegar o email
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(USER_UID);
            
            if (authError) {
                console.error('❌ Erro ao buscar usuário no Auth:', authError.message);
                return;
            }

            const { error: insertError } = await supabase
                .from('profiles')
                .insert([{
                    id: USER_UID,
                    email: authUser.user.email,
                    name: authUser.user.user_metadata?.name || 'Super Admin',
                    role: 'super_admin'
                }]);

            if (insertError) {
                console.error('❌ Erro ao inserir novo perfil:', insertError.message);
            } else {
                console.log('✅ Perfil de Super Admin criado com sucesso!');
            }
        }

        // 2. Atualizar Metadata do Auth (importante para o JWT)
        console.log('🔑 Atualizando metadados de autenticação...');
        const { error: metaError } = await supabase.auth.admin.updateUserById(USER_UID, {
            app_metadata: { role: 'super_admin' }
        });

        if (metaError) {
            console.error('❌ Erro ao atualizar metadados do Auth:', metaError.message);
        } else {
            console.log('✅ Metadados do Auth atualizados (Role: super_admin)!');
        }

    } catch (err) {
        console.error('💥 Erro fatal:', err);
    }
}

setSuperAdmin();
