# 🚀 Deploy do Painel Administrativo - Vercel

## ✅ Pré-requisitos

Antes de fazer o deploy, certifique-se de que:
- ✅ O upload de imagens está funcionando localmente
- ✅ Você tem uma conta no Vercel (https://vercel.com)
- ✅ Você instalou o Vercel CLI: `npm install -g vercel`

---

## 📋 Passo a Passo para Deploy

### 1️⃣ Testar o Build Localmente

Antes de fazer deploy, vamos garantir que o build funciona:

```bash
cd "c:\Users\paulo\Desktop\Burgueria\Painel Burguer"
npm run build
```

✅ Se o build for bem-sucedido, você verá a pasta `dist` criada.

---

### 2️⃣ Fazer Deploy para Vercel

#### Opção A: Usando Vercel CLI (Recomendado)

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm install -g vercel

# Fazer login no Vercel
vercel login

# Fazer deploy
vercel
```

Ao executar `vercel`, você será perguntado:
- **Set up and deploy?** → Sim/Yes
- **Which scope?** → Escolha sua conta
- **Link to existing project?** → No (primeira vez)
- **What's your project's name?** → `painel-burguer` (ou outro nome)
- **In which directory is your code located?** → `./` (deixe em branco ou digite ./)

Depois:
```bash
# Para fazer deploy em produção
vercel --prod
```

#### Opção B: Usando Interface Web do Vercel

1. Acesse https://vercel.com
2. Clique em **"Add New Project"**
3. Importe o repositório (se estiver no GitHub)
4. Ou faça upload manual da pasta

---

### 3️⃣ Configurar Variáveis de Ambiente

⚠️ **MUITO IMPORTANTE!** As variáveis de ambiente do `.env` NÃO são enviadas no deploy.

Você precisa configurá-las no Vercel:

1. No painel do Vercel, vá em **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL = [sua URL do Supabase]
VITE_SUPABASE_ANON_KEY = [sua chave anônima do Supabase]
```

**Como obter esses valores:**
1. Abra o arquivo `.env` local
2. Copie os valores de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Cole no Vercel

**Importante:**
- ✅ Adicione para **Production**, **Preview** e **Development**
- ✅ Clique em **Save**
- ✅ Faça **Redeploy** após adicionar as variáveis

---

### 4️⃣ Atualizar CORS no Supabase

Após o deploy, você precisará adicionar o domínio do Vercel nas configurações do Supabase:

1. Acesse https://supabase.com
2. Vá em **Settings** → **API**
3. Na seção **URL Configuration**, adicione:
   - `https://seu-projeto.vercel.app`
   - `https://seu-dominio-personalizado.com` (se tiver)

---

## 🔄 Comandos Úteis

### Build local (teste):
```bash
npm run build
```

### Preview local do build:
```bash
npm run preview
```

### Deploy development:
```bash
vercel
```

### Deploy production:
```bash
vercel --prod
```

### Ver logs de deploy:
```bash
vercel logs
```

---

## 🐛 Troubleshooting

### ❌ Erro: "Build failed"
**Solução**: Execute `npm run build` localmente para ver o erro completo.

### ❌ Erro: "404 Not Found" em rotas
**Solução**: Certifique-se de que o `vercel.json` existe e está configurado corretamente.

### ❌ Erro: "Supabase connection failed"
**Solução**: Verifique se as variáveis de ambiente foram configuradas no Vercel.

### ❌ Erro: "Upload de imagem não funciona"
**Solução**: 
1. Verifique se o bucket "products" está público
2. Verifique as políticas de acesso no Supabase
3. Adicione o domínio do Vercel nas configurações CORS do Supabase

---

## 📁 Estrutura Esperada

```
Painel Burguer/
├── dist/              ← Gerado pelo build
├── node_modules/
├── src/
├── .env               ← Não vai para o deploy (usar Vercel Env Vars)
├── vercel.json        ← ✅ Criado
├── package.json
└── vite.config.ts
```

---

## ✅ Checklist Pós-Deploy

Após o deploy bem-sucedido:

- [ ] Teste o login no painel em produção
- [ ] Teste adicionar um produto
- [ ] Teste o upload de imagem
- [ ] Verifique se as imagens aparecem corretamente
- [ ] Teste em diferentes navegadores
- [ ] Teste em dispositivos móveis

---

## 🔐 Segurança

⚠️ **NUNCA** commite o arquivo `.env` para o repositório!

O `.gitignore` já está configurado para ignorar `.env`, mas sempre verifique.

---

## 🎉 Pronto!

Seu painel administrativo estará disponível em:
- `https://seu-projeto.vercel.app`

Você pode adicionar um domínio personalizado nas configurações do Vercel.

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do Vercel: `vercel logs`
2. Teste o build localmente: `npm run build`
3. Verifique as variáveis de ambiente no Vercel
