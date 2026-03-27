# 🏢 PLANO DE IMPLEMENTAÇÃO MULTI-TENANT
**Data Início:** 2026-01-05  
**Estimativa:** 2-3 semanas  
**Complexidade:** ALTA

---

## 📊 **FASE 1: Estrutura do Banco (2-3 dias)**

### ✅ **1.1 Criar Tabela de Tenants**
```sql
CREATE TABLE tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,              -- "Pizzaria do João"
  subdomain text UNIQUE NOT NULL,  -- "pizzaria-joao"
  slug text UNIQUE NOT NULL,       -- URL-friendly
  
  -- Customização Visual
  primary_color text DEFAULT '#FF6B6B',
  secondary_color text DEFAULT '#4ECDC4',
  logo_url text,
  banner_url text,
  
  -- Configurações
  is_active boolean DEFAULT true,
  subscription_plan text DEFAULT 'trial', -- trial, basic, pro, enterprise
  subscription_expires_at timestamp,
  
  -- Contato
  owner_email text NOT NULL,
  owner_phone text,
  
  -- Timestamps
  created_at timestamp DEFAULT timezone('utc'::text, now()),
  updated_at timestamp DEFAULT timezone('utc'::text, now())
);
```

### ✅ **1.2 Adicionar tenant_id em TODAS as tabelas**
```sql
-- menu_items
ALTER TABLE menu_items ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_menu_items_tenant ON menu_items(tenant_id);

-- orders
ALTER TABLE orders ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_orders_tenant ON orders(tenant_id);

-- profiles
ALTER TABLE profiles ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);

-- available_customizations (pode ser compartilhado OU por tenant)
ALTER TABLE available_customizations ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_customizations_tenant ON available_customizations(tenant_id);
```

### ✅ **1.3 Migrar Dados Atuais para Tenant Padrão**
```sql
-- Criar tenant padrão (sua loja atual)
INSERT INTO tenants (id, name, subdomain, slug, owner_email)
VALUES (
  gen_random_uuid(),
  'Burgueria Principal',
  'principal',
  'principal',
  'litogarinho@gmail.com'
) RETURNING id;

-- Atualizar todas as tabelas com o tenant_id do tenant padrão
UPDATE menu_items SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'principal');
UPDATE orders SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'principal');
UPDATE profiles SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'principal');
UPDATE available_customizations SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'principal');

-- Tornar tenant_id obrigatório
ALTER TABLE menu_items ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN tenant_id SET NOT NULL;
```

### ✅ **1.4 Implementar RLS (Row Level Security)**
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_customizations ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuário só vê dados do seu tenant
CREATE POLICY tenant_isolation_menu ON menu_items
  USING (tenant_id = (auth.jwt() -> 'app_metadata' -> 'tenant_id')::uuid);

CREATE POLICY tenant_isolation_orders ON orders
  USING (tenant_id = (auth.jwt() -> 'app_metadata' -> 'tenant_id')::uuid);

CREATE POLICY tenant_isolation_profiles ON profiles
  USING (tenant_id = (auth.jwt() -> 'app_metadata' -> 'tenant_id')::uuid);

-- Customizations pode ser compartilhado OU isolado (decidir depois)
```

---

## 💻 **FASE 2: Frontend - Detecção de Tenant (3-4 dias)**

### ✅ **2.1 Criar Hook useTenant**
```typescript
// src/hooks/useTenant.ts
export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  
  useEffect(() => {
    const subdomain = getSubdomain(); // "pizzaria-joao"
    fetchTenantBySubdomain(subdomain).then(setTenant);
  }, []);
  
  return { tenant, tenantId: tenant?.id };
}
```

### ✅ **2.2 Criar TenantProvider**
```typescript
// src/contexts/TenantContext.tsx
export function TenantProvider({ children }) {
  const { tenant } = useTenant();
  
  return (
    <TenantContext.Provider value={{ tenant }}>
      {tenant ? children : <LoadingTenant />}
    </TenantContext.Provider>
  );
}
```

### ✅ **2.3 Atualizar Todas as Queries**
```typescript
// Antes:
const { data } = await supabase.from('menu_items').select('*');

// Depois:
const { tenant } = useTenant();
const { data } = await supabase
  .from('menu_items')
  .select('*')
  .eq('tenant_id', tenant.id); // ← FILTRO OBRIGATÓRIO
```

### ✅ **2.4 Aplicar Tema do Tenant**
```typescript
// Usar cores do tenant
<div style={{ 
  '--primary': tenant.primary_color,
  '--secondary': tenant.secondary_color 
}}>
```

---

## 🎨 **FASE 3: Customização Visual (2-3 dias)**

### ✅ **3.1 Painel de Customização**
- Upload de logo
- Escolher cores (color picker)
- Upload de banner
- Preview em tempo real

### ✅ **3.2 Aplicar no Cliente**
- Carregar logo do tenant
- Aplicar cores do tenant
- Mostrar nome da loja

---

## 🔐 **FASE 4: Autenticação Multi-Tenant (2-3 dias)**

### ✅ **4.1 Adicionar tenant_id no JWT**
```sql
-- Trigger para adicionar tenant_id ao JWT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Adicionar tenant_id no app_metadata
  UPDATE auth.users
  SET raw_app_meta_data = 
    raw_app_meta_data || 
    json_build_object('tenant_id', NEW.tenant_id)::jsonb
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### ✅ **4.2 Login por Subdomain**
- Detectar subdomain antes do login
- Buscar tenant_id pelo subdomain
- Criar usuário já vinculado ao tenant

---

## 🏪 **FASE 5: Onboarding de Novas Lojas (3-4 dias)**

### ✅ **5.1 Página de Cadastro (/signup)**
```
Nome da Loja: ___________
Subdomain: ___________  .seusistema.com
Email: ___________
Senha: ___________
Telefone: ___________
```

### ✅ **5.2 Processo Automático**
1. Criar tenant na tabela `tenants`
2. Criar usuário admin do tenant
3. Vincular user ao tenant (tenant_id)
4. Enviar email de boas-vindas
5. Redirecionar para onboarding

### ✅ **5.3 Setup Wizard**
```
Passo 1: Upload do Logo
Passo 2: Escolher Cores
Passo 3: Adicionar Primeiro Item ao Cardápio
Passo 4: Configurar Horário de Funcionamento
Passo 5: Pronto! 🎉
```

---

## 💰 **FASE 6: Pagamentos e Planos (4-5 dias)**

### ✅ **6.1 Integração com Stripe/Asaas**
```typescript
const plans = {
  trial: { price: 0, days: 14, limits: { orders: 50 } },
  basic: { price: 99, limits: { orders: 500 } },
  pro: { price: 199, limits: { orders: -1 } }
};
```

### ✅ **6.2 Check de Assinatura**
```typescript
if (tenant.subscription_expires_at < new Date()) {
  return <SubscriptionExpired />;
}
```

---

## 🚚 **FASE 7: App Entregador Multi-Tenant (2-3 dias)**

### ✅ **7.1 Opção A: Entregador Dedicado**
- Entregador pertence a 1 tenant
- Vê só pedidos do seu tenant
- Simples de implementar

### ✅ **7.2 Opção B: Entregador Compartilhado**
- Entregador trabalha para vários tenants
- Tabela `deliverer_tenants` (many-to-many)
- Mais complexo

**Recomendação Inicial:** Opção A

---

## 📊 **FASE 8: Admin Dashboard (3-4 dias)**

### ✅ **8.1 Super Admin**
- Ver todas as lojas
- Ativar/desativar lojas
- Ver estatísticas gerais
- Suporte a lojas

### ✅ **8.2 Métricas**
```
Total de Lojas: 47
Lojas Ativas: 42
Receita Mensal: R$ 8.358,00
Taxa de Cancelamento: 3.2%
```

---

## 🔄 **CRONOGRAMA ESTIMADO**

| Fase | Duração | Prioridade |
|------|---------|------------|
| 1. Estrutura BD | 2-3 dias | 🔴 CRÍTICA |
| 2. Frontend Tenant | 3-4 dias | 🔴 CRÍTICA |
| 3. Customização | 2-3 dias | 🟡 ALTA |
| 4. Autenticação | 2-3 dias | 🔴 CRÍTICA |
| 5. Onboarding | 3-4 dias | 🟡 ALTA |
| 6. Pagamentos | 4-5 dias | 🟢 MÉDIA |
| 7. App Entregador | 2-3 dias | 🟡 ALTA |
| 8. Admin Dashboard | 3-4 dias | 🟢 MÉDIA |

**Total:** 21-29 dias (3-4 semanas)

---

## ✅ **MVP (Mínimo Viável):**

Para validar rápido, implementar primeiro:
1. ✅ Fase 1 (Banco) - OBRIGATÓRIO
2. ✅ Fase 2 (Frontend) - OBRIGATÓRIO
3. ✅ Fase 4 (Auth) - OBRIGATÓRIO
4. ✅ Fase 5 (Onboarding) - OBRIGATÓRIO

**MVP em:** ~10 dias

Depois adicionar customização, pagamentos, etc.

---

## 🎯 **Próximos Passos IMEDIATOS:**

1. ☐ Criar branch `feature/multi-tenant`
2. ☐ Começar Fase 1: Criar tabela `tenants`
3. ☐ Adicionar `tenant_id` nas tabelas
4. ☐ Migrar dados atuais para tenant padrão
5. ☐ Testar isolamento de dados

---

**Pronto para começar?** 🚀
