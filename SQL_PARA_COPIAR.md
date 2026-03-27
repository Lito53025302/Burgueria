# 📋 COPIE E COLE ESTE SQL NO SUPABASE

## 🎯 Instruções:

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **yoprdgfhznxdrypinmkx**
3. Clique em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. **COPIE TODO O CÓDIGO ABAIXO**
6. Cole no editor
7. Clique em **RUN**

---

## 📝 CÓDIGO SQL (COPIAR TUDO):

```sql
-- ============================================
-- CRIAÇÃO DA TABELA TENANTS (MULTI-TENANT)
-- ============================================

-- Criar tabela de tenants
CREATE TABLE IF NOT EXISTS tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações Básicas
  name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  
  -- Customização Visual
  primary_color text DEFAULT '#FF6B6B',
  secondary_color text DEFAULT '#4ECDC4',
  logo_url text,
  banner_url text,
  
  -- Configurações de Assinatura
  is_active boolean DEFAULT true,
  subscription_plan text DEFAULT 'trial',
  subscription_expires_at timestamp,
  
  -- Informações do Proprietário
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  owner_phone text,
  
  -- Endereço
  address text,
  city text,
  state text,
  zip_code text,
  
  -- Horário de Funcionamento
  opening_time text DEFAULT '11:00',
  closing_time text DEFAULT '23:00',
  
  -- Configurações de Delivery
  delivery_fee decimal(10,2) DEFAULT 0.00,
  minimum_order decimal(10,2) DEFAULT 0.00,
  delivery_radius_km decimal(5,2) DEFAULT 5.00,
  
  -- Timestamps
  created_at timestamp DEFAULT timezone('utc'::text, now()),
  updated_at timestamp DEFAULT timezone('utc'::text, now())
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_plan ON tenants(subscription_plan);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler tenants ativos
CREATE POLICY IF NOT EXISTS "Tenants ativos são públicos"
  ON tenants FOR SELECT
  USING (is_active = true);

-- Política: Apenas o dono pode atualizar seu tenant
CREATE POLICY IF NOT EXISTS "Donos podem atualizar seus tenants"
  ON tenants FOR UPDATE
  USING (owner_email = auth.jwt() ->> 'email');

-- Política: Apenas admins podem inserir novos tenants
CREATE POLICY IF NOT EXISTS "Admins podem criar tenants"
  ON tenants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_tenants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_tenants_updated_at ON tenants;
CREATE TRIGGER trigger_update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_tenants_updated_at();

-- Comentários na tabela
COMMENT ON TABLE tenants IS 'Tabela de tenants (lojas) do sistema multi-tenant';
COMMENT ON COLUMN tenants.subdomain IS 'Subdomínio único da loja (ex: bella-napoli)';
COMMENT ON COLUMN tenants.subscription_plan IS 'Plano de assinatura: trial, basic, pro, enterprise';
COMMENT ON COLUMN tenants.is_active IS 'Se false, a loja não aparece no sistema';
COMMENT ON COLUMN tenants.delivery_radius_km IS 'Raio de entrega em quilômetros';

-- Verificar se a tabela foi criada
SELECT 'Tabela tenants criada com sucesso!' as status;
```

---

## ✅ Resultado Esperado:

Após executar, você verá na parte inferior:

```
Tabela tenants criada com sucesso!
```

---

## 🎯 Próximo Passo:

Depois de executar o SQL acima, volte para o terminal e execute:

```bash
node scripts/setup-complete.js
```

Isso vai popular o banco com 5 lojas e 15 produtos!

---

## 🔍 Verificar se Funcionou:

1. No Supabase, vá em **Table Editor**
2. Procure a tabela **tenants**
3. Você verá a nova tabela criada (ainda vazia)
4. Depois de executar o script Node.js, verá 5 lojas

---

**⏱️ Tempo total: 3 minutos**
