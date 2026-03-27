-- ============================================
-- FIX: Corrigir políticas RLS (JWT cast)
-- Execute este SQL para corrigir o erro de cast
-- ============================================

-- ================================================
-- RECRIAR POLÍTICAS COM CAST CORRETO
-- ================================================

-- ❌ ERRADO: (auth.jwt() -> 'app_metadata' -> 'tenant_id')::uuid
-- ✅ CERTO:  (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
--            Usar ->> para extrair como TEXT antes do cast

-- Dropar políticas antigas
DROP POLICY IF EXISTS tenant_admin_view ON tenants;
DROP POLICY IF EXISTS tenant_isolation_menu ON menu_items;
DROP POLICY IF EXISTS tenant_isolation_orders ON orders;
DROP POLICY IF EXISTS tenant_isolation_customizations ON available_customizations;
DROP POLICY IF EXISTS deliverer_tenant_view ON deliverer_tenants;

-- ================================================
-- POLÍTICAS CORRIGIDAS
-- ================================================

-- 1. TENANTS (só admin vê próprio tenant)
CREATE POLICY tenant_admin_view ON tenants
  FOR SELECT
  USING (
    -- Admin do tenant pode ver seu próprio tenant
    id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
    OR
    -- Super admin vê todos
    (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'super_admin'
  );

-- 2. MENU_ITEMS (isolamento por tenant)
CREATE POLICY tenant_isolation_menu ON menu_items
  FOR ALL
  USING (
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
  );

-- 3. ORDERS (admin vê do tenant, motoboy vê de todos os tenants que atende)
CREATE POLICY tenant_isolation_orders ON orders
  FOR ALL
  USING (
    -- Admin/Manager vê pedidos do seu tenant
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
    OR
    -- Motoboy vê pedidos dos tenants que ele atende
    EXISTS (
      SELECT 1 FROM deliverer_tenants dt
      WHERE dt.tenant_id = orders.tenant_id
      AND dt.deliverer_id = auth.uid()
      AND dt.is_active = true
    )
  );

-- 4. CUSTOMIZATIONS (global ou por tenant)
CREATE POLICY tenant_isolation_customizations ON available_customizations
  FOR ALL
  USING (
    -- Complementos globais (tenant_id NULL) todos veem
    tenant_id IS NULL
    OR
    -- Complementos específicos só o tenant vê
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
  );

-- 5. DELIVERER_TENANTS (motoboy vê vínculos, admin vê do tenant)
CREATE POLICY deliverer_tenant_view ON deliverer_tenants
  FOR SELECT
  USING (
    -- Motoboy vê seus próprios vínculos
    deliverer_id = auth.uid()
    OR
    -- Admin vê vínculos do seu tenant
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
  );

-- ================================================
-- CRIAR POLÍTICA PARA PROFILES
-- ================================================

-- Habilitar RLS se ainda não estiver
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para profiles
DROP POLICY IF EXISTS profiles_isolation ON profiles;
CREATE POLICY profiles_isolation ON profiles
  FOR ALL
  USING (
    -- Ver próprio perfil
    id = auth.uid()
    OR
    -- Admin vê profiles do seu tenant
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
    OR
    -- Motoboys sem tenant podem ver seu próprio perfil
    (role = 'deliverer' AND id = auth.uid())
  );

-- ================================================
-- ✅ POLÍTICAS RLS CORRIGIDAS!
-- ================================================

SELECT 'Políticas RLS criadas com sucesso!' as resultado;
