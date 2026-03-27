-- 1. Garante que a tabela profiles existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  email TEXT,
  role TEXT DEFAULT 'customer'
);

-- 2. Ativa segurança (RLS) se ainda não estiver ativa
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Garante que a coluna role existe (caso a tabela já existisse sem ela)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'customer';
  END IF;
END $$;

-- 4. Limpa policies antigas para recriar corretamente
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 5. Cria Policies de Acesso
-- Todos podem ver perfis (necessário para checar role)
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT 
  USING ( true );

-- Usuários podem criar seu próprio perfil
CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT 
  WITH CHECK ( auth.uid() = id );

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE 
  USING ( auth.uid() = id );

-- Admins têm acesso total (Update)
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 6. Trigger para criar perfil automaticamente ao cadastrar usuário (se não existir)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger antigo se existir para recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Define Admin (SUBSTITUA SEU EMAIL ABAIXO)
-- Tenta atualizar se o perfil já existir
UPDATE profiles 
SET role = 'admin' 
WHERE email ILIKE '%@%'; -- Vai tentar pegar qualquer email, mas o ideal é você rodar o update manual para seu email específico se precisar.
