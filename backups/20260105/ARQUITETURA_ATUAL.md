# 📸 SNAPSHOT DA ARQUITETURA ATUAL
**Data:** 2026-01-05  
**Versão:** v1.0-pre-multitenant

---

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Existentes:**

#### 1. **menu_items** (Itens do Cardápio)
```sql
- id (uuid, PK)
- name (text)
- description (text)
- price (numeric)
- image (text)
- category (text)
- available (boolean)
- sold_count (integer)
- created_at (timestamp)
- customizations (jsonb)
- spice_level (text)
- prep_time_min (integer)
```

#### 2. **orders** (Pedidos)
```sql
- id (uuid, PK)
- customer_name (text)
- customer_phone (text)
- items (jsonb)
- total (numeric)
- status (text)
- created_at (timestamp)
- estimated_time (integer)
- address (text)
- payment_method (text)
- change_for (text)
- motoboy_id (uuid)
- motoboy_name (text)
- motoboy_arrived (boolean)
```

#### 3. **profiles** (Usuários do Sistema)
```sql
- id (uuid, PK, FK -> auth.users)
- email (text)
- name (text)
- role (text) -- 'admin', 'manager', 'deliverer'
- created_at (timestamp)
```

#### 4. **available_customizations** (Catálogo de Complementos)
```sql
- id (uuid, PK)
- name (text, UNIQUE)
- price (numeric)
- category (text)
- created_at (timestamp)
```

#### 5. **clientes** (se existir - verificar)
```sql
- ?
```

#### 6. **loja_info** (se existir - verificar)
```sql
- ?
```

---

## 🏗️ **Arquitetura de Apps**

### **Frontend - Cliente (Burgueria):**
- **Path:** `src/`
- **Framework:** React + TypeScript + Vite
- **Styling:** TailwindCSS
- **Deploy:** Vercel
- **URL Produção:** [verificar no Vercel]

### **Painel Admin:**
- **Path:** `Painel Burguer/`
- **Framework:** React + TypeScript + Vite
- **Auth:** Supabase Auth
- **Deploy:** Vercel
- **URL Produção:** [verificar no Vercel]

### **App Entregador:**
- **Path:** `Entregador/`
- **Framework:** React + TypeScript + Vite
- **Deploy:** Vercel
- **URL Produção:** [verificar no Vercel]

---

## 🔐 **Autenticação Atual**

- **Provider:** Supabase Auth
- **Método:** Email/Password
- **Roles:** Gerenciado via `profiles.role`
- **RLS:** ❌ NÃO implementado (todas as tabelas UNRESTRICTED)

---

## 📊 **Fluxo de Dados Atual**

```
Cliente (App) 
    ↓
Supabase (orders table)
    ↓
Painel Admin (monitora pedidos via Realtime)
    ↓
Entregador (pega pedidos via motoboy_id)
```

---

## ⚠️ **Limitações Atuais (Single-Tenant)**

1. ❌ **Uma loja por instalação**
2. ❌ **Sem isolamento de dados**
3. ❌ **Sem customização por loja**
4. ❌ **Não escalável para múltiplos clientes**

---

## 🎯 **Objetivo da Migração Multi-Tenant**

1. ✅ **Múltiplas lojas** no mesmo sistema
2. ✅ **Isolamento total** de dados por loja
3. ✅ **Customização visual** por loja (cores, logo, etc.)
4. ✅ **Subdomain por loja** (loja-joao.sistema.com)
5. ✅ **Modelo SaaS** (cobrar mensalidade)

---

## 📁 **Arquivos de Configuração**

- **Supabase:**
  - URL: `yoprdgfhznxdrypinmkx.supabase.co`
  - Keys: Variáveis de ambiente no Vercel

- **Vercel:**
  - Conta: `burguerialt@gmail.com`
  - Projetos: 3 (burgueria, painel-admin, entregador)

---

## 🔄 **Estado do Código**

- **Branch:** `main`
- **Último Commit:** `cd8177f` (fix: Converter camelCase para snake_case)
- **Tag de Backup:** `v1.0-pre-multitenant`
- **GitHub:** `https://github.com/Lito53025302/Burgueria`

---

## 📝 **Notas Importantes**

- ✅ Complementos reutilizáveis implementados
- ✅ Nível de picância implementado
- ✅ Upload de imagens no Supabase Storage
- ⚠️ RLS desabilitado (será necessário habilitar no multi-tenant)

---

**Backup Criado Por:** Antigravity AI  
**Para Restaurar:** Veja `BACKUP_DATABASE_20260105.sql`
