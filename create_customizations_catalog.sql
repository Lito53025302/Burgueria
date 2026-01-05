-- SQL para criar tabela de catálogo de complementos reutilizáveis
-- Execute este código no Supabase SQL Editor

-- Criar tabela de complementos disponíveis (catálogo global)
CREATE TABLE IF NOT EXISTS available_customizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  price numeric(10,2) NOT NULL,
  category text DEFAULT 'Geral',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Desabilitar RLS para permitir leitura pública
ALTER TABLE available_customizations DISABLE ROW LEVEL SECURITY;

-- Inserir complementos padrão (molhos)
INSERT INTO available_customizations (name, price, category) VALUES
  ('Catchup', 0.50, 'Molhos'),
  ('Mostarda', 0.50, 'Molhos'),
  ('Maionese temperada', 3.00, 'Molhos'),
  ('Barbecue', 4.00, 'Molhos'),
  ('MAIONESE DEFUMADA BRANCA', 5.00, 'Molhos'),
  ('MAIONESE DEFUMADA', 5.00, 'Molhos'),
  ('maionese sache', 0.50, 'Molhos'),
  ('BACONESE', 5.00, 'Molhos')
ON CONFLICT (name) DO NOTHING;

-- Inserir complementos de ingredientes extras
INSERT INTO available_customizations (name, price, category) VALUES
  ('Bacon Extra', 5.00, 'Ingredientes'),
  ('Queijo Extra', 4.00, 'Ingredientes'),
  ('Ovo', 2.00, 'Ingredientes'),
  ('Cebola Caramelizada', 3.00, 'Ingredientes')
ON CONFLICT (name) DO NOTHING;

-- Verificar dados inseridos
SELECT * FROM available_customizations ORDER BY category, name;
