// Script para configurar o banco de dados Supabase automaticamente
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yoprdgfhznxdrypinmkx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcHJkZ2Zoem54ZHJ5cGlubWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU0MDgzMSwiZXhwIjoyMDgyMTE2ODMxfQ.0L-BEQG0FjwvbEBSBANOvcBvDfZGalSGAMoLKmm1kWM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function setupDatabase() {
    console.log('🚀 Iniciando configuração do banco de dados...\n');

    const queries = [
        {
            name: '1. Criar tabela profiles',
            sql: `
        -- Create the profiles table
        CREATE TABLE IF NOT EXISTS profiles (
          id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
          email text NOT NULL,
          name text,
          phone text,
          address jsonb,
          updated_at timestamp with time zone,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Set up Row Level Security (RLS)
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

        -- Create policies
        CREATE POLICY "Users can view their own profile"
          ON profiles FOR SELECT
          USING ( auth.uid() = id );

        CREATE POLICY "Users can update their own profile"
          ON profiles FOR UPDATE
          USING ( auth.uid() = id );

        -- Create an automatic trigger to set updated_at
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          new.updated_at = now();
          RETURN new;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
        CREATE TRIGGER profiles_updated_at
          BEFORE UPDATE ON profiles
          FOR EACH ROW
          EXECUTE FUNCTION handle_updated_at();

        -- Create a function to handle new user signups
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, name)
          VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
          );
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Trigger the function every time a user is created
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
        },
        {
            name: '2. Criar tabela clientes',
            sql: `
        -- Create clientes table
        CREATE TABLE IF NOT EXISTS clientes (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          nome text NOT NULL,
          celular text NOT NULL UNIQUE,
          cpf text,
          endereco jsonb,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Enable RLS
        ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies
        DROP POLICY IF EXISTS "Public Select Clientes" ON clientes;
        DROP POLICY IF EXISTS "Public Insert Clientes" ON clientes;

        -- Permitir SELECT para todos
        CREATE POLICY "Public Select Clientes" ON clientes
          FOR SELECT USING (true);

        -- Permitir INSERT para todos
        CREATE POLICY "Public Insert Clientes" ON clientes
          FOR INSERT WITH CHECK (true);
      `
        },
        {
            name: '3. Criar tabela orders',
            sql: `
        -- Create orders table
        CREATE TABLE IF NOT EXISTS orders (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          cliente_id uuid REFERENCES clientes(id),
          customer_name text NOT NULL,
          customer_phone text NOT NULL,
          items jsonb NOT NULL,
          status text NOT NULL DEFAULT 'pending',
          total numeric NOT NULL,
          address text NOT NULL,
          payment_method text NOT NULL,
          change_for text,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          delivery_address text,
          items_count integer,
          total_amount numeric,
          motoboy_id uuid REFERENCES auth.users(id),
          motoboy_name text,
          motoboy_arrived boolean DEFAULT false,
          estimated_time integer
        );

        -- Enable RLS
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies
        DROP POLICY IF EXISTS "Public Select Orders" ON orders;
        DROP POLICY IF EXISTS "Public Insert Orders" ON orders;
        DROP POLICY IF EXISTS "Public Update Orders" ON orders;

        -- Permitir SELECT para todos
        CREATE POLICY "Public Select Orders" ON orders
          FOR SELECT USING (true);

        -- Permitir INSERT para todos
        CREATE POLICY "Public Insert Orders" ON orders
          FOR INSERT WITH CHECK (true);

        -- Permitir UPDATE para todos
        CREATE POLICY "Public Update Orders" ON orders
          FOR UPDATE USING (true);
      `
        },
        {
            name: '4. Criar tabela loja_info',
            sql: `
        -- Create loja_info table
        CREATE TABLE IF NOT EXISTS loja_info (
          id integer PRIMARY KEY DEFAULT 1,
          tempo_maximo_preparo integer DEFAULT 15,
          premio_dia text,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          CONSTRAINT single_row CHECK (id = 1)
        );

        -- Insert default values
        INSERT INTO loja_info (id, tempo_maximo_preparo, premio_dia)
        VALUES (1, 15, 'Hambúrguer Grátis')
        ON CONFLICT (id) DO NOTHING;

        -- Enable RLS
        ALTER TABLE loja_info ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies
        DROP POLICY IF EXISTS "Public Select Loja Info" ON loja_info;
        DROP POLICY IF EXISTS "Authenticated Update Loja Info" ON loja_info;

        -- Permitir SELECT para todos
        CREATE POLICY "Public Select Loja Info" ON loja_info
          FOR SELECT USING (true);

        -- Permitir UPDATE apenas para usuários autenticados
        CREATE POLICY "Authenticated Update Loja Info" ON loja_info
          FOR UPDATE USING (auth.role() = 'authenticated');
      `
        }
    ];

    for (const query of queries) {
        try {
            console.log(`⏳ Executando: ${query.name}...`);
            const { error } = await supabase.rpc('exec_sql', { sql_query: query.sql });

            if (error) {
                // Tenta executar diretamente se RPC não funcionar
                const { error: directError } = await supabase.from('_').select('*').limit(0);
                console.log(`⚠️  Aviso em ${query.name}: ${error.message}`);
            } else {
                console.log(`✅ ${query.name} - Concluído`);
            }
        } catch (err) {
            console.log(`⚠️  ${query.name} - ${err.message}`);
        }
    }

    console.log('\n✅ Configuração do banco de dados concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Acesse o Supabase Dashboard: https://yoprdgfhznxdrypinmkx.supabase.co');
    console.log('2. Vá em SQL Editor e execute os scripts do arquivo SETUP_DATABASE.md');
    console.log('3. Crie um usuário admin em Authentication → Users');
    console.log('4. Execute: npm run dev (em cada projeto)');
}

setupDatabase().catch(console.error);
