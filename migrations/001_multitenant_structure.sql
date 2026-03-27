-- ============================================
-- FASE 1: ESTRUTURA MULTI-TENANT (SEM RLS)
-- Execute este primeiro, depois execute o 002_fix_rls_policies.sql
-- ============================================

-- ================================================
-- STEP 1: CRIAR TABELA DE TENANTS (LOJAS)
-- ================================================

CREATE TABLE IF NOT EXISTS tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações Básicas
  name text NOT NULL,              
  subdomain text UNIQUE NOT NULL,  
  slug text UNIQUE NOT NULL,       
  
  -- Customização Visual
  primary_color text DEFAULT '#FF6B6B',
  secondary_color text DEFAULT '#4ECDC4',
  logo_url text,
  banner_url text,
  
  -- Configurações de Negócio
  is_active boolean DEFAULT true,
  subscription_plan text DEFAULT 'trial',
  subscription_expires_at timestamp,
  
  -- Informações de Contato
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  owner_phone text,
  
  -- Endereço da Loja
  address text,
  city text,
  state text,
  zip_code text,
  
  -- Horário de Funcionamento
  opening_time text DEFAULT '18:00',
  closing_time text DEFAULT '23:00',
  
  -- Configurações de Delivery
  delivery_fee numeric(10,2) DEFAULT 5.00,
  minimum_order numeric(10,2) DEFAULT 20.00,
  delivery_radius_km integer DEFAULT 10,
  
  -- Timestamps
  created_at timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- ================================================
-- STEP 2: ADICIONAR tenant_id NAS TABELAS
-- ================================================

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON menu_items(tenant_id);

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON profiles(tenant_id);

ALTER TABLE available_customizations 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_customizations_tenant ON available_customizations(tenant_id);

-- ================================================
-- STEP 3: MOTOBOYS COMPARTILHADOS
-- ================================================

CREATE TABLE IF NOT EXISTS deliverer_tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deliverer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(deliverer_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_deliverer_tenants_deliverer ON deliverer_tenants(deliverer_id);
CREATE INDEX IF NOT EXISTS idx_deliverer_tenants_tenant ON deliverer_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deliverer_tenants_active ON deliverer_tenants(is_active);

-- ================================================
-- STEP 4: MIGRAÇÃO PARA TENANT PADRÃO
-- ================================================

DO $$
DECLARE
  default_tenant_id uuid;
BEGIN
  INSERT INTO tenants (
    name, subdomain, slug, owner_name, owner_email,
    primary_color, secondary_color, subscription_plan
  )
  VALUES (
    'Burgueria Principal', 'principal', 'principal',
    'Paulo', 'litogarinho@gmail.com',
    '#FF6B6B', '#4ECDC4', 'enterprise'
  )
  ON CONFLICT (subdomain) DO NOTHING
  RETURNING id INTO default_tenant_id;

  IF default_tenant_id IS NULL THEN
    SELECT id INTO default_tenant_id FROM tenants WHERE subdomain = 'principal';
  END IF;

  UPDATE menu_items SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE orders SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE available_customizations SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE profiles 
  SET tenant_id = default_tenant_id 
  WHERE tenant_id IS NULL AND role IN ('admin', 'manager');

  RAISE NOTICE 'Tenant padrão criado com ID: %', default_tenant_id;
END $$;

-- ================================================
-- STEP 5: TORNAR tenant_id OBRIGATÓRIO
-- ================================================

ALTER TABLE menu_items ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;

-- ================================================
-- STEP 6: FUNÇÕES AUXILIARES
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION add_deliverer_to_tenant(
  p_deliverer_id uuid,
  p_tenant_id uuid
)
RETURNS void AS $$
BEGIN
  INSERT INTO deliverer_tenants (deliverer_id, tenant_id, is_active)
  VALUES (p_deliverer_id, p_tenant_id, true)
  ON CONFLICT (deliverer_id, tenant_id) 
  DO UPDATE SET is_active = true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_deliverer_from_tenant(
  p_deliverer_id uuid,
  p_tenant_id uuid
)
RETURNS void AS $$
BEGIN
  UPDATE deliverer_tenants
  SET is_active = false
  WHERE deliverer_id = p_deliverer_id
  AND tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- STEP 7: VIEWS
-- ================================================

CREATE OR REPLACE VIEW tenant_stats AS
SELECT 
  t.id as tenant_id,
  t.name as tenant_name,
  t.subdomain,
  t.is_active,
  t.subscription_plan,
  COUNT(DISTINCT m.id) as total_menu_items,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as completed_orders,
  COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END), 0) as total_revenue,
  (
    SELECT COUNT(*)
    FROM deliverer_tenants dt
    WHERE dt.tenant_id = t.id AND dt.is_active = true
  ) as active_deliverers
FROM tenants t
LEFT JOIN menu_items m ON m.tenant_id = t.id
LEFT JOIN orders o ON o.tenant_id = t.id
GROUP BY t.id;

CREATE OR REPLACE VIEW available_orders_for_deliverer AS
SELECT 
  o.*,
  t.name as tenant_name,
  t.subdomain as tenant_subdomain,
  t.primary_color as tenant_color
FROM orders o
JOIN tenants t ON t.id = o.tenant_id
WHERE o.status IN ('ready', 'awaiting_pickup')
AND o.motoboy_id IS NULL;

-- ================================================
-- VERIFICAÇÃO
-- ================================================

SELECT 
  'Tenants' as tabela, COUNT(*) as total FROM tenants
UNION ALL
SELECT 'Menu Items com Tenant', COUNT(*) FROM menu_items WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'Orders com Tenant', COUNT(*) FROM orders WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'Profiles Admin com Tenant', COUNT(*) FROM profiles WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'Profiles Deliverer (compartilhado)', COUNT(*) FROM profiles WHERE role = 'deliverer';
