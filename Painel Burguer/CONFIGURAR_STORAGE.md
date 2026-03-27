# 🖼️ Configuração do Storage para Upload de Imagens

## Problema Atual
O formulário de adicionar produto está mostrando campo de URL em vez de permitir upload direto de arquivo local.

## ✅ Solução: Configurar o Bucket no Supabase

### Passo 1: Acessar o Painel do Supabase
1. Acesse: https://supabase.com
2. Faça login no seu projeto
3. No menu lateral esquerdo, clique em **Storage**

### Passo 2: Criar o Bucket "products"
1. Clique no botão **"New bucket"** (Novo bucket)
2. Preencha os campos:
   - **Name**: `products` (exatamente esse nome)
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO** (muito importante!)
3. Clique em **"Create bucket"**

### Passo 3: Configurar Políticas de Acesso (RLS)
Após criar o bucket, você precisa configurar as políticas de acesso:

#### 3.1 Política de Upload (INSERT)
1. Dentro do bucket "products", clique na aba **"Policies"**
2. Clique em **"New policy"**
3. Escolha **"Create a new policy from scratch"**
4. Preencha:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: Selecione **INSERT**
   - **Target roles**: `authenticated`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
5. Clique em **"Review"** e depois **"Save policy"**

#### 3.2 Política de Leitura Pública (SELECT)
1. Clique em **"New policy"** novamente
2. Escolha **"Create a new policy from scratch"**
3. Preencha:
   - **Policy name**: `Allow public read access`
   - **Allowed operation**: Selecione **SELECT**
   - **Target roles**: `public` (ou deixe em branco)
   - **USING expression**: `true`
4. Clique em **"Review"** e depois **"Save policy"**

### Passo 4: Testar o Upload
1. Volte ao seu painel administrativo
2. Vá em **"Gerenciar Cardápio"**
3. Clique em **"Adicionar Novo Item"**
4. No campo "Foto do Produto", clique na área de upload
5. Selecione uma imagem do seu computador
6. A imagem deve ser enviada automaticamente para o Supabase Storage!

## 📝 SQL Alternativo (Caso prefira usar SQL)

Se preferir criar as políticas usando SQL, você pode executar este código no **SQL Editor** do Supabase:

```sql
-- Criar bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de usuários autenticados
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');
```

## 🚨 Troubleshooting

### Erro: "new row violates row-level security policy"
- Certifique-se de que as políticas foram criadas corretamente
- Verifique se você está logado como administrador no painel

### Erro: "Invalid bucket"
- O bucket "products" não foi criado ou o nome está diferente
- Verifique se o nome está exatamente como "products" (sem espaços)

### A imagem não aparece após o upload
- Certifique-se de que o bucket está marcado como **Public**
- Verifique as políticas de leitura (SELECT)

## ✨ Funcionamento Esperado

Após a configuração, quando você:
1. Clicar no campo de imagem
2. Selecionar um arquivo
3. A imagem será enviada automaticamente para o Supabase
4. A URL pública será gerada automaticamente
5. A pré-visualização da imagem aparecerá no formulário
