-- ============================================
-- TRIGGER: Criar profile automaticamente após signup
-- Execute no Supabase SQL Editor
-- ============================================

-- Função que cria profile automaticamente quando um usuário se registra
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

  -- Atualizar app_metadata do usuário com tenant_id
  IF user_tenant_id IS NOT NULL THEN
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object(
        'tenant_id', user_tenant_id::text,
        'role', user_role
      )
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comentário
COMMENT ON FUNCTION public.handle_new_user IS 'Cria profile automaticamente quando usuário se registra e adiciona tenant_id ao app_metadata';

-- Verificar se o trigger foi criado
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
