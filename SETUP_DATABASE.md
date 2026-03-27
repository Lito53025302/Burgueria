# 🗄️ Setup do Banco de Dados Supabase

Execute estes scripts SQL na ordem indicada no **SQL Editor** do Supabase.

## 📋 Como Executar

1. Acesse seu projeto no Supabase: https://yoprdgfhznxdrypinmkx.supabase.co
2. Vá em **SQL Editor** (menu lateral esquerdo)
3. Clique em **New Query**
4. Cole cada script abaixo e clique em **Run**

---

## 1️⃣ Criar Tabela de Perfis (profiles)

```sql
-- Create the profiles table
CREATE TABLE profiles (
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
```

---

## 2️⃣ Criar Tabela de Clientes

```sql
-- Create clientes table
CREATE TABLE clientes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  celular text NOT NULL UNIQUE,
  cpf text,
  endereco jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT para todos
CREATE POLICY "Public Select Clientes" ON clientes
  FOR SELECT USING (true);

-- Permitir INSERT para todos
CREATE POLICY "Public Insert Clientes" ON clientes
  FOR INSERT WITH CHECK (true);
```

---

## 3️⃣ Criar Tabela de Pedidos (orders)

```sql
-- Create orders table
CREATE TABLE orders (
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

-- Permitir SELECT para todos
CREATE POLICY "Public Select Orders" ON orders
  FOR SELECT USING (true);

-- Permitir INSERT para todos
CREATE POLICY "Public Insert Orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Permitir UPDATE para todos
CREATE POLICY "Public Update Orders" ON orders
  FOR UPDATE USING (true);
```

---

## 4️⃣ Criar Tabela de Informações da Loja

```sql
-- Create loja_info table
CREATE TABLE loja_info (
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

-- Permitir SELECT para todos
CREATE POLICY "Public Select Loja Info" ON loja_info
  FOR SELECT USING (true);

-- Permitir UPDATE apenas para usuários autenticados
CREATE POLICY "Authenticated Update Loja Info" ON loja_info
  FOR UPDATE USING (auth.role() = 'authenticated');
```

---

## ✅ Verificação

Após executar todos os scripts, verifique se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver:
- `clientes`
- `loja_info`
- `orders`
- `profiles`

---

## 🔐 Próximo Passo: Criar Usuário Admin

Após criar as tabelas, você precisa criar um usuário admin. Vá em:
**Authentication** → **Users** → **Add user**

Ou execute via SQL Editor:

```sql
-- Substitua com seu email e senha
-- Nota: Este comando só funciona se você tiver permissões de admin
```

Melhor criar pelo dashboard do Supabase em Authentication → Users.
