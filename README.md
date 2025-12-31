# 🍔 Sistema da Burgueria

Este projeto contém três aplicações principais para gerenciar uma burgueria:

## 📱 Aplicações

### 1. **App Principal (Cliente)**
- **Localização**: `/src/` (raiz do projeto)
- **Função**: Interface para clientes fazerem pedidos
- **Porta**: 5173
- **URL**: http://localhost:5173

### 2. **Painel da Burgueria**
- **Localização**: `/Painel Burguer/`
- **Função**: Painel administrativo para gerenciar pedidos e menu
- **Porta**: 5174
- **URL**: http://localhost:5174

### 3. **App do Entregador**
- **Localização**: `/Entregador/`
- **Função**: Interface para entregadores receberem e gerenciarem entregas
- **Porta**: 5175
- **URL**: http://localhost:5175

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### 1. Instalar Dependências
```bash
# Na raiz do projeto (para o app principal)
npm install

# Para o Painel da Burgueria
cd "Painel Burguer"
npm install

# Para o App do Entregador
cd Entregador
npm install
```

### 2. Configurar Variáveis de Ambiente
O arquivo `.env` na raiz já está configurado com as credenciais do Supabase:
```
VITE_SUPABASE_URL=https://fnqstgypqekzsuzkyfak.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC5qlGah1bF1JKU9_RyTj2FsXIuLv4OJ7w
VITE_APP_URL=https://burguer-fome.web.app
```

### 3. Executar as Aplicações

#### App Principal (Cliente)
```bash
# Na raiz do projeto
npm run dev
```
Acesse: http://localhost:5173

#### Painel da Burgueria
```bash
cd "Painel Burguer"
npm run dev
```
Acesse: http://localhost:5174

#### App do Entregador
```bash
cd Entregador
npm run dev
```
Acesse: http://localhost:5175

## 🔧 Solução de Problemas

### Erro de Variáveis de Ambiente
Se você encontrar o erro "URL do Supabase inválida ou não encontrada nas variáveis de ambiente":

1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Certifique-se de que as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão definidas
3. Reinicie o servidor de desenvolvimento

### Porta Já em Uso
Se uma porta estiver ocupada, você pode:
1. Parar outros processos Node.js: `taskkill /f /im node.exe`
2. Ou alterar a porta no arquivo `vite.config.ts` de cada projeto

## 📊 Funcionalidades

### App Principal (Cliente)
- ✅ Menu de produtos
- ✅ Carrinho de compras
- ✅ Sistema de checkout
- ✅ Acompanhamento de pedidos
- ✅ Sistema de recompensas
- ✅ PWA (Progressive Web App)

### Painel da Burgueria
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de pedidos
- ✅ Controle de status
- ✅ Gestão de menu
- ✅ Relatórios
- ✅ Configurações da loja

### App do Entregador
- ✅ Lista de pedidos para entrega
- ✅ Aceitar/rejeitar pedidos
- ✅ Atualizar status de entrega
- ✅ Navegação para endereços
- ✅ Histórico de entregas

## 🗄️ Banco de Dados (Supabase)

O projeto usa Supabase como backend. As tabelas principais são:
- `orders` - Pedidos
- `clientes` - Clientes
- `loja_info` - Informações da loja
- `menu_items` - Itens do menu

## 📱 PWA

O app principal é uma PWA, permitindo:
- Instalação no dispositivo
- Funcionamento offline
- Notificações push
- Experiência nativa

## 🎮 Jogos e Recompensas

O sistema inclui:
- Jogo do contador para ganhar prêmios
- Sistema de pontos por compras
- Roleta de recompensas
- Prêmio do dia

---

**Desenvolvido com ❤️ para sua burgueria!** 