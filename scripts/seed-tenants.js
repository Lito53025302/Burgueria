import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase (do arquivo .env)
const supabaseUrl = 'https://yoprdgfhznxdrypinmkx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcHJkZ2Zoem54ZHJ5cGlubWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NDA4MzEsImV4cCI6MjA4MjExNjgzMX0.mxSYeSxIKiENi4pZjvDgwwF3HgtD51UgGv2I5M9h_vY';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não encontradas!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 🏪 Lojas Mock de Teste
const mockTenants = [
    {
        name: 'Burger King da Vila',
        subdomain: 'burger-king-vila',
        slug: 'burger-king-vila',
        primary_color: '#D62300',
        secondary_color: '#F5EBDC',
        logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=400&fit=crop',
        is_active: true,
        subscription_plan: 'pro',
        subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        owner_name: 'João Silva',
        owner_email: 'joao@burgerking.com',
        owner_phone: '11987654321',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        opening_time: '11:00',
        closing_time: '23:00',
        delivery_fee: 8.00,
        minimum_order: 25.00,
        delivery_radius_km: 5
    },
    {
        name: 'Pizzaria Bella Napoli',
        subdomain: 'bella-napoli',
        slug: 'bella-napoli',
        primary_color: '#C8102E',
        secondary_color: '#009246',
        logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=400&fit=crop',
        is_active: true,
        subscription_plan: 'basic',
        subscription_expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        owner_name: 'Maria Rossi',
        owner_email: 'maria@bellanapoli.com',
        owner_phone: '11976543210',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01310-100',
        opening_time: '18:00',
        closing_time: '00:00',
        delivery_fee: 10.00,
        minimum_order: 35.00,
        delivery_radius_km: 7
    },
    {
        name: 'Sushi Master',
        subdomain: 'sushi-master',
        slug: 'sushi-master',
        primary_color: '#E60012',
        secondary_color: '#000000',
        logo_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=400&fit=crop',
        is_active: true,
        subscription_plan: 'pro',
        subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        owner_name: 'Takeshi Yamamoto',
        owner_email: 'takeshi@sushimaster.com',
        owner_phone: '11965432109',
        address: 'Rua da Liberdade, 456',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01503-001',
        opening_time: '11:30',
        closing_time: '23:30',
        delivery_fee: 12.00,
        minimum_order: 50.00,
        delivery_radius_km: 6
    },
    {
        name: 'Taco Loco',
        subdomain: 'taco-loco',
        slug: 'taco-loco',
        primary_color: '#FF6B35',
        secondary_color: '#F7931E',
        logo_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&h=200&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&h=400&fit=crop',
        is_active: true,
        subscription_plan: 'trial',
        subscription_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        owner_name: 'Carlos Rodriguez',
        owner_email: 'carlos@tacoloco.com',
        owner_phone: '11954321098',
        address: 'Rua Augusta, 789',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01305-100',
        opening_time: '12:00',
        closing_time: '22:00',
        delivery_fee: 7.00,
        minimum_order: 20.00,
        delivery_radius_km: 4
    },
    {
        name: 'Açaí do Bem',
        subdomain: 'acai-do-bem',
        slug: 'acai-do-bem',
        primary_color: '#6B2C91',
        secondary_color: '#E91E63',
        logo_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200&h=200&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1200&h=400&fit=crop',
        is_active: true,
        subscription_plan: 'basic',
        subscription_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        owner_name: 'Ana Paula',
        owner_email: 'ana@acaidobem.com',
        owner_phone: '11943210987',
        address: 'Av. Brigadeiro, 321',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01402-001',
        opening_time: '10:00',
        closing_time: '20:00',
        delivery_fee: 5.00,
        minimum_order: 15.00,
        delivery_radius_km: 3
    },
    {
        name: 'Churrascaria Gaúcha',
        subdomain: 'churrascaria-gaucha',
        slug: 'churrascaria-gaucha',
        primary_color: '#8B4513',
        secondary_color: '#D2691E',
        logo_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=400&fit=crop',
        is_active: true,
        subscription_plan: 'enterprise',
        subscription_expires_at: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
        owner_name: 'Pedro Gomes',
        owner_email: 'pedro@churrascariaGaucha.com',
        owner_phone: '11932109876',
        address: 'Rua dos Pinheiros, 654',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '05422-001',
        opening_time: '11:00',
        closing_time: '23:30',
        delivery_fee: 15.00,
        minimum_order: 60.00,
        delivery_radius_km: 8
    },
    {
        name: 'Veggie Paradise',
        subdomain: 'veggie-paradise',
        slug: 'veggie-paradise',
        primary_color: '#4CAF50',
        secondary_color: '#8BC34A',
        logo_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=400&fit=crop',
        is_active: false, // Loja inativa para teste
        subscription_plan: 'basic',
        subscription_expires_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Expirada
        owner_name: 'Laura Green',
        owner_email: 'laura@veggieparadise.com',
        owner_phone: '11921098765',
        address: 'Rua Harmonia, 987',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '05435-000',
        opening_time: '11:00',
        closing_time: '21:00',
        delivery_fee: 6.00,
        minimum_order: 22.00,
        delivery_radius_km: 5
    },
    {
        name: 'Doce Mania',
        subdomain: 'doce-mania',
        slug: 'doce-mania',
        primary_color: '#FF69B4',
        secondary_color: '#FFB6C1',
        logo_url: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=200&h=200&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&h=400&fit=crop',
        is_active: true,
        subscription_plan: 'basic',
        subscription_expires_at: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        owner_name: 'Juliana Santos',
        owner_email: 'juliana@docemania.com',
        owner_phone: '11910987654',
        address: 'Rua Oscar Freire, 234',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01426-001',
        opening_time: '09:00',
        closing_time: '19:00',
        delivery_fee: 8.00,
        minimum_order: 30.00,
        delivery_radius_km: 4
    }
];

async function seedTenants() {
    console.log('🌱 Iniciando seed de tenants...\n');

    try {
        // Verificar se a tabela tenants existe
        const { data: existingTenants, error: checkError } = await supabase
            .from('tenants')
            .select('subdomain')
            .limit(1);

        if (checkError) {
            console.error('❌ Erro ao verificar tabela tenants:', checkError.message);
            console.log('\n💡 Dica: Você precisa criar a tabela tenants primeiro!');
            console.log('Execute o script SQL de criação da tabela antes de rodar este seed.\n');
            return;
        }

        // Limpar tenants existentes (opcional - comentar se quiser manter)
        console.log('🗑️  Limpando tenants existentes...');
        const { error: deleteError } = await supabase
            .from('tenants')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos

        if (deleteError) {
            console.warn('⚠️  Aviso ao limpar:', deleteError.message);
        }

        // Inserir lojas mock
        console.log('📦 Inserindo lojas mock...\n');

        for (const tenant of mockTenants) {
            const { data, error } = await supabase
                .from('tenants')
                .insert([tenant])
                .select()
                .single();

            if (error) {
                console.error(`❌ Erro ao inserir ${tenant.name}:`, error.message);
            } else {
                const status = tenant.is_active ? '✅' : '❌';
                const plan = tenant.subscription_plan.toUpperCase().padEnd(10);
                console.log(`${status} ${tenant.name.padEnd(25)} | ${plan} | ${tenant.subdomain}`);
            }
        }

        console.log('\n✨ Seed concluído com sucesso!');
        console.log(`\n📊 Total de lojas criadas: ${mockTenants.length}`);
        console.log(`   - Ativas: ${mockTenants.filter(t => t.is_active).length}`);
        console.log(`   - Inativas: ${mockTenants.filter(t => !t.is_active).length}`);

        console.log('\n🎨 Lojas por plano:');
        console.log(`   - Trial: ${mockTenants.filter(t => t.subscription_plan === 'trial').length}`);
        console.log(`   - Basic: ${mockTenants.filter(t => t.subscription_plan === 'basic').length}`);
        console.log(`   - Pro: ${mockTenants.filter(t => t.subscription_plan === 'pro').length}`);
        console.log(`   - Enterprise: ${mockTenants.filter(t => t.subscription_plan === 'enterprise').length}`);

        console.log('\n🔗 URLs de teste:');
        mockTenants.slice(0, 3).forEach(t => {
            console.log(`   - ${t.name}: http://${t.subdomain}.localhost:5173`);
        });

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

// Executar seed
seedTenants();
