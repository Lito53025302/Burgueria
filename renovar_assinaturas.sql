-- ============================================
-- RENOVAR ASSINATURA DE LOJAS
-- Execute este SQL para renovar a assinatura de uma loja
-- ============================================

-- 1. VER TODAS AS LOJAS E SUAS ASSINATURAS
SELECT 
  id,
  name,
  subdomain,
  subscription_plan,
  subscription_expires_at,
  CASE 
    WHEN subscription_expires_at IS NULL THEN 'SEM EXPIRAÇÃO'
    WHEN subscription_expires_at < NOW() THEN '❌ EXPIRADA'
    ELSE '✅ ATIVA'
  END as status
FROM tenants
ORDER BY created_at;

-- ============================================
-- 2. RENOVAR ASSINATURA (escolha UMA opção abaixo)
-- ============================================

-- OPÇÃO A: Renovar TODAS as lojas por 1 ano
UPDATE tenants
SET 
  subscription_expires_at = NOW() + INTERVAL '1 year',
  subscription_plan = 'pro'
WHERE is_active = true;

-- OPÇÃO B: Renovar apenas a loja "principal" por 1 ano
UPDATE tenants
SET 
  subscription_expires_at = NOW() + INTERVAL '1 year',
  subscription_plan = 'enterprise'
WHERE subdomain = 'principal';

-- OPÇÃO C: Renovar loja específica por subdomain
UPDATE tenants
SET 
  subscription_expires_at = NOW() + INTERVAL '1 year',
  subscription_plan = 'pro'
WHERE subdomain = 'SEU_SUBDOMAIN_AQUI';

-- OPÇÃO D: Remover expiração (sem limite de tempo)
UPDATE tenants
SET 
  subscription_expires_at = NULL,
  subscription_plan = 'lifetime'
WHERE subdomain = 'principal';

-- ============================================
-- 3. VERIFICAR NOVAMENTE
-- ============================================
SELECT 
  name,
  subdomain,
  subscription_plan,
  subscription_expires_at,
  CASE 
    WHEN subscription_expires_at IS NULL THEN '♾️ SEM EXPIRAÇÃO'
    WHEN subscription_expires_at < NOW() THEN '❌ EXPIRADA'
    ELSE '✅ ATIVA até ' || TO_CHAR(subscription_expires_at, 'DD/MM/YYYY')
  END as status
FROM tenants
ORDER BY name;
