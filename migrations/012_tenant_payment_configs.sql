-- ================================================
-- CONFIGURAÇÃO DE MÉTODOS DE PAGAMENTO POR LOJA
-- ================================================

-- 1. Adicionar colunas na tabela tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS accepted_payment_methods jsonb DEFAULT '["money", "card_delivery", "pix_delivery"]',
ADD COLUMN IF NOT EXISTS pix_key text,
ADD COLUMN IF NOT EXISTS pix_key_type text CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random'));

-- Comentários
COMMENT ON COLUMN tenants.accepted_payment_methods IS 'Lista de métodos aceitos: money, card_delivery, pix_delivery, pix_online, card_online';
COMMENT ON COLUMN tenants.pix_key IS 'Chave PIX da loja para recebimento direto';

-- 2. Atualizar lojas existentes com métodos padrão (Offline)
UPDATE tenants 
SET accepted_payment_methods = '["money", "card_delivery", "pix_delivery"]'
WHERE accepted_payment_methods IS NULL;
