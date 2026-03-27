-- SQL para adicionar a coluna customizations na tabela menu_items
-- Execute este código no Supabase SQL Editor

-- Adicionar coluna customizations (complementos) como JSONB
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS customizations jsonb DEFAULT '[]'::jsonb;

-- Verificar se funcionou
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
AND column_name = 'customizations';
