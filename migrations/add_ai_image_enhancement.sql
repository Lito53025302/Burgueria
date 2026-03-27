-- ========================================
-- MIGRATION: Sistema de Melhoria de Imagens com IA
-- ========================================

-- 1. Adicionar limites de IA aos planos de assinatura
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS ai_image_credits_per_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_background_removal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_generative_images INTEGER DEFAULT 0;

-- Atualizar planos com limites de IA
UPDATE subscription_plans SET 
    ai_image_credits_per_month = 0,
    ai_background_removal = false,
    ai_generative_images = 0
WHERE name = 'free';

UPDATE subscription_plans SET 
    ai_image_credits_per_month = 50,
    ai_background_removal = true,
    ai_generative_images = 0
WHERE name = 'basic';

UPDATE subscription_plans SET 
    ai_image_credits_per_month = -1, -- -1 = ilimitado
    ai_background_removal = true,
    ai_generative_images = 20
WHERE name = 'pro';

-- 2. Adicionar contador de uso de IA aos tenants
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS ai_images_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_last_reset_date DATE DEFAULT CURRENT_DATE;

-- 3. Criar tabela de histórico de processamento de imagens
CREATE TABLE IF NOT EXISTS ai_image_enhancements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID, -- Referência ao produto (se aplicável)
    original_url TEXT NOT NULL,
    enhanced_url TEXT,
    enhancement_type VARCHAR(50) NOT NULL, -- 'upscale', 'background_removal', 'generative'
    status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    error_message TEXT,
    processing_time_ms INTEGER,
    credits_used INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_ai_enhancements_tenant ON ai_image_enhancements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_enhancements_status ON ai_image_enhancements(status);
CREATE INDEX IF NOT EXISTS idx_ai_enhancements_created ON ai_image_enhancements(created_at);

-- 4. Função para resetar contador de IA mensalmente
CREATE OR REPLACE FUNCTION reset_monthly_ai_credits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ai_last_reset_date < CURRENT_DATE AND 
       EXTRACT(MONTH FROM NEW.ai_last_reset_date) != EXTRACT(MONTH FROM CURRENT_DATE) THEN
        NEW.ai_images_used_this_month = 0;
        NEW.ai_last_reset_date = CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para reset automático
DROP TRIGGER IF EXISTS trigger_reset_ai_credits ON tenants;
CREATE TRIGGER trigger_reset_ai_credits
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION reset_monthly_ai_credits();

-- 5. Função para verificar se tenant tem créditos disponíveis
CREATE OR REPLACE FUNCTION check_ai_credits(p_tenant_id UUID)
RETURNS TABLE(
    has_credits BOOLEAN,
    credits_used INTEGER,
    credits_limit INTEGER,
    is_unlimited BOOLEAN
) AS $$
DECLARE
    v_tenant_credits INTEGER;
    v_plan_limit INTEGER;
BEGIN
    -- Buscar uso atual e limite do plano
    SELECT 
        t.ai_images_used_this_month,
        sp.ai_image_credits_per_month
    INTO 
        v_tenant_credits,
        v_plan_limit
    FROM tenants t
    JOIN subscription_plans sp ON t.subscription_plan_id = sp.id
    WHERE t.id = p_tenant_id;

    -- -1 significa ilimitado
    IF v_plan_limit = -1 THEN
        RETURN QUERY SELECT true, v_tenant_credits, v_plan_limit, true;
    ELSIF v_tenant_credits < v_plan_limit THEN
        RETURN QUERY SELECT true, v_tenant_credits, v_plan_limit, false;
    ELSE
        RETURN QUERY SELECT false, v_tenant_credits, v_plan_limit, false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Função para incrementar uso de créditos
CREATE OR REPLACE FUNCTION increment_ai_usage(p_tenant_id UUID, p_credits INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tenants 
    SET ai_images_used_this_month = ai_images_used_this_month + p_credits
    WHERE id = p_tenant_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE ai_image_enhancements IS 'Histórico de processamento de imagens com IA';
COMMENT ON COLUMN subscription_plans.ai_image_credits_per_month IS 'Número de melhorias de imagem por mês (-1 = ilimitado)';
COMMENT ON COLUMN tenants.ai_images_used_this_month IS 'Contador de imagens processadas no mês atual';

-- ========================================
-- FIM DA MIGRATION
-- ========================================
