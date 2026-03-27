# 🚀 GUIA RÁPIDO: Popular o App com Lojas Mock

## ⚡ 2 PASSOS SIMPLES

### **PASSO 1: Criar Tabela no Supabase** (2 minutos)

1. Acesse: **https://supabase.com/dashboard**
2. Selecione seu projeto: **yoprdgfhznxdrypinmkx**
3. No menu lateral esquerdo, clique em **SQL Editor**
4. Clique no botão **New Query** (canto superior direito)
5. Copie TODO o conteúdo do arquivo: `migrations/create_tenants_table.sql`
6. Cole no editor SQL
7. Clique em **RUN** (ou pressione Ctrl+Enter)
8. Aguarde a mensagem: ✅ **"Tabela tenants criada com sucesso!"**

---

### **PASSO 2: Popular com Lojas e Produtos** (1 minuto)

Abra o terminal e execute:

```bash
node scripts/setup-complete.js
```

Você verá:

```
🚀 Iniciando setup completo...

📋 Verificando tabela tenants...
✅ Tabela tenants encontrada!

🗑️  Limpando dados antigos...
✅ Dados limpos!

📦 Inserindo lojas e produtos...

✅ Burger King da Vila        | PRO       
   📦 3 produtos adicionados
✅ Pizzaria Bella Napoli      | BASIC     
   📦 3 produtos adicionados
✅ Sushi Master               | PRO       
   📦 3 produtos adicionados
✅ Taco Loco                  | TRIAL     
   📦 3 produtos adicionados
✅ Açaí do Bem                | BASIC     
   📦 3 produtos adicionados

✨ Setup concluído com sucesso!

📊 Resumo:
   - Lojas criadas: 5
   - Produtos totais: 15

🌐 Acesse o app e veja as lojas!
   http://localhost:5173
```

---

## 🎉 PRONTO!

Agora acesse: **http://localhost:5173**

Você verá:

- ✅ 5 lojas diferentes (Burger, Pizza, Sushi, Taco, Açaí)
- ✅ Cada loja com 3 produtos
- ✅ Cores únicas para cada marca
- ✅ Logos e banners
- ✅ Informações de delivery
- ✅ Horários de funcionamento

---

## 🏪 Lojas que Serão Criadas:

| Loja | Produtos | Plano | Cores |
|------|----------|-------|-------|
| 🍔 Burger King da Vila | Whopper, Batata, Refri | Pro | Vermelho/Bege |
| 🍕 Pizzaria Bella Napoli | Margherita, Calabresa, Tiramisu | Basic | Vermelho/Verde |
| 🍣 Sushi Master | Combo 20pc, Sashimi, Hot Roll | Pro | Vermelho/Preto |
| 🌮 Taco Loco | Taco Carne, Burrito, Nachos | Trial | Laranja/Amarelo |
| 🍇 Açaí do Bem | Açaí 500ml, Bowl Frutas, Smoothie | Basic | Roxo/Rosa |

---

## 🔍 Como Testar:

1. **Ver todas as lojas**: http://localhost:5173
2. **Clicar em uma loja**: Verá os produtos dela
3. **Cada loja tem**:
   - Cores personalizadas
   - Logo e banner
   - Produtos próprios
   - Horário de funcionamento

---

## 🐛 Se Der Erro:

### Erro: "Tabela tenants não existe"
➡️ Execute o PASSO 1 primeiro

### Erro: "duplicate key"
➡️ As lojas já existem! Está tudo certo, só atualizar a página

### Erro: "fetch failed"
➡️ Verifique sua conexão com internet

---

## 📝 Depois de Popular:

Com as lojas criadas, você pode:

1. ✅ Ver o marketplace funcionando
2. ✅ Clicar em cada loja
3. ✅ Ver produtos de cada loja
4. ✅ Testar cores diferentes
5. ✅ Adicionar mais lojas manualmente

---

## 🎨 Adicionar Mais Lojas:

Para adicionar mais lojas depois, edite o arquivo:
`scripts/setup-complete.js`

E adicione novos objetos no array `mockTenants`.

---

**🚀 Comece pelo PASSO 1!**

Vá no Supabase e execute o SQL.
