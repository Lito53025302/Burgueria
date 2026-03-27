-- ============================================
-- TRIGGER: AUTO-CONFIGURAR tenant_id NO JWT
-- ============================================
-- Este trigger garante que quando um profile é criado com tenant_id,
-- o mesmo tenant_id seja adicionado ao app_metadata do usuário

CREATE OR REPLACE FUNCTION sync_tenant_to_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o profile tem tenant_id, atualizar o app_metadata do user
  IF NEW.tenant_id IS NOT NULL THEN
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('tenant_id', NEW.tenant_id::text)
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa após INSERT ou UPDATE no profiles
DROP TRIGGER IF EXISTS trigger_sync_tenant_metadata ON profiles;
CREATE TRIGGER trigger_sync_tenant_metadata
  AFTER INSERT OR UPDATE OF tenant_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_tenant_to_user_metadata();

-- Comentário
COMMENT ON FUNCTION sync_tenant_to_user_metadata() IS 
  'Sincroniza tenant_id do profile para app_metadata do usuário para RLS';

-- ============================================
-- TESTE: Verificar se trigger está ativo
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_sync_tenant_metadata';
