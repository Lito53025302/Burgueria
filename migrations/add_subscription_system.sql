-- Criar tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    monthly_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5, 4) NOT NULL, -- 0.05 = 5%
    max_orders_per_month INTEGER, -- NULL = ilimitado
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

-- Adicionar coluna de plano na tabela tenants (se não existir)
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
    order_id UUID, -- Referência ao pedido (se houver tabela de pedidos)
    order_amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 4) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
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
    total_amount DECIMAL(10, 2) NOT NULL, -- plan_fee + total_commission
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, cancelled
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, month, year)
);

-- Criar índice para faturas
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

-- Comentários para documentação
COMMENT ON TABLE subscription_plans IS 'Planos de assinatura disponíveis para as lojas';
COMMENT ON TABLE commission_transactions IS 'Histórico de comissões cobradas por pedido';
COMMENT ON TABLE monthly_invoices IS 'Faturas mensais consolidadas por loja';
COMMENT ON COLUMN subscription_plans.commission_rate IS 'Taxa de comissão (0.05 = 5%)';
COMMENT ON COLUMN tenants.orders_this_month IS 'Contador de pedidos no mês atual';
