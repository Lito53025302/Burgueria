# 🍔 Burgueria - Plataforma Multi-Tenant de Delivery

Este documento detalha a estrutura, arquitetura e planejamento do projeto **Burgueria**, uma solução SaaS (Software as a Service) para hamburguerias e restaurantes gerenciarem seus pedidos, entregas e presença online.

---

## 📋 1. Requisitos Técnicos

### Requisitos Funcionais (RF)
- **RF01: Multi-tenancy**: Suporte a múltiplas lojas com subdomínios ou identificadores únicos.
- **RF02: Marketplace de Lojas**: Vitrine centralizada para clientes descobrirem lojas disponíveis.
- **RF03: Gestão de Cardápio**: Lojistas podem criar, editar e excluir itens, categorias e complementos.
- **RF04: Gestão de Pedidos**: Fluxo completo desde a criação pelo cliente até a entrega final.
- **RF05: Realtime Updates**: Atualizações instantâneas de status de pedidos para clientes e lojistas.
- **RF06: Gestão de Entregadores**: Cadastro e atribuição de pedidos a entregadores específicos.
- **RF07: Localização**: Cálculo de taxas de entrega baseado em distância ou CEP (integração ViaCEP).
- **RF08: Autenticação e Autorização**: Níveis de acesso para Clientes, Lojistas (Admins) e Entregadores.

### Requisitos Não Funcionais (RNF)
- **RNF01: Performance**: Tempo de carregamento inicial otimizado (Vite + React).
- **RNF02: Escalabilidade**: Arquitetura baseada em Supabase (PostgreSQL) para suportar crescimento.
- **RNF03: Segurança**: Row Level Security (RLS) no banco de dados para isolamento total entre tenants.
- **RNF04: Responsividade**: UI adaptável para dispositivos móveis (foco principal) e desktop.
- **RNF05: Confiabilidade**: Tratamento de erros robusto e logging profissional.

---

## 🏗️ 2. Arquitetura da Solução

A solução é composta por três aplicações principais compartilhando a mesma infraestrutura de backend.

### Componentes da Arquitetura
1.  **Frontend Cliente (App Principal)**:
    - Foco em conversão e UX.
    - Navegação por lojas, carrinho de compras e acompanhamento de pedido.
2.  **Painel Administrativo (Painel Burguer)**:
    - Gestão operacional da loja.
    - Dashboard de vendas, configuração de cardápio e gestão de equipe.
3.  **App do Entregador (Entregador)**:
    - Interface simplificada para gestão de rotas e confirmação de entregas.
4.  **Backend (Supabase)**:
    - **Database**: PostgreSQL com suporte a RLS.
    - **Auth**: Gerenciamento de usuários e roles.
    - **Storage**: Armazenamento de imagens de produtos e logos de lojas.
    - **Realtime**: WebSocket para atualizações de pedidos sem refresh.

### Estratégia Multi-Tenant
- Isolamento de dados garantido por `tenant_id` em todas as tabelas críticas.
- Políticas de RLS que impedem uma loja de acessar dados de outra.
- Roteamento dinâmico baseado no subdomínio ou contexto da URL.

---

## 🛠️ 3. Stack de Tecnologias

### Core
- **Linguagem**: TypeScript (Tipagem forte em todo o projeto).
- **Frontend**: React + Vite (Rápido desenvolvimento e build).
- **Estilização**: Tailwind CSS (UI moderna e responsiva).

### Backend & Infra
- **BaaS**: Supabase (Auth, Database, Realtime, Storage).
- **Validação**: Zod (Garantia de integridade de dados no frontend e backend).
- **API de CEP**: ViaCEP (Preenchimento automático de endereço).

### Ferramentas de Desenvolvimento
- **Linter**: ESLint (Padronização de código).
- **Testes**: Playwright (Testes E2E para fluxos críticos de pedido).
- **Logger**: Sistema customizado de logging (produção vs desenvolvimento).

---

## 🚀 4. Plano de Implementação (Milestones)

### Milestone 1: Fundação & Multi-tenancy (Concluído ✅)
- Estrutura de banco de dados multi-tenant.
- Sistema de autenticação e perfis.
- Cadastro de lojas com upload de logo.

### Milestone 2: Core Experience (Concluído ✅)
- Vitrine de lojas e cardápio dinâmico.
- Fluxo de carrinho e checkout completo.
- Integração com ViaCEP para endereços.

### Milestone 3: Operação em Tempo Real (Concluído ✅)
- Painel de pedidos com Realtime.
- Sistema de troca de status (Pendente -> Preparando -> Pronto -> Entregue).
- Notificações visuais e sonoras no painel.

### Milestone 4: Gestão de Entregas (Concluído ✅)
- Cadastro de entregadores por admins (API `dev:api`).
- Interface para entregadores aceitarem pedidos.
- Geolocalização básica para rastreio em tempo real integrada.

### Milestone 5: Refinamento & Escala (Em Andamento 🔄)
- Sistema de cupons e fidelidade (Cupons ✅, Fidelidade 🔄).
- Integração com gateways de pagamento (Mercado Pago ✅).
- Preparação para Emissão de Nota Fiscal (NFC-e/NF-e ✅).
- Dashboard de analytics avançado para lojistas.
- Testes automatizados de cobertura total.

---

## 📏 5. Melhores Práticas & Qualidade

### Desenvolvimento
- **Clean Code**: Funções pequenas, nomes descritivos e responsabilidade única.
- **Componentização**: UI baseada em componentes reutilizáveis e atômicos.
- **Type Safety**: Uso rigoroso de tipos para evitar erros em tempo de execução.

### Testes
- **E2E**: Playwright para testar o fluxo completo "Cliente faz pedido -> Loja recebe -> Entregador entrega".
- **Unitários**: Testes de lógica de negócio e hooks críticos.

### Documentação
- Documentação técnica via arquivos `.md` no repositório.
- Documentação de API via esquemas do Supabase.

---

## ✅ 6. Critérios de Aceitação

Para que uma funcionalidade seja considerada "Pronta para Produção":
1.  **Funcionalidade**: Atende a todos os requisitos do RF correspondente.
2.  **Responsividade**: Funciona perfeitamente em telas de 360px a 1920px.
3.  **Performance**: Score no Lighthouse > 80 em Mobile.
4.  **Segurança**: Políticas de RLS validadas para o `tenant_id`.
5.  **Qualidade**: Passa em todos os testes de lint e testes E2E.
6.  **Documentação**: README atualizado e comentários em códigos complexos.
