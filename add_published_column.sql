-- Adicionar coluna 'published' para controlar visibilidade na vitrine
-- Lojas recém-criadas ficam como 'false' até o admin publicar

-- 1. Adicionar coluna
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- 2. Adicionar comentário
COMMENT ON COLUMN tenants.published IS 'Indica se a loja está publicada na vitrine. False = rascunho, True = visível para clientes';

-- 3. Atualizar lojas existentes que já têm produtos para publicadas
UPDATE tenants 
SET published = true 
WHERE id IN (
    SELECT DISTINCT tenant_id 
    FROM menu_items 
    WHERE available = true
);

-- 4. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_tenants_published ON tenants(published);

-- 5. Criar índice composto para queries da vitrine
CREATE INDEX IF NOT EXISTS idx_tenants_active_published ON tenants(is_active, published) WHERE is_active = true AND published = true;

-- Verificar resultado
SELECT 
    id,
    name,
    subdomain,
    is_active,
    published,
    created_at
FROM tenants
ORDER BY created_at DESC;
