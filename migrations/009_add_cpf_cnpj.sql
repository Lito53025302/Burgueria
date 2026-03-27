-- ============================================
-- ADICIONAR CAMPOS DE CPF/CNPJ
-- ============================================

-- Adicionar campos na tabela tenants
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS document_type text CHECK (document_type IN ('cpf', 'cnpj')),
ADD COLUMN IF NOT EXISTS document_number text;

-- Criar índice para busca rápida por documento
CREATE INDEX IF NOT EXISTS idx_tenants_document ON tenants(document_number);

-- Comentários
COMMENT ON COLUMN tenants.document_type IS 'Tipo de documento: cpf ou cnpj';
COMMENT ON COLUMN tenants.document_number IS 'Número do CPF ou CNPJ (apenas números)';

-- Verificar
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tenants' 
  AND column_name IN ('document_type', 'document_number')
ORDER BY ordinal_position;
