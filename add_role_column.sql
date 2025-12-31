-- Adiciona coluna role se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'customer';
  END IF;
END $$;

-- Atualizar política de segurança para permitir que admins vejam todos os profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Atualizar política de segurança para permitir que admins atualizem profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Atualizar usuário atual para admin (para evitar bloqueio)
-- IMPORTANTE: Substitua 'seu@email.com' pelo email do admin atual
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'seu@email.com'; -- ALTERAR ISSO DEPOIS
