# 🏪 Sistema de Cadastro de Novas Lojas

## ✅ Implementado com Sucesso!

Foi criado um sistema completo de onboarding para novas lojas no marketplace multi-tenant.

---

## 📋 O que foi implementado

### 1. **Página de Cadastro** (`/cadastro`)
- ✨ **Wizard Multi-Step** com 4 etapas:
  1. **Informações Básicas** - Nome da loja, subdomain, dados do proprietário
  2. **Localização** - Endereço completo da loja
  3. **Personalização Visual** - Logo, cores primária e secundária
  4. **Configurações de Negócio** - Horário de funcionamento, taxa de entrega, pedido mínimo

### 2. **Funcionalidades Premium**
- ✅ **Validação em tempo real** do subdomain
- ✅ **Auto-geração** de subdomain baseado no nome da loja
- ✅ **Upload de logo** com preview
- ✅ **Seletor de cores** interativo com preview ao vivo
- ✅ **Validação de formulário** em cada etapa
- ✅ **Indicador de progresso** visual com ícones
- ✅ **Trial gratuito** de 14 dias automaticamente
- ✅ **Responsivo** - funciona em mobile e desktop

### 3. **Integração Completa**
- ✅ Cria tenant no banco de dados
- ✅ Cria usuário admin no Supabase Auth
- ✅ Cria profile vinculado ao tenant
- ✅ Upload de logo no storage (bucket `tenant-assets`)
- ✅ Trigger SQL para sincronizar `tenant_id` no JWT
- ✅ Redirecionamento automático após cadastro

### 4. **UX/UI**
- 🎨 Design moderno com gradientes
- 🌈 Animações suaves
- 📱 Totalmente responsivo
- ✨ Feedback visual em tempo real
- 🎯 Estados de loading e erro bem tratados

---

## 🚀 Como Usar

### **Para Usuários (Donos de Lojas)**

1. Acesse o marketplace em: `http://localhost:5173`
2. Clique no botão **"Cadastrar Minha Loja"** no header
3. Preencha as 4 etapas do formulário:
   - **Passo 1**: Informações básicas e dados do proprietário
   - **Passo 2**: Endereço da loja
   - **Passo 3**: Personalização visual (logo e cores)
   - **Passo 4**: Configurações de negócio
4. Clique em **"Criar Loja"**
5. Aguarde a criação (leva alguns segundos)
6. Você será automaticamente redirecionado para sua loja!

### **Para Acessar a Loja Criada**

Após o cadastro, sua loja estará disponível em:
```
http://localhost:5173/seu-subdomain
```

Por exemplo, se você escolheu o subdomain `pizzaria-joao`, sua loja estará em:
```
http://localhost:5173/pizzaria-joao
```

---

## 🗄️ Estrutura de Dados

### Tabela `tenants`
```sql
- id (uuid, PK)
- name (text) - Nome da loja
- subdomain (text, UNIQUE) - URL da loja
- slug (text, UNIQUE)
- owner_name (text)
- owner_email (text)
- owner_phone (text)
- address, city, state, zip_code
- primary_color, secondary_color
- logo_url
- opening_time, closing_time
- delivery_fee, minimum_order
- subscription_plan (default: 'trial')
- subscription_expires_at (14 dias a partir do cadastro)
- created_at, updated_at
```

### Tabela `profiles`
```sql
- id (uuid, FK auth.users)
- full_name
- phone
- role ('admin' para donos de loja)
- tenant_id (FK tenants.id)
```

### Storage
Logo é salvo em:
```
tenant-assets/{subdomain}/{logo-filename}
```

---

## 🔐 Autenticação e Segurança

### Fluxo de Cadastro
1. Usuário preenche formulário
2. Sistema cria usuário no **Supabase Auth**
3. Sistema cria tenant na tabela `tenants`
4. Sistema cria profile com `tenant_id` vinculado
5. **Trigger SQL** adiciona `tenant_id` no `app_metadata` do usuário
6. RLS garante isolamento entre tenants

### Row Level Security (RLS)
Todas as queries automáticas filtram por `tenant_id`:
```sql
WHERE tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
```

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- ✅ `src/components/StoreSignup.tsx` - Componente de cadastro completo
- ✅ `migrations/008_auto_tenant_metadata.sql` - Trigger para sync de tenant_id

### Arquivos Modificados
- ✅ `src/App.tsx` - Adicionada rota `/cadastro`
- ✅ `src/components/StoreMarketplace.tsx` - Botão de cadastro no header

---

## 🔧 Próximos Passos (Opcional)

### Melhorias Futuras
1. **Email de Boas-Vindas** - Enviar email ao dono da loja após cadastro
2. **Validação de Email** - Confirmar email antes de ativar loja
3. **Setup Wizard Pós-Cadastro** - Guiar novo usuário a adicionar produtos
4. **Dashboard de Admin** - Painel super admin para aprovar lojas
5. **Integração de Pagamento** - Stripe/Asaas para assinaturas
6. **Templates de Loja** - Layouts pré-definidos para escolher
7. **Importação de Produtos** - Upload via CSV/Excel

---

## 🐛 Troubleshooting

### Subdomain já existe
- Escolha outro nome ou tente variações
- O sistema valida em tempo real

### Erro ao fazer upload do logo
- Verifique se o arquivo tem menos de 2MB
- Formatos suportados: JPG, PNG, WEBP

### Loja não aparece no marketplace
- Verifique se `is_active = true` no banco
- Aguarde alguns segundos e atualize a página

### Erro "tenant não encontrado" após cadastro
- Execute a migration `008_auto_tenant_metadata.sql`
- Verifique se o trigger está ativo no Supabase

---

## 📞 Suporte

Para dúvidas ou problemas, entre em contato:
- Email: suporte@foodhub.com
- WhatsApp: (11) 98765-4321

---

**Desenvolvido com ❤️ por Paulo - Janeiro 2026**
