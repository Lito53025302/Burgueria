# 🔧 Correção: Erro 400 no Upload de Logo

## 🐛 Problema Identificado

```
POST .../storage/v1/object/tenant-assets/.../logo_xxx.jpg 400 (Bad Request)
```

### Causa
O bucket `tenant-assets` no Supabase Storage não tem as políticas RLS (Row Level Security) configuradas corretamente, impedindo o upload de arquivos.

---

## ✅ Solução

### Opção 1: Executar SQL (Recomendado)

Execute o arquivo `fix_storage_policies.sql` no Supabase Dashboard:

1. Acesse: Supabase Dashboard → SQL Editor
2. Cole o conteúdo do arquivo `fix_storage_policies.sql`
3. Clique em "Run"
4. Verifique se não há erros

### Opção 2: Configurar Manualmente

#### Passo 1: Criar/Verificar Bucket
1. Supabase Dashboard → Storage
2. Verifique se existe bucket `tenant-assets`
3. Se não existir, crie:
   - Nome: `tenant-assets`
   - Público: ✅ Sim

#### Passo 2: Configurar Políticas
1. Clique no bucket `tenant-assets`
2. Vá em "Policies"
3. Adicione estas políticas:

**Política 1: Upload (INSERT)**
```sql
CREATE POLICY "Permitir upload de assets do tenant"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tenant-assets');
```

**Política 2: Leitura Pública (SELECT)**
```sql
CREATE POLICY "Permitir leitura pública de assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tenant-assets');
```

**Política 3: Atualização (UPDATE)**
```sql
CREATE POLICY "Permitir atualização de assets do tenant"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'tenant-assets')
WITH CHECK (bucket_id = 'tenant-assets');
```

**Política 4: Deleção (DELETE)**
```sql
CREATE POLICY "Permitir deleção de assets do tenant"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tenant-assets');
```

---

## 🔄 Fallback Automático

O código já tem um sistema de fallback que tenta dois buckets:

```typescript
const buckets = ['tenant-assets', 'products'] as const;

for (const bucket of buckets) {
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (!uploadError) {
        // Sucesso! Usa este bucket
        publicUrl = data.publicUrl;
        break;
    }
}
```

### Como Funciona
1. Tenta `tenant-assets` primeiro (ideal, isolado por tenant)
2. Se falhar, tenta `products` (compatibilidade)
3. Se ambos falharem, mostra erro

---

## 🧪 Como Testar

### Teste 1: Após Executar SQL
1. Recarregue o painel: `http://localhost:5174`
2. Vá em Configurações → Personalização
3. Clique em "Escolher Arquivo" (Logo)
4. Selecione uma imagem (máx 2MB)
5. ✅ Upload deve funcionar
6. ✅ Mensagem: "Logo enviado! Clique em Salvar"
7. Clique em "Salvar Alterações"
8. ✅ Logo deve aparecer

### Teste 2: Verificar Bucket
1. Supabase Dashboard → Storage
2. Abra bucket `tenant-assets` ou `products`
3. ✅ Deve ver a pasta com ID do tenant
4. ✅ Deve ver o arquivo do logo

### Teste 3: Verificar URL Pública
1. Copie a URL do logo
2. Cole em nova aba do navegador
3. ✅ Imagem deve carregar

---

## 📊 Estrutura do Storage

### Organização de Arquivos
```
tenant-assets/
├── 036441e6-306f-480a-8337-56d757b5f823/
│   ├── logo_1772677088741.jpg
│   ├── banner_1772677123456.jpg
│   └── ...
├── outro-tenant-id/
│   ├── logo_xxx.jpg
│   └── ...
```

### Nomenclatura
- Formato: `{tenant_id}/{type}_{timestamp}.{ext}`
- Exemplo: `036441e6.../logo_1772677088741.jpg`
- Benefícios:
  - Organizado por tenant
  - Nomes únicos (timestamp)
  - Fácil identificação

---

## 🔒 Políticas de Segurança

### Permissões Configuradas

| Operação | Quem Pode | Condição |
|----------|-----------|----------|
| INSERT (Upload) | Autenticados | Bucket correto |
| SELECT (Leitura) | Todos (público) | Bucket correto |
| UPDATE (Atualizar) | Autenticados | Bucket correto |
| DELETE (Deletar) | Autenticados | Bucket correto |

### Por Que Público?
- Logos e banners precisam ser visíveis para clientes
- Não contêm informações sensíveis
- Apenas leitura é pública (upload requer autenticação)

---

## 🐛 Troubleshooting

### Erro: "Erro ao fazer upload da imagem"
**Causa**: Políticas RLS não configuradas
**Solução**: Execute o SQL `fix_storage_policies.sql`

### Erro: "Imagem muito grande"
**Causa**: Arquivo maior que 2MB
**Solução**: Reduza o tamanho da imagem antes de fazer upload

### Erro: "Por favor, selecione uma imagem válida"
**Causa**: Arquivo não é uma imagem
**Solução**: Use apenas JPG, PNG, GIF, WebP

### Bucket não existe
**Causa**: Bucket `tenant-assets` não foi criado
**Solução**: 
1. Execute o SQL para criar
2. Ou use bucket `products` (fallback automático)

### Upload funciona mas imagem não aparece
**Causa**: URL não foi salva no banco
**Solução**: Clique em "Salvar Alterações" após upload

---

## 📝 Validações Implementadas

### Tipo de Arquivo
```typescript
if (!file.type.startsWith('image/')) {
    alert('Por favor, selecione uma imagem válida');
    return;
}
```

### Tamanho Máximo
```typescript
if (file.size > 2 * 1024 * 1024) {
    alert('Imagem muito grande. Máximo 2MB');
    return;
}
```

### Formatos Aceitos
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ✅ SVG

---

## 🎯 Fluxo Completo

```
1. Usuário seleciona imagem
   ↓
2. Validação de tipo e tamanho
   ↓
3. Tentativa de upload:
   a) Tenta bucket 'tenant-assets'
   b) Se falhar, tenta 'products'
   ↓
4. Upload bem-sucedido
   ↓
5. Gera URL pública
   ↓
6. Atualiza preview local
   ↓
7. Usuário clica "Salvar"
   ↓
8. Atualiza banco de dados
   ↓
9. Logo aparece em todo o sistema
```

---

## ✅ Checklist de Verificação

### Antes de Testar
- [ ] SQL executado no Supabase
- [ ] Bucket `tenant-assets` existe
- [ ] Bucket é público
- [ ] Políticas RLS configuradas
- [ ] Usuário está autenticado

### Durante o Teste
- [ ] Selecionou imagem válida (<2MB)
- [ ] Upload não deu erro 400
- [ ] Mensagem de sucesso apareceu
- [ ] Preview da imagem apareceu
- [ ] Clicou em "Salvar Alterações"

### Após o Teste
- [ ] Logo aparece em Configurações → Perfil
- [ ] Logo aparece no header do painel
- [ ] Logo aparece na vitrine (app cliente)
- [ ] URL pública funciona

---

## 📚 Arquivos Relacionados

1. **`fix_storage_policies.sql`** - SQL para corrigir políticas
2. **`Painel Burguer/src/components/Settings/StoreCustomization.tsx`** - Componente de upload
3. **`Painel Burguer/src/components/Settings/Settings.tsx`** - Exibe logo no perfil

---

## 💡 Melhorias Futuras (Opcional)

### 1. Compressão Automática
- Reduzir tamanho antes de upload
- Otimizar para web

### 2. Crop de Imagem
- Permitir recortar logo
- Ajustar proporção

### 3. Múltiplos Tamanhos
- Gerar thumbnails
- Versões otimizadas

### 4. Validação de Dimensões
- Mínimo: 200x200px
- Máximo: 2000x2000px
- Proporção recomendada: 1:1

---

**Status**: ⏳ Aguardando execução do SQL
**Próximo Passo**: Execute `fix_storage_policies.sql` no Supabase
**Depois**: Teste o upload novamente

🔧 Após executar o SQL, o upload deve funcionar perfeitamente!
