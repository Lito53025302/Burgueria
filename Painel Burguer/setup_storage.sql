-- ================================
-- SETUP DO STORAGE PARA PRODUTOS
-- ================================
-- Execute este código no SQL Editor do Supabase
-- para configurar automaticamente o bucket de produtos

-- 1. Criar bucket público para produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products', 
  'products', 
  true,
  5242880, -- 5MB limite
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;

-- 3. Política para permitir upload de usuários autenticados
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- 4. Política para permitir leitura pública
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- 5. Política para permitir deletar arquivos (usuários autenticados)
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- 6. Política para permitir atualizar arquivos (usuários autenticados)
CREATE POLICY "Allow authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

-- ================================
-- VERIFICAÇÃO
-- ================================
-- Execute estas queries para verificar se tudo foi criado corretamente

-- Verificar se o bucket foi criado
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'products';

-- Verificar as políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%products%' OR policyname LIKE '%authenticated%' OR policyname LIKE '%public%';

-- ================================
-- SUCESSO!
-- ================================
-- Se você vê o bucket 'products' e as 4 políticas listadas acima,
-- o storage está configurado corretamente!
-- Agora você pode fazer upload de imagens no painel administrativo.
