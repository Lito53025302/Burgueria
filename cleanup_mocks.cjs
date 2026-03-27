const { createClient } = require('@supabase/supabase-js');
// Polyfill de fetch para garantir compatibilidade no Node.js/Windows
try {
  require('cross-fetch/dist/node-polyfill.js');
} catch (e) {
  console.warn('⚠️ cross-fetch não encontrado. Rodando com fetch nativo...');
}

const SUPABASE_URL = 'https://yoprdgfhznxdrypinmkx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcHJkZ2Zoem54ZHJ5cGlubWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU0MDgzMSwiZXhwIjoyMDgyMTE2ODMxfQ.0L-BEQG0FjwvbEBSBANOvcBvDfZGalSGAMoLKmm1kWM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    persistSession: false
  }
});

async function cleanupMockStores() {
    console.log('🧹 Iniciando limpeza de lojas mock antigas...\n');

    // Lista de subdomínios das lojas mock identificadas nos arquivos de guia
    const mockSubdomains = [
        'burger-king-vila',
        'bella-napoli',
        'sushi-master',
        'taco-loco',
        'acai-do-bem',
        'churrascaria-gaucha',
        'veggie-paradise',
        'doce-mania'
    ];

    try {
        const { data, error } = await supabase
            .from('tenants')
            .delete()
            .in('subdomain', mockSubdomains);

        if (error) {
            console.error('❌ Erro ao deletar lojas:', error.message);
        } else {
            console.log('✅ Lojas mock removidas com sucesso!');
            console.log('Lojas afetadas:', mockSubdomains.join(', '));
        }

        console.log('\n🚀 Limpeza concluída! Agora o marketplace mostrará apenas as lojas reais que você criar.');
    } catch (err) {
        console.error('💥 Erro fatal:', err.message);
    }
}

cleanupMockStores();
