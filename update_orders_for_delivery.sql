-- 1. Adiciona o novo valor 'out_for_delivery' ao tipo ENUM 'order_status'
-- É importante adicionar 'AFTER 'ready'' para manter a ordem lógica do fluxo.
ALTER TYPE public.order_status ADD VALUE 'out_for_delivery' AFTER 'ready';

-- 2. Adiciona a coluna para rastrear a chegada do entregador
-- O valor padrão é 'false'.
ALTER TABLE public.orders
ADD COLUMN motoboy_arrived BOOLEAN DEFAULT FALSE;
