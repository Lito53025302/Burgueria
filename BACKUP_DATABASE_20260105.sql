-- ============================================
-- BACKUP DO BANCO DE DADOS SUPABASE
-- Data: 2026-01-05
-- Antes da implementação Multi-Tenant
-- ============================================

-- ATENÇÃO: Execute este SQL no Supabase SQL Editor para fazer backup dos dados

-- ================================================
-- PASSO 1: BACKUP DAS TABELAS ATUAIS
-- ================================================

-- Criar tabelas de backup
CREATE TABLE IF NOT EXISTS backup_menu_items_20260105 AS 
SELECT * FROM menu_items;

CREATE TABLE IF NOT EXISTS backup_orders_20260105 AS 
SELECT * FROM orders;

CREATE TABLE IF NOT EXISTS backup_profiles_20260105 AS 
SELECT * FROM profiles;

CREATE TABLE IF NOT EXISTS backup_available_customizations_20260105 AS 
SELECT * FROM available_customizations;

-- Se houver outras tabelas, adicione aqui
-- CREATE TABLE IF NOT EXISTS backup_clientes_20260105 AS SELECT * FROM clientes;
-- CREATE TABLE IF NOT EXISTS backup_loja_info_20260105 AS SELECT * FROM loja_info;

-- ================================================
-- PASSO 2: VERIFICAR BACKUPS CRIADOS
-- ================================================

SELECT 
    'menu_items' as tabela,
    COUNT(*) as total_registros
FROM backup_menu_items_20260105

UNION ALL

SELECT 
    'orders' as tabela,
    COUNT(*) as total_registros
FROM backup_orders_20260105

UNION ALL

SELECT 
    'profiles' as tabela,
    COUNT(*) as total_registros
FROM backup_profiles_20260105

UNION ALL

SELECT 
    'available_customizations' as tabela,
    COUNT(*) as total_registros
FROM backup_available_customizations_20260105;

-- ================================================
-- PASSO 3: EXPORT MANUAL (RECOMENDADO)
-- ================================================

/*
IMPORTANTE! Faça também um backup manual:

1. Vá no Supabase Dashboard
2. Table Editor > Cada tabela
3. Clique nos 3 pontinhos > Export to CSV
4. Salve os CSVs em uma pasta segura

Tabelas para exportar:
- menu_items
- orders  
- profiles
- available_customizations
- clientes (se existir)
- loja_info (se existir)
*/

-- ================================================
-- COMO RESTAURAR (SE NECESSÁRIO)
-- ================================================

/*
-- Para restaurar dados de uma tabela:

-- 1. Limpar tabela atual
TRUNCATE menu_items CASCADE;

-- 2. Restaurar do backup
INSERT INTO menu_items 
SELECT * FROM backup_menu_items_20260105;

-- 3. Repetir para outras tabelas conforme necessário
*/

-- ================================================
-- INSTRUÇÕES DE SEGURANÇA
-- ================================================

/*
✅ EXECUTADO: Backup das tabelas criado
❌ PENDENTE: Export manual dos CSVs (FAÇA ISSO AGORA!)
❌ PENDENTE: Guardar CSVs em local seguro (Google Drive, Dropbox, etc)

📍 Local recomendado: 
   C:\Users\paulo\Desktop\Burgueria\backups\20260105\
   
📌 Nunca apague as tabelas backup_*_20260105
   Mantenha por pelo menos 30 dias após a migração
*/
