-- ============================================
-- POLÍTICAS RLS PARA BUCKET tenant-assets
-- Execute APÓS criar o bucket manualmente
-- ============================================

-- 1. Permitir upload de imagens (authenticated users no próprio tenant)
CREATE POLICY tenant_assets_upload ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'tenant-assets' AND
    (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
  );

-- 2. Permitir leitura pública
CREATE POLICY tenant_assets_public_read ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'tenant-assets');

-- 3. Permitir atualização (apenas do próprio tenant)
CREATE POLICY tenant_assets_update ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'tenant-assets' AND
    (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
  );

-- 4. Permitir deleção (apenas do próprio tenant)
CREATE POLICY tenant_assets_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'tenant-assets' AND
    (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
  );

-- Verificar políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'tenant_assets%';
