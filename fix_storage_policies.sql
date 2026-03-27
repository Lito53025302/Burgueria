-- ============================================
-- CORRIGIR POLÍTICAS DE STORAGE
-- Permitir upload de logos e banners
-- ============================================

-- 1. Criar bucket tenant-assets se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Permitir upload de assets do tenant" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de assets" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de assets do tenant" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção de assets do tenant" ON storage.objects;

-- 3. Política: Permitir upload para usuários autenticados
CREATE POLICY "Permitir upload de assets do tenant"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'tenant-assets'
);

-- 4. Política: Permitir leitura pública
CREATE POLICY "Permitir leitura pública de assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tenant-assets');

-- 5. Política: Permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização de assets do tenant"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'tenant-assets')
WITH CHECK (bucket_id = 'tenant-assets');

-- 6. Política: Permitir deleção para usuários autenticados
CREATE POLICY "Permitir deleção de assets do tenant"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tenant-assets');

-- ============================================
-- ALTERNATIVA: Usar bucket 'products' existente
-- Se o bucket tenant-assets não funcionar
-- ============================================

-- Verificar se bucket products existe e é público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'products';

-- Adicionar políticas permissivas ao bucket products (se necessário)
DROP POLICY IF EXISTS "Permitir upload no products" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública no products" ON storage.objects;

CREATE POLICY "Permitir upload no products"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Permitir leitura pública no products"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Listar buckets
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('tenant-assets', 'products');

-- Listar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- INSTRUÇÕES
-- ============================================

/*
COMO EXECUTAR:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole este script completo
4. Clique em "Run"
5. Verifique se não há erros
6. Teste o upload novamente no painel

TROUBLESHOOTING:

Se ainda der erro 400:
1. Verifique se o usuário está autenticado
2. Verifique se o bucket existe
3. Verifique as políticas no Supabase Dashboard → Storage → Policies
4. Tente usar o bucket 'products' como alternativa

NOTA:
O código já tem fallback para tentar 'tenant-assets' primeiro
e depois 'products'. Se ambos falharem, o erro será mostrado.
*/
