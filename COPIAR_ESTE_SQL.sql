-- ========================================
-- MIGRATION: Sistema de Assinaturas
-- ========================================
-- Copie TODO este conteúdo e cole no SQL Editor do Supabase
-- ========================================

-- Criar tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    monthly_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5, 4) NOT NULL,
    max_orders_per_month INTEGER,
    features JSONB DEFAULT '[]',
    is_highlighted BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir planos padrão
INSERT INTO subscription_plans (name, display_name, monthly_fee, commission_rate, max_orders_per_month, features, is_highlighted) VALUES
('free', 'Plano FREE', 0.00, 0.05, 100, 
    '["Até 100 pedidos/mês", "5% de comissão por venda", "Suporte básico", "Painel de controle"]', 
    false),
('basic', 'Plano BÁSICO', 49.90, 0.03, NULL, 
    '["Pedidos ilimitados", "3% de comissão por venda", "Relatórios básicos", "Suporte prioritário", "Sem taxa de setup"]', 
    false),
('pro', 'Plano PRO', 99.90, 0.02, NULL, 
    '["Pedidos ilimitados", "2% de comissão por venda", "Destaque no marketplace", "Relatórios avançados", "Suporte 24/7", "Marketing incluído"]', 
    true);

-- Adicionar colunas na tabela tenants
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS orders_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_order_reset_date DATE DEFAULT CURRENT_DATE;

-- Definir plano FREE como padrão para lojas existentes
UPDATE tenants 
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'free')
WHERE subscription_plan_id IS NULL;

-- Criar tabela de histórico de comissões
CREATE TABLE IF NOT EXISTS commission_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID,
    order_amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 4) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_commission_tenant ON commission_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_commission_date ON commission_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_commission_status ON commission_transactions(status);

-- Criar tabela de faturas mensais
CREATE TABLE IF NOT EXISTS monthly_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    plan_fee DECIMAL(10, 2) NOT NULL,
    total_orders INTEGER NOT NULL,
    total_order_amount DECIMAL(10, 2) NOT NULL,
    total_commission DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, month, year)
);

-- Criar índices para faturas
CREATE INDEX IF NOT EXISTS idx_invoice_tenant ON monthly_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON monthly_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_date ON monthly_invoices(year, month);

-- Função para resetar contador de pedidos mensalmente
CREATE OR REPLACE FUNCTION reset_monthly_order_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_order_reset_date < CURRENT_DATE AND 
       EXTRACT(MONTH FROM NEW.last_order_reset_date) != EXTRACT(MONTH FROM CURRENT_DATE) THEN
        NEW.orders_this_month = 0;
        NEW.last_order_reset_date = CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para reset automático
DROP TRIGGER IF EXISTS trigger_reset_order_count ON tenants;
CREATE TRIGGER trigger_reset_order_count
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION reset_monthly_order_count();

-- ========================================
-- FIM DA MIGRATION
-- ========================================
-- Se tudo correu bem, você verá "Success" no Supabase!
