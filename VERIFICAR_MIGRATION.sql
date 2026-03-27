-- ========================================
-- VERIFICAR SE A MIGRATION FOI EXECUTADA
-- ========================================
-- Execute este SQL para verificar se tudo está OK
-- ========================================

-- 1. Verificar planos criados
SELECT 
    name,
    display_name,
    monthly_fee,
    commission_rate * 100 as commission_percentage,
    max_orders_per_month,
    is_highlighted
FROM subscription_plans
ORDER BY monthly_fee;

-- 2. Verificar se as lojas têm planos atribuídos
SELECT 
    t.name as loja,
    t.subdomain,
    sp.display_name as plano,
    sp.monthly_fee,
    t.orders_this_month,
    sp.max_orders_per_month
FROM tenants t
LEFT JOIN subscription_plans sp ON t.subscription_plan_id = sp.id
ORDER BY t.created_at DESC;

-- 3. Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'commission_transactions', 'monthly_invoices')
ORDER BY table_name;
