-- ================================================
-- STEP 1: TABELA DE CUPONS
-- ================================================

CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text,
  
  -- Tipo de Desconto: 'percentage' ou 'fixed'
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL,
  
  -- Restrições
  min_purchase numeric(10,2) DEFAULT 0.00,
  max_discount numeric(10,2), -- Apenas para tipo 'percentage'
  
  -- Validade e Uso
  usage_limit integer, -- Nulo significa ilimitado
  usage_count integer DEFAULT 0,
  expires_at timestamp,
  is_active boolean DEFAULT true,
  
  created_at timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Garantir código único por tenant
  UNIQUE(tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupons_tenant ON coupons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- ================================================
-- STEP 2: TABELA DE PONTOS DE FIDELIDADE
-- ================================================

CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  points_balance integer DEFAULT 0,
  
  updated_at timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tenant ON loyalty_points(tenant_id);

-- ================================================
-- STEP 3: POLÍTICAS DE RLS (SEGURANÇA)
-- ================================================

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Cupons: Clientes podem visualizar, Admins podem gerenciar
CREATE POLICY "Lojistas podem gerenciar seus próprios cupons"
  ON coupons FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clientes podem visualizar cupons ativos"
  ON coupons FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Pontos: Usuários veem seus próprios, Admins veem da sua loja
CREATE POLICY "Usuários veem seus próprios pontos"
  ON loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Lojistas veem pontos de seus clientes"
  ON loyalty_points FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
