-- Adicionar colunas de geolocalização na tabela tenants
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Adicionar comentários para documentação
COMMENT ON COLUMN tenants.latitude IS 'Latitude da localização da loja (WGS84)';
COMMENT ON COLUMN tenants.longitude IS 'Longitude da localização da loja (WGS84)';

-- Criar índice para melhorar performance de buscas por localização
CREATE INDEX IF NOT EXISTS idx_tenants_location ON tenants(latitude, longitude);
