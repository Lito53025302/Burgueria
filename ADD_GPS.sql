-- Adiciona suporte para rastreamento de motoboy
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS motoboy_arrived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS motoboy_lat FLOAT,
ADD COLUMN IF NOT EXISTS motoboy_lng FLOAT;

-- Habilita update dessas colunas para o role 'service_role' ou authenticated (motoboys)
-- Como RLS já está ativo, precisamos garantir políticas de update
-- (Mas se você já é admin/service_role tá ok)
