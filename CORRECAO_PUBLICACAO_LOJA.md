# 🔧 Correção: Sistema de Publicação de Loja

## ❌ Problema Identificado

Quando você clicava em "Publicar Loja" no painel, o sistema mostrava no log:
```
Status de publicação alterado {published: true}
```

Mas a loja não era publicada de fato. Isso acontecia porque:

1. ✅ O botão estava funcionando corretamente
2. ✅ O update no banco estava sendo executado
3. ❌ O hook `useTenant.ts` NÃO estava mapeando o campo `published` do banco
4. ❌ Resultado: o campo `published` ficava sempre `undefined` no frontend

## ✅ Correção Aplicada

### 1. Adicionado mapeamento do campo `published` no hook

**Arquivo**: `Painel Burguer/src/hooks/useTenant.ts` (linha ~160)

```typescript
const mappedTenant: Tenant = {
    id: data.id,
    name: data.name,
    subdomain: data.subdomain,
    slug: data.slug,
    primaryColor: data.primary_color,
    secondaryColor: data.secondary_color,
    logoUrl: data.logo_url,
    bannerUrl: data.banner_url,
    isActive: data.is_active,
    published: data.published ?? false, // ✅ ADICIONADO
    subscriptionPlan: data.subscription_plan,
    // ... resto dos campos
};
```

## 📋 Próximos Passos (VOCÊ PRECISA FAZER)

### Passo 1: Executar SQL no Supabase

1. Abra o Supabase: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `add_published_column.sql`
4. Clique em **Run** para executar

Isso vai:
- Adicionar a coluna `published` na tabela `tenants`
- Definir `false` como padrão para novas lojas
- Publicar automaticamente lojas que já têm produtos
- Criar índices para performance

### Passo 2: Testar o Sistema

1. **Recarregue o painel da loja** (F5)
2. Vá no **Dashboard**
3. Clique em **"Publicar Loja"**
4. Verifique se o botão muda para **"Despublicar Loja"**
5. Abra a **vitrine** (http://localhost:5173)
6. Verifique se sua loja aparece na lista

### Passo 3: Testar Despublicar

1. No painel, clique em **"Despublicar Loja"**
2. Recarregue a **vitrine**
3. Sua loja deve **desaparecer** da lista

## 🎯 Como Funciona Agora

### Fluxo Completo

1. **Cadastro de Loja**
   - Loja é criada com `published = false`
   - Não aparece na vitrine
   - Painel está acessível para configuração

2. **Configuração**
   - Admin configura produtos, horários, etc.
   - Loja continua oculta

3. **Publicação**
   - Admin clica em "Publicar Loja"
   - `published` vira `true` no banco
   - Loja aparece na vitrine imediatamente

4. **Despublicar**
   - Admin clica em "Despublicar Loja"
   - `published` vira `false` no banco
   - Loja some da vitrine
   - Painel continua acessível

## 🔍 Verificação no Banco

Para verificar o status de publicação das lojas:

```sql
SELECT 
    name,
    subdomain,
    is_active,
    published,
    created_at
FROM tenants
ORDER BY created_at DESC;
```

## 📊 Filtros Aplicados

### Vitrine (StoreMarketplace)
```typescript
.eq('is_active', true)
.eq('published', true)  // ✅ Só lojas publicadas
```

### Painel (Dashboard)
- Sem filtro de `published`
- Admin sempre vê sua loja
- Pode publicar/despublicar a qualquer momento

## ✅ Checklist Final

- [x] Campo `published` adicionado no tipo `Tenant`
- [x] Mapeamento de `published` no hook `useTenant.ts`
- [x] Botão de publicar/despublicar no Dashboard
- [x] Filtro `.eq('published', true)` na vitrine
- [x] SQL criado para adicionar coluna no banco
- [ ] **SQL executado no Supabase** (VOCÊ PRECISA FAZER)
- [ ] **Teste de publicar loja** (VOCÊ PRECISA FAZER)
- [ ] **Teste de despublicar loja** (VOCÊ PRECISA FAZER)

## 🎉 Resultado Esperado

Depois de executar o SQL e recarregar:

1. Lojas novas: aparecem como "Oculta da vitrine"
2. Botão: "Publicar Loja" (verde)
3. Ao clicar: loja aparece na vitrine
4. Botão muda para: "Despublicar Loja" (amarelo)
5. Ao despublicar: loja some da vitrine

---

**Data**: 07/03/2026
**Status**: ✅ Código corrigido | ⏳ Aguardando execução do SQL
