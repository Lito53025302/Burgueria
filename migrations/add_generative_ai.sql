-- ========================================
-- MIGRATION: IA Generativa para Fotos de Produtos
-- ========================================

-- 1. Adicionar limites de IA Generativa aos planos
UPDATE subscription_plans SET 
    ai_generative_images = 0
WHERE name = 'free';

UPDATE subscription_plans SET 
    ai_generative_images = 10
WHERE name = 'basic';

UPDATE subscription_plans SET 
    ai_generative_images = 50
WHERE name = 'pro';

-- 2. Adicionar contador de uso de IA Generativa aos tenants
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS ai_generative_used_this_month INTEGER DEFAULT 0;

-- 3. Atualizar tabela de histórico para incluir IA generativa
ALTER TABLE ai_image_enhancements
ADD COLUMN IF NOT EXISTS background_style VARCHAR(50), -- 'wooden_board', 'marble', 'slate', 'rustic', etc.
ADD COLUMN IF NOT EXISTS prompt_used TEXT,
ADD COLUMN IF NOT EXISTS model_used VARCHAR(50); -- 'stable-diffusion', 'dall-e-3', etc.

-- 4. Criar tabela de estilos de fundo disponíveis
CREATE TABLE IF NOT EXISTS background_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    prompt_template TEXT NOT NULL,
    preview_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir estilos de fundo padrão
INSERT INTO background_styles (name, display_name, description, prompt_template, is_premium, sort_order) VALUES
('wooden_board', 'Tábua de Madeira', 'Fundo rústico com tábua de madeira', 
    'Professional food photography of {product} on rustic wooden board, dark background, studio lighting, appetizing, 4K, high quality', 
    false, 1),
    
('marble_surface', 'Mármore Branco', 'Superfície de mármore elegante', 
    'Professional food photography of {product} on white marble surface, minimalist, clean background, natural lighting, elegant, 4K', 
    false, 2),
    
('slate_plate', 'Ardósia Preta', 'Prato de ardósia moderna', 
    'Professional food photography of {product} on black slate plate, dark moody background, dramatic lighting, gourmet, 4K', 
    false, 3),
    
('restaurant_table', 'Mesa de Restaurante', 'Ambiente de restaurante completo', 
    'Professional food photography of {product} on restaurant table, beer glass in background, warm ambient lighting, cozy atmosphere, 4K', 
    true, 4),
    
('outdoor_picnic', 'Piquenique ao Ar Livre', 'Cenário ao ar livre natural', 
    'Professional food photography of {product} on outdoor picnic table, natural daylight, fresh atmosphere, casual dining, 4K', 
    true, 5),
    
('modern_kitchen', 'Cozinha Moderna', 'Bancada de cozinha contemporânea', 
    'Professional food photography of {product} on modern kitchen counter, bright clean background, contemporary style, 4K', 
    true, 6);

-- 5. Função para verificar créditos de IA Generativa
CREATE OR REPLACE FUNCTION check_generative_ai_credits(p_tenant_id UUID)
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
    SELECT 
        t.ai_generative_used_this_month,
        sp.ai_generative_images
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

-- 6. Função para incrementar uso de IA Generativa
CREATE OR REPLACE FUNCTION increment_generative_ai_usage(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tenants 
    SET ai_generative_used_this_month = ai_generative_used_this_month + 1
    WHERE id = p_tenant_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 7. Atualizar função de reset mensal para incluir IA generativa
CREATE OR REPLACE FUNCTION reset_monthly_ai_credits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ai_last_reset_date < CURRENT_DATE AND 
       EXTRACT(MONTH FROM NEW.ai_last_reset_date) != EXTRACT(MONTH FROM CURRENT_DATE) THEN
        NEW.ai_images_used_this_month = 0;
        NEW.ai_generative_used_this_month = 0;
        NEW.ai_last_reset_date = CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE background_styles IS 'Estilos de fundo disponíveis para IA generativa';
COMMENT ON COLUMN subscription_plans.ai_generative_images IS 'Número de fotos generativas por mês';
COMMENT ON COLUMN tenants.ai_generative_used_this_month IS 'Contador de fotos generativas no mês';

-- ========================================
-- FIM DA MIGRATION
-- ========================================
