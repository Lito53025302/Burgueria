-- SQL para configurar as políticas RLS (Row Level Security) na tabela menu_items
-- Execute este código no Supabase SQL Editor

-- 1. Habilitar RLS na tabela menu_items (se ainda não estiver)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Permitir leitura pública de menu_items" ON menu_items;
DROP POLICY IF EXISTS "Permitir inserção autenticada de menu_items" ON menu_items;
DROP POLICY IF EXISTS "Permitir atualização autenticada de menu_items" ON menu_items;
DROP POLICY IF EXISTS "Permitir exclusão autenticada de menu_items" ON menu_items;

-- 3. Criar novas políticas
-- Permitir leitura pública (SELECT)
CREATE POLICY "Permitir leitura pública de menu_items"
ON menu_items FOR SELECT
TO public
USING (true);

-- Permitir inserção para usuários autenticados (INSERT)
CREATE POLICY "Permitir inserção autenticada de menu_items"
ON menu_items FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir atualização para usuários autenticados (UPDATE)
CREATE POLICY "Permitir atualização autenticada de menu_items"
ON menu_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir exclusão para usuários autenticados (DELETE)
CREATE POLICY "Permitir exclusão autenticada de menu_items"
ON menu_items FOR DELETE
TO authenticated
USING (true);

-- 4. Verificar se a coluna customizations existe
-- Se não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'customizations'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN customizations jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;
