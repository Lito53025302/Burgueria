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

async function seedTestData() {
    console.log('🧪 Iniciando criação de dados de teste (Seed)...\n');

    try {
        // 1. Criar Loja de Teste (Tenant)
        const testSubdomain = 'lojateste';
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .upsert({
                name: 'Burgueria de Teste 🍔',
                subdomain: testSubdomain,
                primary_color: '#EAB308', // Amarelo-500
                secondary_color: '#000000',
                opening_time: '00:00', // Sempre aberta para o teste
                closing_time: '23:59',
                is_active: true,
                accepted_payment_methods: ['money', 'card_delivery', 'pix_delivery', 'pix_online'],
                pix_key: 'teste@burgueria.com',
                pix_key_type: 'email'
            }, { onConflict: 'subdomain' })
            .select()
            .single();

        if (tenantError) {
            console.error('❌ Erro ao criar tenant:', tenantError.message);
            return;
        }
        console.log('✅ Loja de Teste criada:', tenant.name);

        // 2. Criar Informações da Loja (Prêmio do Dia)
        const { error: infoError } = await supabase
            .from('loja_info')
            .upsert({
                tenant_id: tenant.id,
                nome: tenant.name,
                premio_dia: '🔥 Combo Duplo + Batata Grande!'
            }, { onConflict: 'tenant_id' });

        if (infoError) console.error('⚠️ Erro ao configurar prêmio:', infoError.message);
        else console.log('✅ Prêmio do dia configurado: 🔥 Combo Duplo + Batata Grande!');

        // 3. Criar Itens do Cardápio
        const menuItems = [
          {
            name: 'Burguer Clássico de Teste',
            description: 'Pão brioche, carne 180g, queijo e molho especial.',
            price: 32.90,
            category: 'Burguers',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
            tenant_id: tenant.id
          },
          {
            name: 'Batata Frita de Teste',
            description: 'Batatas crocantes com sal e alecrim.',
            price: 15.00,
            category: 'Acompanhamentos',
            image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
            tenant_id: tenant.id
          }
        ];

        const { error: menuError } = await supabase
            .from('menu_items')
            .upsert(menuItems, { onConflict: 'name, tenant_id' });

        if (menuError) console.error('❌ Erro ao criar cardápio:', menuError.message);
        else console.log('✅ Itens do cardápio criados.');

        console.log('\n🚀 Dados de teste prontos!');
        console.log(`\n🔗 Cliente: http://localhost:5173/${testSubdomain}`);
        console.log(`🔗 Admin: http://localhost:5173/admin`);
        console.log(`🔗 Entregador: http://localhost:5173/entregador`);
    } catch (err) {
        console.error('💥 Erro fatal:', err.message);
    }
}

seedTestData();
