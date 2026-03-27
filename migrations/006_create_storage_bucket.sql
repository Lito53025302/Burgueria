-- ============================================
-- CRIAR BUCKET PARA ASSETS DOS TENANTS
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Criar bucket público para logos e banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-assets',
  'tenant-assets',
  true, -- Público para acesso direto
  2097152, -- 2MB máximo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir upload de imagens (authenticated users)
CREATE POLICY tenant_assets_upload ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'tenant-assets' AND
    (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
  );

-- 3. Permitir leitura pública
CREATE POLICY tenant_assets_public_read ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'tenant-assets');

-- 4. Permitir atualização (apenas do próprio tenant)
CREATE POLICY tenant_assets_update ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'tenant-assets' AND
    (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
  );

-- 5. Permitir deleção (apenas do próprio tenant)
CREATE POLICY tenant_assets_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'tenant-assets' AND
    (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
  );

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE name = 'tenant-assets';

-- Comentário
COMMENT ON TABLE storage.buckets IS 'Bucket público para armazenar logos e banners dos tenants';
