-- Adiciona colunas compatíveis com o app do motoboy na tabela orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS items_count INTEGER,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC;

-- Preenche delivery_address com o valor de address, se existir
UPDATE orders SET delivery_address = address WHERE delivery_address IS NULL AND address IS NOT NULL;

-- Preenche total_amount com o valor de total, se existir
UPDATE orders SET total_amount = total WHERE total_amount IS NULL AND total IS NOT NULL;

-- Limpa automaticamente o campo items dos registros com JSON inválido
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, items FROM orders WHERE items IS NOT NULL AND items <> '' LOOP
    BEGIN
      PERFORM r.items::json;
    EXCEPTION WHEN others THEN
      UPDATE orders SET items = NULL WHERE id = r.id;
    END;
  END LOOP;
END $$;

-- Agora preenche items_count apenas para registros com JSON válido
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, items FROM orders
    WHERE items IS NOT NULL
      AND items <> ''
      AND left(trim(items), 1) = '['
      AND right(trim(items), 1) = ']'
  LOOP
    BEGIN
      UPDATE orders
      SET items_count = json_array_length(r.items::json)
      WHERE id = r.id;
    EXCEPTION WHEN others THEN
      CONTINUE;
    END;
  END LOOP;
END $$;
