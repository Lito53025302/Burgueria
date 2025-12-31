# 🚀 Guia de Deploy - Burgueria (Vercel)

Este guia explica como colocar seus 3 aplicativos (Cliente, Painel Admin, Entregador) no ar usando a Vercel.

## Pré-requisitos
1. Uma conta no [GitHub](https://github.com).
2. Uma conta na [Vercel](https://vercel.com) (conectada ao seu GitHub).
3. [Git instalado](https://git-scm.com/downloads) no seu computador.

---

## Passo 1: Subir o Código para o GitHub

1. Abra o terminal na pasta `Burgueria`.
2. Inicialize o Git e faça o commit inicial:
   ```bash
   git init
   git add .
   git commit -m "Commit inicial da Burgueria Completa"
   ```
3. Crie um **Novo Repositório** no GitHub (chamado `burgueria-sistema`, por exemplo).
4. Siga as instruções do GitHub para conectar seu repositório local ao remoto:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
   git push -u origin main
   ```

---

## Passo 2: Criar os Projetos na Vercel

Você criará **3 projetos separados** na Vercel, todos puxando do **mesmo** repositório do GitHub.

### 🍔 1. App do Cliente (Site Principal)
1. No painel da Vercel, clique em **"Add New..."** -> **"Project"**.
2. Importe o repositório `burgueria-sistema`.
3. **Configurações:**
   - **Project Name:** `burgueria-cliente` (ou nome da sua marca).
   - **Framework Preset:** Vite.
   - **Root Directory:** Deixe vazio (ou `./`), pois o app principal está na raiz.
   - **Environment Variables:**
     - Adicione `VITE_SUPABASE_URL` = (Copie do seu arquivo .env)
     - Adicione `VITE_SUPABASE_ANON_KEY` = (Copie do seu arquivo .env)
     - **Importante:** Se você usa o Google Maps API Key, adicione `VITE_GOOGLE_MAPS_API_KEY`.
4. Clique em **Deploy**.

### 💻 2. Painel Administrativo (Admin)
1. Volte ao dashboard e clique em **"Add New..."** -> **"Project"**.
2. Importe o **mesmo** repositório `burgueria-sistema`.
3. **Configurações:**
   - **Project Name:** `burgueria-admin`.
   - **Framework Preset:** Vite.
   - **Root Directory:** Clique em "Edit" e selecione a pasta `Painel Burguer`.
   - **Environment Variables:**
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
4. Clique em **Deploy**.

### 🏍️ 3. App do Entregador
1. Mais uma vez, **"Add New..."** -> **"Project"**.
2. Importe o **mesmo** repositório.
3. **Configurações:**
   - **Project Name:** `burgueria-entregador`.
   - **Framework Preset:** Vite.
   - **Root Directory:** Clique em "Edit" e selecione a pasta `Entregador`.
   - **Environment Variables:**
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
4. Clique em **Deploy**.

---

## Passo 3: Links Finais

Após o deploy, a Vercel vai gerar links automáticos como:
- `burgueria-cliente.vercel.app`
- `burgueria-admin.vercel.app`
- `burgueria-entregador.vercel.app`

Você pode configurar domínios personalizados (ex: `suaburgueria.com.br`, `admin.suaburgueria.com.br`) nas configurações de "Domains" de cada projeto.

## ⚠️ Dica Importante: Banco de Dados

Certifique-se de que nas configurações do Supabase (Authentication -> URL Configuration -> Site URL), você adicione os links de produção da Vercel na lista de **Redirect URLs**.
Isso é necessário para que o login social (Google) ou links de confirmação de email funcionem corretamente no site ao vivo.
