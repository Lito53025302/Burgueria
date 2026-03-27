# ✅ Instruções Finais - Sistema de Publicação

## 🎯 O Que Foi Feito

1. ✅ Adicionado campo `published` no tipo Tenant
2. ✅ Botão de publicar/despublicar corrigido no Dashboard
3. ✅ Cadastro define `published=false` por padrão
4. ✅ SQL criado para adicionar coluna no banco

## 🚀 Próximos Passos (IMPORTANTE!)

### 1. Executar SQL no Supabase

Você PRECISA executar o SQL para adicionar a coluna `published` no banco:

```sql
-- Copie e cole no Supabase SQL Editor

-- 1. Adicionar coluna
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_tenants_published ON tenants(published);
CREATE INDEX IF NOT EXISTS idx_tenants_active_published ON tenants(is_active, published);

-- 3. Atualizar lojas existentes que já têm produtos
UPDATE tenants 
SET published = true 
WHERE id IN (
    SELECT DISTINCT tenant_id 
    FROM menu_items 
    WHERE available = true
);
```

### 2. Atualizar StoreMarketplace.tsx MANUALMENTE

Abra o arquivo `src/components/StoreMarketplace.tsx` e encontre esta linha (por volta da linha 73):

**ANTES:**
```typescript
const { data: tenantsData, error: tenantsError } = await supabase
    .from('tenants')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
```

**DEPOIS:**
```typescript
const { data: tenantsData, error: tenantsError } = await supabase
    .from('tenants')
    .select('*')
    .eq('is_active', true)
    .eq('published', true) // ← ADICIONE ESTA LINHA
    .order('created_at', { ascending: false });
```

### 3. Reiniciar Servidores

```bash
# Pare todos os servidores (Ctrl+C)

# Reinicie
npm run dev

# Em outro terminal
cd "Painel Burguer"
npm run dev
```

---

## 🧪 Como Testar

### 1. Verificar Loja Atual
1. Acesse o painel admin: `http://localhost:5174`
2. Veja o Dashboard
3. Deve mostrar: "Oculta da vitrine" e botão "Publicar Loja"

### 2. Verificar Vitrine
1. Acesse: `http://localhost:5173`
2. Loja NÃO deve aparecer (está despublicada)

### 3. Publicar Loja
1. No painel admin, clique em "Publicar Loja"
2. Deve mudar para "Publicada na vitrine"
3. Botão muda para "Despublicar Loja"

### 4. Verificar Vitrine Novamente
1. Recarregue `http://localhost:5173`
2. Loja DEVE aparecer agora

---

## 📊 Fluxo Correto

```
Cadastro
  ↓
published = false
  ↓
Loja NÃO aparece na vitrine
  ↓
Admin configura produtos
  ↓
Admin clica "Publicar Loja"
  ↓
published = true
  ↓
Loja APARECE na vitrine
```

---

## 🐛 Se Algo Não Funcionar

### Erro: "column published does not exist"
**Solução:** Execute o SQL no Supabase

### Botão ainda mostra "Despublicar"
**Solução:** 
1. Execute o SQL
2. Reinicie os servidores
3. Limpe o cache do navegador (Ctrl+Shift+R)

### Loja ainda aparece na vitrine
**Solução:**
1. Verifique se adicionou `.eq('published', true)` no StoreMarketplace.tsx
2. Reinicie o servidor
3. Limpe o cache

---

## ✅ Checklist Final

- [ ] SQL executado no Supabase
- [ ] Coluna `published` existe no banco
- [ ] StoreMarketplace.tsx atualizado com `.eq('published', true)`
- [ ] Servidores reiniciados
- [ ] Cache do navegador limpo
- [ ] Testado: loja não aparece quando despublicada
- [ ] Testado: loja aparece quando publicada
- [ ] Botão mostra texto correto

---

## 📝 Arquivos Modificados

1. ✅ `Painel Burguer/src/types/tenant.ts` - Adicionado campo `published`
2. ✅ `Painel Burguer/src/components/Dashboard/Dashboard.tsx` - Botão corrigido
3. ✅ `src/components/StoreSignup.tsx` - Define `published=false`
4. ⏳ `src/components/StoreMarketplace.tsx` - PRECISA ADICIONAR `.eq('published', true)` MANUALMENTE
5. ✅ `add_published_column.sql` - SQL para executar

---

**Status:** 90% completo
**Pendente:** 
1. Executar SQL no Supabase
2. Adicionar `.eq('published', true)` no StoreMarketplace.tsx manualmente

**Depois disso, tudo funcionará perfeitamente!** 🎉
