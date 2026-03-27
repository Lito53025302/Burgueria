-- ============================================
-- FIX: Atualizar app_metadata dos usuários existentes
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Atualizar o trigger para garantir que app_metadata seja atualizado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tenant_id uuid;
  user_role text;
  user_name text;
BEGIN
  -- Extrair dados do metadata
  user_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::uuid;
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'admin');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

  -- Inserir profile
  INSERT INTO public.profiles (id, email, name, role, tenant_id, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    user_tenant_id,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    tenant_id = EXCLUDED.tenant_id;

  -- IMPORTANTE: Atualizar app_metadata IMEDIATAMENTE
  IF user_tenant_id IS NOT NULL THEN
    NEW.raw_app_meta_data := 
      COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object(
        'tenant_id', user_tenant_id::text,
        'role', user_role
      );
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Atualizar manualmente os usuários existentes que não têm tenant_id no app_metadata

-- Atualizar João (e outros usuários com tenant_id no profile mas não no app_metadata)
UPDATE auth.users u
SET raw_app_meta_data = 
  COALESCE(u.raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object(
    'tenant_id', p.tenant_id::text,
    'role', p.role
  )
FROM profiles p
WHERE u.id = p.id
  AND p.tenant_id IS NOT NULL
  AND (u.raw_app_meta_data->>'tenant_id' IS NULL 
       OR u.raw_app_meta_data->>'tenant_id' != p.tenant_id::text);

-- 3. Verificar se foi atualizado
SELECT 
  u.email,
  p.tenant_id as profile_tenant_id,
  (u.raw_app_meta_data->>'tenant_id')::uuid as app_meta_tenant_id,
  p.role,
  u.raw_app_meta_data->>'role' as app_meta_role
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.tenant_id IS NOT NULL;

-- Se tudo estiver OK, verá que profile_tenant_id = app_meta_tenant_id
