-- ================================================
-- PAGAMENTOS E EMISSÃO DE NOTA FISCAL (PREPARAÇÃO)
-- ================================================

-- 1. Campos de Pagamento em Orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending', -- approved, rejected, pending, cancelled, in_process, refunded
ADD COLUMN IF NOT EXISTS payment_details jsonb;

-- 2. CPF do Cliente em Profiles (Fundamental para NF-e/NFC-e)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cpf text;

-- 3. Campos de Emissão de Nota Fiscal em Orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS invoice_id text,
ADD COLUMN IF NOT EXISTS invoice_status text DEFAULT 'pending', -- pending, issued, failed, cancelled
ADD COLUMN IF NOT EXISTS invoice_url text,
ADD COLUMN IF NOT EXISTS nfe_access_key text;

-- 4. Tabela de Configuração de Emissão de Nota Fiscal por Tenant
CREATE TABLE IF NOT EXISTS tenant_invoice_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Credenciais do Emissor (Ex: Focus NFe, PlugNotas, etc.)
  api_token text,
  environment text DEFAULT 'sandbox', -- sandbox, production
  
  -- Configurações Fiscais
  company_name text,
  cnpj text,
  state_registration text, -- Inscrição Estadual
  city_registration text, -- Inscrição Municipal
  
  -- Regime Tributário
  tax_regime text, -- 1: Simples Nacional, 3: Regime Normal, etc.
  
  -- Série e Próximo Número
  nfe_series integer DEFAULT 1,
  nfe_last_number integer DEFAULT 0,
  nfce_series integer DEFAULT 1,
  nfce_last_number integer DEFAULT 0,
  
  created_at timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(tenant_id)
);

-- RLS para tenant_invoice_settings
ALTER TABLE tenant_invoice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar configurações de nota fiscal de sua loja"
  ON tenant_invoice_settings FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_invoice_status ON orders(invoice_status);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON profiles(cpf);
