# 🚀 Setup Rápido do Banco de Dados

## Passo 1: Acesse o SQL Editor

1. Abra: https://supabase.com/dashboard/project/yoprdgfhznxdrypinmkx/sql/new
2. Cole TODO o script abaixo
3. Clique em **RUN** (ou pressione Ctrl+Enter)

---

## Script Completo (Cole tudo de uma vez)

```sql
-- ============================================
-- SETUP COMPLETO DO BANCO DE DADOS BURGUERIA
-- ============================================

-- 1. TABELA PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text NOT NULL,
  name text,
  phone text,
  address jsonb,
  updated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING ( auth.uid() = id );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING ( auth.uid() = id );

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
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABELA CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  celular text NOT NULL UNIQUE,
  cpf text,
  endereco jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select Clientes" ON clientes;
DROP POLICY IF EXISTS "Public Insert Clientes" ON clientes;

CREATE POLICY "Public Select Clientes" ON clientes FOR SELECT USING (true);
CREATE POLICY "Public Insert Clientes" ON clientes FOR INSERT WITH CHECK (true);

-- 3. TABELA ORDERS
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

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select Orders" ON orders;
DROP POLICY IF EXISTS "Public Insert Orders" ON orders;
DROP POLICY IF EXISTS "Public Update Orders" ON orders;

CREATE POLICY "Public Select Orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Orders" ON orders FOR UPDATE USING (true);

-- 4. TABELA LOJA_INFO
CREATE TABLE IF NOT EXISTS loja_info (
  id integer PRIMARY KEY DEFAULT 1,
  tempo_maximo_preparo integer DEFAULT 15,
  premio_dia text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO loja_info (id, tempo_maximo_preparo, premio_dia)
VALUES (1, 15, 'Hambúrguer Grátis')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE loja_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select Loja Info" ON loja_info;
DROP POLICY IF EXISTS "Authenticated Update Loja Info" ON loja_info;

CREATE POLICY "Public Select Loja Info" ON loja_info FOR SELECT USING (true);
CREATE POLICY "Authenticated Update Loja Info" ON loja_info 
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ✅ SETUP CONCLUÍDO!
SELECT 'Database setup completed successfully!' as message;
```

---

## Passo 2: Criar Usuário Admin

1. Vá em: **Authentication** → **Users** → **Add user**
2. Preencha:
   - **Email**: seu@email.com
   - **Password**: (escolha uma senha forte)
   - **Auto Confirm User**: ✅ Marque esta opção
3. Clique em **Create user**

---

## Passo 3: Testar os Apps

Execute em 3 terminais diferentes:

```bash
# Terminal 1 - App Principal (Cliente)
cd "C:\Users\paulo\Desktop\Burgueria"
npm run dev

# Terminal 2 - App Entregador
cd "C:\Users\paulo\Desktop\Burgueria\Entregador"
npm run dev

# Terminal 3 - Painel Admin
cd "C:\Users\paulo\Desktop\Burgueria\Painel Burguer"
npm run dev
```

---

## ✅ Checklist

- [ ] Script SQL executado no Supabase
- [ ] Usuário admin criado
- [ ] 3 apps rodando (portas diferentes)
- [ ] Login funcionando no painel admin

---

## 🔗 Links Úteis

- **Supabase Dashboard**: https://supabase.com/dashboard/project/yoprdgfhznxdrypinmkx
- **SQL Editor**: https://supabase.com/dashboard/project/yoprdgfhznxdrypinmkx/sql/new
- **Authentication**: https://supabase.com/dashboard/project/yoprdgfhznxdrypinmkx/auth/users
