# 🏪 Guia: Criar Lojas Mock de Teste

Este guia mostra como popular o banco de dados com lojas de teste para visualizar o sistema multi-tenant.

---

## 📋 Passo a Passo

### **Passo 1: Criar a Tabela Tenants no Supabase**

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo: `migrations/create_tenants_table.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Verifique se apareceu: "Tabela tenants criada com sucesso!"

### **Passo 2: Executar o Script de Seed**

No terminal, execute:

```bash
cd "C:\Users\paulo\Desktop\Burgueria"
node scripts/seed-tenants.js
```

Você verá algo assim:

```
🌱 Iniciando seed de tenants...

🗑️  Limpando tenants existentes...
📦 Inserindo lojas mock...

✅ Burger King da Vila        | PRO        | burger-king-vila
✅ Pizzaria Bella Napoli      | BASIC      | bella-napoli
✅ Sushi Master               | PRO        | sushi-master
✅ Taco Loco                  | TRIAL      | taco-loco
✅ Açaí do Bem                | BASIC      | acai-do-bem
✅ Churrascaria Gaúcha        | ENTERPRISE | churrascaria-gaucha
❌ Veggie Paradise            | BASIC      | veggie-paradise (INATIVA)
✅ Doce Mania                 | BASIC      | doce-mania

✨ Seed concluído com sucesso!

📊 Total de lojas criadas: 8
   - Ativas: 7
   - Inativas: 1

🎨 Lojas por plano:
   - Trial: 1
   - Basic: 4
   - Pro: 2
   - Enterprise: 1
```

---

## 🏪 Lojas Criadas

### 1. **Burger King da Vila** 🍔
- **Subdomain:** burger-king-vila
- **Cores:** Vermelho (#D62300) e Bege (#F5EBDC)
- **Plano:** Pro
- **Delivery:** R$ 8,00 | Mínimo: R$ 25,00
- **Horário:** 11:00 - 23:00

### 2. **Pizzaria Bella Napoli** 🍕
- **Subdomain:** bella-napoli
- **Cores:** Vermelho (#C8102E) e Verde (#009246)
- **Plano:** Basic
- **Delivery:** R$ 10,00 | Mínimo: R$ 35,00
- **Horário:** 18:00 - 00:00

### 3. **Sushi Master** 🍣
- **Subdomain:** sushi-master
- **Cores:** Vermelho (#E60012) e Preto (#000000)
- **Plano:** Pro
- **Delivery:** R$ 12,00 | Mínimo: R$ 50,00
- **Horário:** 11:30 - 23:30

### 4. **Taco Loco** 🌮
- **Subdomain:** taco-loco
- **Cores:** Laranja (#FF6B35) e Amarelo (#F7931E)
- **Plano:** Trial (14 dias)
- **Delivery:** R$ 7,00 | Mínimo: R$ 20,00
- **Horário:** 12:00 - 22:00

### 5. **Açaí do Bem** 🍇
- **Subdomain:** acai-do-bem
- **Cores:** Roxo (#6B2C91) e Rosa (#E91E63)
- **Plano:** Basic
- **Delivery:** R$ 5,00 | Mínimo: R$ 15,00
- **Horário:** 10:00 - 20:00

### 6. **Churrascaria Gaúcha** 🥩
- **Subdomain:** churrascaria-gaucha
- **Cores:** Marrom (#8B4513) e Bege (#D2691E)
- **Plano:** Enterprise
- **Delivery:** R$ 15,00 | Mínimo: R$ 60,00
- **Horário:** 11:00 - 23:30

### 7. **Veggie Paradise** 🥗
- **Subdomain:** veggie-paradise
- **Cores:** Verde (#4CAF50) e Verde Claro (#8BC34A)
- **Plano:** Basic (EXPIRADO)
- **Status:** ❌ INATIVA
- **Delivery:** R$ 6,00 | Mínimo: R$ 22,00

### 8. **Doce Mania** 🍰
- **Subdomain:** doce-mania
- **Cores:** Rosa (#FF69B4) e Rosa Claro (#FFB6C1)
- **Plano:** Basic
- **Delivery:** R$ 8,00 | Mínimo: R$ 30,00
- **Horário:** 09:00 - 19:00

---

## 🔍 Verificar no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor**
3. Selecione a tabela `tenants`
4. Você verá as 8 lojas criadas

---

## 🧪 Testar no App

Para testar cada loja, você precisará implementar a detecção de subdomain no frontend.

**URLs de teste (quando implementado):**
- http://burger-king-vila.localhost:5173
- http://bella-napoli.localhost:5173
- http://sushi-master.localhost:5173
- http://taco-loco.localhost:5173

---

## 🗑️ Limpar Dados de Teste

Se quiser remover todas as lojas mock:

```sql
-- No SQL Editor do Supabase
DELETE FROM tenants;
```

Ou execute o seed novamente (ele limpa automaticamente antes de inserir).

---

## 📝 Próximos Passos

Agora que você tem lojas de teste, pode:

1. ✅ Visualizar as lojas no Supabase
2. ⏳ Implementar detecção de tenant no frontend
3. ⏳ Criar página de listagem de lojas
4. ⏳ Aplicar cores/logo de cada tenant
5. ⏳ Filtrar produtos por tenant_id

---

## 🐛 Problemas Comuns

### Erro: "relation 'tenants' does not exist"
**Solução:** Execute o SQL de criação da tabela primeiro (Passo 1)

### Erro: "duplicate key value violates unique constraint"
**Solução:** As lojas já existem. Execute o seed novamente (ele limpa antes)

### Erro: "permission denied for table tenants"
**Solução:** Verifique as políticas RLS no Supabase

---

**Criado em:** 07/02/2026  
**Versão:** 1.0
