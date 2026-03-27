-- ============================================
-- CRIAÇÃO DA TABELA TENANTS (VERSÃO SIMPLIFICADA)
-- ============================================

-- Criar tabela de tenants
CREATE TABLE IF NOT EXISTS tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  primary_color text DEFAULT '#FF6B6B',
  secondary_color text DEFAULT '#4ECDC4',
  logo_url text,
  banner_url text,
  is_active boolean DEFAULT true,
  subscription_plan text DEFAULT 'trial',
  subscription_expires_at timestamp,
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  owner_phone text,
  address text,
  city text,
  state text,
  zip_code text,
  opening_time text DEFAULT '11:00',
  closing_time text DEFAULT '23:00',
  delivery_fee decimal(10,2) DEFAULT 0.00,
  minimum_order decimal(10,2) DEFAULT 0.00,
  delivery_radius_km decimal(5,2) DEFAULT 5.00,
  created_at timestamp DEFAULT timezone('utc'::text, now()),
  updated_at timestamp DEFAULT timezone('utc'::text, now())
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

-- Habilitar RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Tenants ativos são públicos" ON tenants;
DROP POLICY IF EXISTS "Donos podem atualizar seus tenants" ON tenants;
DROP POLICY IF EXISTS "Admins podem criar tenants" ON tenants;

-- Criar policies
CREATE POLICY "Tenants ativos são públicos"
  ON tenants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Donos podem atualizar seus tenants"
  ON tenants FOR UPDATE
  USING (owner_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins podem criar tenants"
  ON tenants FOR INSERT
  WITH CHECK (true);

-- Verificar
SELECT 'Tabela tenants criada com sucesso!' as status;
