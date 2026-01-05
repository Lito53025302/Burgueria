-- SQL para adicionar coluna de nível de picância na tabela menu_items
-- Execute este código no Supabase SQL Editor

-- Adicionar coluna spice_level (nível de picância)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS spice_level text DEFAULT 'none';

-- Adicionar coluna prep_time (tempo de preparo em minutos)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS prep_time_min integer;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
AND column_name IN ('spice_level', 'prep_time_min');

-- Valores válidos para spice_level:
-- 'none' = Sem pimenta
-- 'suave' = Suave
-- 'medio' = Médio  
-- 'forte' = Forte
-- 'extra_forte' = Extra Forte
