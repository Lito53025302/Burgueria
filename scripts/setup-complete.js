import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
const supabaseUrl = 'https://yoprdgfhznxdrypinmkx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcHJkZ2Zoem54ZHJ5cGlubWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NDA4MzEsImV4cCI6MjA4MjExNjgzMX0.mxSYeSxIKiENi4pZjvDgwwF3HgtD51UgGv2I5M9h_vY';

const supabase = createClient(supabaseUrl, supabaseKey);

// 🏪 Lojas Mock com produtos de exemplo
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
        delivery_radius_km: 5,
        latitude: -23.5505,
        longitude: -46.6333,
        menu_items: [
            {
                name: 'Whopper Clássico',
                description: 'O clássico hambúrguer com carne grelhada',
                price: 28.90,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
                category: 'Hambúrgueres',
                available: true
            },
            {
                name: 'Batata Frita Grande',
                description: 'Batatas crocantes e douradas',
                price: 12.90,
                image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop',
                category: 'Acompanhamentos',
                available: true
            },
            {
                name: 'Refrigerante 500ml',
                description: 'Coca-Cola gelada',
                price: 7.90,
                image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
                category: 'Bebidas',
                available: true
            },
            {
                name: 'Whopper Bacon',
                description: 'Whopper com bacon crocante',
                price: 32.90,
                image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop',
                category: 'Hambúrgueres',
                available: true
            },
            {
                name: 'Onion Rings',
                description: 'Anéis de cebola empanados',
                price: 14.90,
                image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=400&fit=crop',
                category: 'Acompanhamentos',
                available: true
            },
            {
                name: 'Milkshake de Chocolate',
                description: 'Cremoso milkshake de chocolate',
                price: 15.90,
                image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop',
                category: 'Bebidas',
                available: true
            }
        ]
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
        delivery_radius_km: 7,
        latitude: -23.5629,
        longitude: -46.6544,
        menu_items: [
            {
                name: 'Pizza Margherita',
                description: 'Molho de tomate, mussarela e manjericão',
                price: 45.90,
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
                category: 'Pizzas',
                available: true
            },
            {
                name: 'Pizza Calabresa',
                description: 'Calabresa, cebola e azeitonas',
                price: 48.90,
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
                category: 'Pizzas',
                available: true
            },
            {
                name: 'Tiramisu',
                description: 'Sobremesa italiana tradicional',
                price: 18.90,
                image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop',
                category: 'Sobremesas',
                available: true
            },
            {
                name: 'Pizza Quatro Queijos',
                description: 'Mussarela, gorgonzola, parmesão e provolone',
                price: 52.90,
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop',
                category: 'Pizzas',
                available: true
            },
            {
                name: 'Bruschetta',
                description: 'Pão italiano com tomate e manjericão',
                price: 22.90,
                image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=400&fit=crop',
                category: 'Entradas',
                available: true
            },
            {
                name: 'Vinho Tinto',
                description: 'Taça de vinho tinto italiano',
                price: 28.90,
                image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
                category: 'Bebidas',
                available: true
            }
        ]
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
        delivery_radius_km: 6,
        latitude: -23.5475,
        longitude: -46.6361,
        menu_items: [
            {
                name: 'Combo Sushi 20 peças',
                description: 'Seleção especial do chef',
                price: 89.90,
                image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop',
                category: 'Combos',
                available: true
            },
            {
                name: 'Sashimi de Salmão',
                description: '10 fatias de salmão fresco',
                price: 65.90,
                image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=400&fit=crop',
                category: 'Sashimi',
                available: true
            },
            {
                name: 'Hot Roll Filadélfia',
                description: 'Salmão, cream cheese e cebolinha',
                price: 42.90,
                image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&h=400&fit=crop',
                category: 'Hot Rolls',
                available: true
            },
            {
                name: 'Temaki de Atum',
                description: 'Cone de alga com atum e gergelim',
                price: 38.90,
                image: 'https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400&h=400&fit=crop',
                category: 'Temaki',
                available: true
            },
            {
                name: 'Yakisoba',
                description: 'Macarrão japonês com legumes',
                price: 45.90,
                image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop',
                category: 'Pratos Quentes',
                available: true
            },
            {
                name: 'Sake Quente',
                description: 'Tradicional bebida japonesa',
                price: 25.90,
                image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
                category: 'Bebidas',
                available: true
            }
        ]
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
        delivery_radius_km: 4,
        latitude: -23.5558,
        longitude: -46.6396,
        menu_items: [
            {
                name: 'Taco de Carne',
                description: 'Carne moída temperada com molhos especiais',
                price: 18.90,
                image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop',
                category: 'Tacos',
                available: true
            },
            {
                name: 'Burrito Supreme',
                description: 'Tortilla recheada com carne, feijão e queijo',
                price: 32.90,
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop',
                category: 'Burritos',
                available: true
            },
            {
                name: 'Nachos com Guacamole',
                description: 'Nachos crocantes com guacamole caseiro',
                price: 24.90,
                image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=400&fit=crop',
                category: 'Entradas',
                available: true
            },
            {
                name: 'Quesadilla de Frango',
                description: 'Tortilla com frango e queijo derretido',
                price: 28.90,
                image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=400&fit=crop',
                category: 'Quesadillas',
                available: true
            },
            {
                name: 'Fajitas Mistas',
                description: 'Carne e frango com pimentões',
                price: 42.90,
                image: 'https://images.unsplash.com/photo-1599974789516-af1c3b4a8d29?w=400&h=400&fit=crop',
                category: 'Fajitas',
                available: true
            },
            {
                name: 'Margarita',
                description: 'Coquetel mexicano clássico',
                price: 22.90,
                image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
                category: 'Bebidas',
                available: true
            }
        ]
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
        delivery_radius_km: 3,
        latitude: -23.5489,
        longitude: -46.6388,
        menu_items: [
            {
                name: 'Açaí 500ml',
                description: 'Açaí puro com granola e banana',
                price: 22.90,
                image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop',
                category: 'Açaí',
                available: true
            },
            {
                name: 'Bowl de Frutas',
                description: 'Mix de frutas frescas da estação',
                price: 18.90,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
                category: 'Bowls',
                available: true
            },
            {
                name: 'Smoothie de Morango',
                description: 'Smoothie natural de morango',
                price: 15.90,
                image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop',
                category: 'Bebidas',
                available: true
            },
            {
                name: 'Açaí 1L',
                description: 'Açaí puro com complementos premium',
                price: 38.90,
                image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
                category: 'Açaí',
                available: true
            },
            {
                name: 'Tapioca Recheada',
                description: 'Tapioca com coco e leite condensado',
                price: 12.90,
                image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop',
                category: 'Lanches',
                available: true
            },
            {
                name: 'Suco Detox',
                description: 'Mix de vegetais e frutas',
                price: 14.90,
                image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop',
                category: 'Bebidas',
                available: true
            }
        ]
    }
];

async function setupTenantsAndProducts() {
    console.log('🚀 Iniciando setup completo...\n');

    try {
        // 1. Verificar se a tabela tenants existe
        console.log('📋 Verificando tabela tenants...');
        const { error: checkError } = await supabase
            .from('tenants')
            .select('id')
            .limit(1);

        if (checkError) {
            console.error('❌ Tabela tenants não existe!');
            console.log('\n💡 IMPORTANTE: Você precisa criar a tabela primeiro!');
            console.log('Execute o SQL em: migrations/create_tenants_table.sql\n');
            return;
        }

        console.log('✅ Tabela tenants encontrada!\n');

        // 2. Limpar dados existentes (opcional)
        console.log('🗑️  Limpando dados antigos...');
        await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('tenants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ Dados limpos!\n');

        // 3. Inserir lojas e produtos
        console.log('📦 Inserindo lojas e produtos...\n');

        for (const tenantData of mockTenants) {
            const { menu_items, ...tenantInfo } = tenantData;

            // Inserir tenant
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .insert([tenantInfo])
                .select()
                .single();

            if (tenantError) {
                console.error(`❌ Erro ao inserir ${tenantInfo.name}:`, tenantError.message);
                continue;
            }

            console.log(`✅ ${tenantInfo.name.padEnd(25)} | ${tenantInfo.subscription_plan.toUpperCase().padEnd(10)}`);

            // Inserir produtos da loja
            if (menu_items && menu_items.length > 0) {
                const itemsWithTenantId = menu_items.map(item => ({
                    ...item,
                    tenant_id: tenant.id
                }));

                const { error: itemsError } = await supabase
                    .from('menu_items')
                    .insert(itemsWithTenantId);

                if (itemsError) {
                    console.error(`   ⚠️  Erro ao inserir produtos:`, itemsError.message);
                } else {
                    console.log(`   📦 ${menu_items.length} produtos adicionados`);
                }
            }
        }

        console.log('\n✨ Setup concluído com sucesso!');
        console.log(`\n📊 Resumo:`);
        console.log(`   - Lojas criadas: ${mockTenants.length}`);
        console.log(`   - Produtos totais: ${mockTenants.reduce((sum, t) => sum + (t.menu_items?.length || 0), 0)}`);

        console.log('\n🌐 Acesse o app e veja as lojas!');
        console.log('   http://localhost:5173\n');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

// Executar setup
setupTenantsAndProducts();
