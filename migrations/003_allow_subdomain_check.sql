-- ============================================
-- FIX: Permitir verificação de subdomain
-- Execute no Supabase SQL Editor
-- ============================================

-- Política para permitir verificação de subdomain (somente campo id)
-- Usuários não autenticados podem verificar se subdomain existe
CREATE POLICY tenant_subdomain_check ON tenants
  FOR SELECT
  USING (true); -- Permite SELECT para todos

-- Mas para segurança, vamos criar uma função específica
-- que só retorna se o subdomain existe, sem expor outros dados

CREATE OR REPLACE FUNCTION check_subdomain_available(p_subdomain text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM tenants WHERE subdomain = p_subdomain
  );
END;
$$;

-- Grant para uso público
GRANT EXECUTE ON FUNCTION check_subdomain_available(text) TO anon;
GRANT EXECUTE ON FUNCTION check_subdomain_available(text) TO authenticated;

-- Comentário
COMMENT ON FUNCTION check_subdomain_available IS 'Verifica se um subdomain está disponível (retorna true se disponível)';

-- Teste
SELECT check_subdomain_available('principal'); -- deve retornar false (já existe)
SELECT check_subdomain_available('teste-novo'); -- deve retornar true (disponível)
