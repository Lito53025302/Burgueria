# 🔄 Guia de Reativação do Projeto Supabase

## ⚠️ Problema Identificado

O erro `ERR_NAME_NOT_RESOLVED` indica que o projeto Supabase estava pausado/inativo.

```
yoprdgfhznxdrypinmkx.supabase.co/rest/v1/tenants
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

---

## ✅ Passos para Reativar

### 1. Acessar o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login com sua conta
3. Localize o projeto: `yoprdgfhznxdrypinmkx`

### 2. Reativar o Projeto

**Opção A: Projeto Pausado**
- Clique no botão "Resume Project" ou "Restore Project"
- Aguarde 2-5 minutos para o projeto ficar ativo
- Você verá um status "Active" quando estiver pronto

**Opção B: Projeto Expirado (Free Tier)**
- Projetos gratuitos pausam após 7 dias de inatividade
- Clique em "Restore" para reativar
- Pode levar até 10 minutos

### 3. Verificar Status

Após reativar, verifique se o projeto está respondendo:

**No navegador, acesse:**
```
https://yoprdgfhznxdrypinmkx.supabase.co
```

Você deve ver uma resposta JSON (não erro 404 ou DNS).

---

## 🔑 Verificar Credenciais

Após reativar, suas credenciais devem continuar as mesmas:

### Arquivo `.env` atual:
```env
VITE_SUPABASE_URL=https://yoprdgfhznxdrypinmkx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Como verificar se estão corretas:

1. Acesse o Dashboard do Supabase
2. Vá em **Settings** → **API**
3. Compare:
   - **Project URL** com `VITE_SUPABASE_URL`
   - **anon/public key** com `VITE_SUPABASE_ANON_KEY`

---

## 🚀 Após Reativação

### 1. Reiniciar o Servidor de Desenvolvimento

```bash
# Parar o servidor atual (Ctrl+C)

# Limpar cache
npm run dev
```

### 2. Testar Conexão

Abra o console do navegador e execute:

```javascript
// Teste rápido de conexão
fetch('https://yoprdgfhznxdrypinmkx.supabase.co/rest/v1/')
  .then(r => r.json())
  .then(d => console.log('✅ Supabase ativo!', d))
  .catch(e => console.error('❌ Ainda inativo:', e));
```

### 3. Verificar Funcionalidades

- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Busca de CEP funciona
- [ ] Pedidos carregam
- [ ] Realtime funciona

---

## 🔧 Se as Credenciais Mudaram

Caso o Supabase tenha gerado novas credenciais:

### 1. Obter Novas Credenciais

No Dashboard do Supabase:
1. **Settings** → **API**
2. Copie:
   - **Project URL**
   - **anon public key**

### 2. Atualizar Arquivos `.env`

**Arquivo `.env`:**
```env
VITE_SUPABASE_URL=https://SEU-NOVO-URL.supabase.co
VITE_SUPABASE_ANON_KEY=SEU-NOVO-TOKEN
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC5qlGah1bF1JKU9_RyTj2FsXIuLv4OJ7w
VITE_APP_URL=https://burguer-fome.web.app
```

**Arquivo `.env.local`:**
```env
VITE_SUPABASE_URL=https://SEU-NOVO-URL.supabase.co
VITE_SUPABASE_ANON_KEY=SEU-NOVO-TOKEN
```

### 3. Atualizar em Todas as Aplicações

```bash
# App Principal
# Já atualizado acima

# Painel Admin
cd "Painel Burguer"
# Criar/atualizar .env
echo "VITE_SUPABASE_URL=https://SEU-NOVO-URL.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=SEU-NOVO-TOKEN" >> .env

# App Entregador
cd ../Entregador
# Criar/atualizar .env
echo "VITE_SUPABASE_URL=https://SEU-NOVO-URL.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=SEU-NOVO-TOKEN" >> .env
```

### 4. Reiniciar Todos os Servidores

```bash
# Terminal 1 - App Principal
npm run dev

# Terminal 2 - Painel Admin
cd "Painel Burguer"
npm run dev

# Terminal 3 - App Entregador
cd Entregador
npm run dev
```

---

## 📊 Checklist de Reativação

### Antes de Começar
- [ ] Acessei o Dashboard do Supabase
- [ ] Localizei o projeto `yoprdgfhznxdrypinmkx`
- [ ] Cliquei em "Resume/Restore Project"
- [ ] Aguardei o projeto ficar "Active"

### Verificação de Conexão
- [ ] Testei a URL no navegador
- [ ] URL responde (não dá erro DNS)
- [ ] Credenciais estão corretas no `.env`

### Testes de Funcionalidade
- [ ] App Principal carrega
- [ ] Painel Admin carrega
- [ ] App Entregador carrega
- [ ] Login funciona
- [ ] Busca de CEP funciona
- [ ] Pedidos carregam
- [ ] Realtime funciona

---

## 🐛 Problemas Comuns

### Erro: "Failed to fetch"
**Causa:** Projeto ainda está iniciando
**Solução:** Aguarde mais 2-3 minutos

### Erro: "Invalid API key"
**Causa:** Credenciais desatualizadas
**Solução:** Atualize as chaves no `.env`

### Erro: "CORS error"
**Causa:** URL incorreta no `.env`
**Solução:** Verifique se a URL está correta

### Erro: "Table does not exist"
**Causa:** Banco de dados foi resetado
**Solução:** Execute as migrations novamente

---

## 💡 Dicas para Evitar Pausas Futuras

### Plano Free do Supabase
- Projetos pausam após **7 dias de inatividade**
- Faça login pelo menos 1x por semana
- Ou faça upgrade para plano pago

### Manter Projeto Ativo
1. Configure um cron job para fazer ping
2. Use serviços como UptimeRobot
3. Ou simplesmente acesse o app regularmente

### Backup Regular
```bash
# Fazer backup do banco
# No Dashboard: Database → Backups → Download
```

---

## 📞 Suporte

Se continuar com problemas:

1. **Supabase Support:** https://supabase.com/support
2. **Discord do Supabase:** https://discord.supabase.com
3. **Documentação:** https://supabase.com/docs

---

## ✅ Próximos Passos

Após reativar com sucesso:

1. Teste todas as funcionalidades
2. Verifique se os dados estão intactos
3. Continue o desenvolvimento normalmente
4. Configure backups automáticos

---

**Status:** 🔄 Aguardando reativação do projeto Supabase
**Última atualização:** 05/03/2026
