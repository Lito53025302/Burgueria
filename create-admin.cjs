// Script para criar o primeiro usuário admin
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yoprdgfhznxdrypinmkx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcHJkZ2Zoem54ZHJ5cGlubWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU0MDgzMSwiZXhwIjoyMDgyMTE2ODMxfQ.0L-BEQG0FjwvbEBSBANOvcBvDfZGalSGAMoLKmm1kWM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUser() {
    console.log('🔐 Criando usuário admin...\n');

    const email = 'admin@burgueria.com';
    const password = 'Admin@2024!'; // Senha forte
    const name = 'Administrador';

    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                name: name,
                role: 'admin'
            }
        });

        if (error) {
            console.error('❌ Erro ao criar usuário:', error.message);
            return;
        }

        console.log('✅ Usuário admin criado com sucesso!\n');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
        console.log('👤 Nome:', name);
        console.log('\n⚠️  IMPORTANTE: Guarde essas credenciais em local seguro!');
        console.log('\n🚀 Agora você pode fazer login no Painel Admin com essas credenciais.');

    } catch (err) {
        console.error('❌ Erro inesperado:', err.message);
    }
}

createAdminUser();
