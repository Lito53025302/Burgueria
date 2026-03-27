# 🧪 Teste Rápido - Upload de Imagens

## Como Testar

### 1. Abra o Console do Navegador
- Pressione `F12` ou clique com botão direito → "Inspecionar"
- Vá na aba **Console**

### 2. Tente Fazer Upload
1. No painel, vá em **"Gerenciar Cardápio"**
2. Clique em **"Adicionar Novo Item"**
3. Clique no campo de upload de imagem
4. Selecione uma imagem do seu computador

### 3. Verifique os Logs no Console

#### ✅ Se Funcionar Corretamente, Você Verá:
```
📤 Iniciando upload...
📂 Enviando para bucket "products": 1234567890-abc123.jpg
✅ Upload concluído: { path: "1234567890-abc123.jpg" }
🔗 URL pública gerada: https://[...].supabase.co/storage/v1/object/public/products/1234567890-abc123.jpg
```

E um alerta: **"✅ Imagem enviada com sucesso!"**

---

#### ❌ Se Der Erro de Bucket Não Encontrado:
```
❌ Erro no upload: { message: "Bucket not found" }
```

**Solução**: O bucket "products" não foi criado no Supabase.
→ Execute o arquivo `setup_storage.sql` no SQL Editor do Supabase
→ Ou siga as instruções em `CONFIGURAR_STORAGE.md`

---

#### ❌ Se Der Erro de Permissão:
```
❌ Erro no upload: { message: "new row violates row-level security policy" }
```

**Solução**: O bucket existe, mas as políticas de acesso não estão configuradas.
→ Execute o arquivo `setup_storage.sql` no SQL Editor do Supabase
→ Ou siga as instruções em `CONFIGURAR_STORAGE.md` na seção "Passo 3"

---

#### ❌ Se Der Erro de Tipo/Tamanho:
```
❌ Tipo de arquivo inválido! Use apenas: JPEG, PNG, GIF ou WebP
```
ou
```
❌ Arquivo muito grande! Tamanho máximo: 5MB
```

**Solução**: Escolha uma imagem válida (JPG, PNG, GIF ou WebP) com menos de 5MB

---

## 🔍 Verificar no Supabase

Após um upload bem-sucedido:

1. Acesse o painel do Supabase
2. Vá em **Storage** → **products**
3. Você deve ver o arquivo que acabou de fazer upload
4. Clique no arquivo para ver a URL pública

---

## 📋 Checklist de Configuração

- [ ] Bucket "products" criado no Supabase Storage
- [ ] Bucket marcado como **público**
- [ ] Política de INSERT criada (para upload)
- [ ] Política de SELECT criada (para leitura pública)
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Aplicação rodando sem erros

---

## 🆘 Ainda com Problemas?

Se após seguir todos os passos ainda não funcionar:

1. **Verifique o console do navegador** para ver o erro exato
2. **Copie a mensagem de erro completa**
3. **Verifique se você está logado** como administrador no painel
4. **Tente fazer logout e login novamente**
5. **Limpe o cache do navegador** (Ctrl + Shift + Del)

## 📸 Como Deve Ficar

Quando tudo estiver funcionando:

1. Você clica no campo de upload
2. Seleciona uma imagem
3. Vê o loading com "Enviando para o servidor..."
4. A imagem aparece na pré-visualização
5. Pode remover a imagem clicando no X (aparece ao passar o mouse)
6. Ao salvar o produto, a URL da imagem é salva no banco de dados
