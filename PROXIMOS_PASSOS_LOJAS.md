# 🎯 PRÓXIMOS PASSOS - Criar Lojas Mock

## ✅ O que já foi feito:

1. ✅ Script de seed criado (`scripts/seed-tenants.js`)
2. ✅ Script SQL criado (`migrations/create_tenants_table.sql`)
3. ✅ Guia de instruções criado (`GUIA_LOJAS_MOCK.md`)
4. ✅ Tipos TypeScript criados (`Painel Burguer/src/types/tenant.ts`)

---

## 🚀 O QUE VOCÊ PRECISA FAZER AGORA:

### **PASSO 1: Criar a Tabela no Supabase** ⚠️ IMPORTANTE

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **yoprdgfhznxdrypinmkx**
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo: `migrations/create_tenants_table.sql`
6. Copie TODO o conteúdo
7. Cole no SQL Editor do Supabase
8. Clique em **RUN** (ou Ctrl+Enter)
9. Aguarde a mensagem: ✅ "Tabela tenants criada com sucesso!"

### **PASSO 2: Popular com Lojas Mock**

Depois que a tabela estiver criada, execute no terminal:

```bash
node scripts/seed-tenants.js
```

Você verá:

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
❌ Veggie Paradise            | BASIC      | veggie-paradise
✅ Doce Mania                 | BASIC      | doce-mania

✨ Seed concluído com sucesso!
```

### **PASSO 3: Verificar no Supabase**

1. Vá em **Table Editor** no Supabase
2. Selecione a tabela `tenants`
3. Você verá 8 lojas criadas! 🎉

---

## 🏪 Lojas que serão criadas:

| Loja | Tipo | Cores | Plano | Status |
|------|------|-------|-------|--------|
| 🍔 Burger King da Vila | Hamburgueria | Vermelho/Bege | Pro | ✅ Ativa |
| 🍕 Pizzaria Bella Napoli | Pizzaria | Vermelho/Verde | Basic | ✅ Ativa |
| 🍣 Sushi Master | Japonesa | Vermelho/Preto | Pro | ✅ Ativa |
| 🌮 Taco Loco | Mexicana | Laranja/Amarelo | Trial | ✅ Ativa |
| 🍇 Açaí do Bem | Açaiteria | Roxo/Rosa | Basic | ✅ Ativa |
| 🥩 Churrascaria Gaúcha | Churrascaria | Marrom/Bege | Enterprise | ✅ Ativa |
| 🥗 Veggie Paradise | Vegana | Verde/Verde Claro | Basic | ❌ Inativa |
| 🍰 Doce Mania | Confeitaria | Rosa/Rosa Claro | Basic | ✅ Ativa |

---

## 🎨 Visualização das Cores

Cada loja terá cores únicas:

- **Burger King da Vila**: 🔴 Vermelho vibrante (#D62300)
- **Bella Napoli**: 🇮🇹 Cores da Itália (Vermelho + Verde)
- **Sushi Master**: ⚫ Minimalista (Vermelho + Preto)
- **Taco Loco**: 🌮 Vibrante (Laranja + Amarelo)
- **Açaí do Bem**: 💜 Roxo + Rosa
- **Churrascaria**: 🟤 Tons terrosos
- **Veggie Paradise**: 🟢 Verde natural
- **Doce Mania**: 💗 Rosa doce

---

## 📊 Dados Incluídos em Cada Loja:

✅ Nome e subdomain único  
✅ Logo e banner (imagens do Unsplash)  
✅ Cores primária e secundária  
✅ Plano de assinatura  
✅ Informações do proprietário  
✅ Endereço completo  
✅ Horário de funcionamento  
✅ Taxa de delivery  
✅ Pedido mínimo  
✅ Raio de entrega  

---

## 🔍 Como Testar Depois

Depois de criar as lojas, você poderá:

1. Ver todas as lojas no Supabase
2. Filtrar por plano (trial, basic, pro, enterprise)
3. Ver lojas ativas vs inativas
4. Testar diferentes configurações de delivery
5. Visualizar as cores de cada marca

---

## ⚡ Comando Rápido (Copiar e Colar)

```bash
# Executar seed
node scripts/seed-tenants.js
```

---

## 🐛 Se Der Erro

### Erro: "relation 'tenants' does not exist"
➡️ **Solução:** Execute o PASSO 1 primeiro (criar tabela no Supabase)

### Erro: "fetch failed"
➡️ **Solução:** Verifique sua conexão com internet e as credenciais do Supabase

### Erro: "duplicate key"
➡️ **Solução:** As lojas já existem. O script limpa automaticamente antes de inserir

---

## 📝 Depois de Criar as Lojas

Com as lojas criadas, você poderá:

1. ✅ Visualizar dados reais no banco
2. ⏳ Implementar seletor de loja no frontend
3. ⏳ Aplicar cores/tema de cada loja
4. ⏳ Filtrar produtos por tenant_id
5. ⏳ Criar dashboard de administração

---

**🎯 Comece pelo PASSO 1!**

Abra o Supabase e execute o SQL de criação da tabela.
