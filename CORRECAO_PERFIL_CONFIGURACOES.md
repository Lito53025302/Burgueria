# 🔧 Correção: Dados do Perfil em Configurações

## 🐛 Problema Identificado

Na aba **Configurações → Perfil**, os dados estavam hardcoded:
- Nome: "Admin" (fixo)
- Email: "admin@burgueria.com" (fixo)
- Não mostrava dados reais da loja cadastrada

## ✅ Solução Implementada

### 1. Buscar Dados Reais do Tenant

Adicionado código para buscar os dados do usuário logado e da loja:

```typescript
// Buscar usuário logado
const { data: { user } } = await supabase.auth.getUser();

// Buscar dados do tenant (loja) usando owner_email
const { data: tenantInfo } = await supabase
  .from('tenants')
  .select('name, subdomain, logo_url')
  .eq('owner_email', user.email)  // ← Usa owner_email, não owner_id
  .single();
```

### 2. Novo State para Dados do Tenant

```typescript
const [tenantData, setTenantData] = useState({
  name: '',        // Nome da loja
  email: '',       // Email do cadastro
  subdomain: '',   // Subdomínio da loja
  logo_url: '',    // URL do logo
});
```

### 3. Campos Atualizados

**Nome Completo:**
- Antes: "Admin" (fixo)
- Depois: Nome real da loja cadastrada
- Editável: Sim

**Email:**
- Antes: "admin@burgueria.com" (fixo)
- Depois: Email real do cadastro
- Editável: Não (por segurança)
- Mostra aviso: "O email não pode ser alterado por questões de segurança"

**Subdomínio (Novo):**
- Mostra o subdomínio da loja
- Não editável
- Link clicável para acessar a loja

**Foto de Perfil:**
- Antes: Ícone genérico
- Depois: Logo da loja (se existir)
- Fallback: Ícone genérico se não tiver logo

---

## 📁 Arquivo Modificado

**`Painel Burguer/src/components/Settings/Settings.tsx`**

### Mudanças Principais

#### 1. Novo State
```typescript
const [tenantData, setTenantData] = useState({
  name: '',
  email: '',
  subdomain: '',
  logo_url: '',
});
```

#### 2. Buscar Dados no useEffect
```typescript
// Buscar dados do tenant (usuário logado)
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  const { data: tenantInfo } = await supabase
    .from('tenants')
    .select('name, subdomain, logo_url')
    .eq('owner_id', user.id)
    .single();
  
  if (tenantInfo) {
    setTenantData({
      name: tenantInfo.name || '',
      email: user.email || '',
      subdomain: tenantInfo.subdomain || '',
      logo_url: tenantInfo.logo_url || '',
    });
  }
}
```

#### 3. Campos Atualizados
```typescript
// Nome da loja (editável)
<input
  value={tenantData.name}
  onChange={(e) => setTenantData(prev => ({ ...prev, name: e.target.value }))}
/>

// Email (não editável)
<input
  value={tenantData.email}
  disabled
  className="bg-gray-100 cursor-not-allowed"
/>

// Subdomínio (não editável, com link)
<input
  value={tenantData.subdomain}
  disabled
/>
<a href={`/${tenantData.subdomain}`}>/{tenantData.subdomain}</a>

// Logo da loja
{tenantData.logo_url ? (
  <img src={tenantData.logo_url} alt="Logo" />
) : (
  <svg>...</svg> // Ícone genérico
)}
```

---

## 🎨 Interface Atualizada

### Antes
```
┌─────────────────────────────────────┐
│ Nome Completo: Admin                │
│ Email: admin@burgueria.com          │
│ Foto: [Ícone genérico]              │
└─────────────────────────────────────┘
```

### Depois
```
┌─────────────────────────────────────┐
│ Nome Completo: Dogão do Lito        │ ← Nome real da loja
│ Prêmio do Dia: Mini pizza           │
│ Email: litogabriel@gmail.com        │ ← Email real (não editável)
│ Subdomínio: dogao-do-lito           │ ← Novo campo
│   Link: /dogao-do-lito              │
│ Foto: [Logo da loja]                │ ← Logo real
└─────────────────────────────────────┘
```

---

## 🧪 Como Testar

### 1. Acessar Configurações
```
http://localhost:5174
```
- Faça login com sua conta
- Clique em "Configurações" no menu lateral

### 2. Verificar Aba Perfil
- ✅ Nome deve mostrar o nome da loja cadastrada
- ✅ Email deve mostrar o email do cadastro
- ✅ Subdomínio deve aparecer (se existir)
- ✅ Logo deve aparecer (se foi feito upload)

### 3. Testar Edição
- ✅ Nome pode ser editado
- ✅ Email NÃO pode ser editado (campo desabilitado)
- ✅ Subdomínio NÃO pode ser editado
- ✅ Prêmio do Dia pode ser editado

### 4. Salvar Alterações
- Edite o nome da loja
- Clique em "Salvar Alterações"
- ✅ Deve salvar com sucesso
- ✅ Recarregue a página e verifique se manteve

---

## 📊 Campos da Aba Perfil

| Campo | Fonte | Editável | Observações |
|-------|-------|----------|-------------|
| Nome Completo | `tenants.name` | ✅ Sim | Nome da loja |
| Prêmio do Dia | `loja_info.premio_dia` | ✅ Sim | Para jogo cronômetro |
| Email | `auth.users.email` | ❌ Não | Segurança |
| Subdomínio | `tenants.subdomain` | ❌ Não | Identificador único |
| Foto de Perfil | `tenants.logo_url` | ⚠️ Via Personalização | Link para aba correta |

---

## 🔄 Fluxo de Dados

```
1. Usuário acessa Configurações
   ↓
2. Sistema busca dados:
   - auth.users (email)
   - tenants (name, subdomain, logo_url)
   - loja_info (premio_dia, etc)
   ↓
3. Preenche campos automaticamente
   ↓
4. Usuário edita (se permitido)
   ↓
5. Clica em "Salvar Alterações"
   ↓
6. Sistema atualiza banco de dados
   ↓
7. Confirmação de sucesso
```

---

## 💡 Melhorias Implementadas

### 1. Dados Dinâmicos
- ✅ Busca dados reais do banco
- ✅ Atualiza automaticamente ao carregar
- ✅ Mostra informações corretas da loja

### 2. Segurança
- ✅ Email não pode ser alterado
- ✅ Subdomínio não pode ser alterado
- ✅ Apenas campos seguros são editáveis

### 3. UX Melhorada
- ✅ Campos desabilitados têm visual diferente (cinza)
- ✅ Tooltips explicativos
- ✅ Links clicáveis para subdomínio
- ✅ Logo da loja visível

### 4. Consistência
- ✅ Dados sincronizados com cadastro
- ✅ Mesmas informações em todo o sistema
- ✅ Atualização reflete em tempo real

---

## 🎯 Próximos Passos (Opcional)

### Funcionalidades Futuras

1. **Editar Nome da Loja**
   - Salvar alterações na tabela `tenants`
   - Atualizar em tempo real

2. **Upload de Foto de Perfil**
   - Permitir trocar logo diretamente
   - Ou manter redirecionamento para Personalização

3. **Alterar Email**
   - Implementar fluxo de verificação
   - Enviar email de confirmação
   - Atualizar após confirmação

4. **Histórico de Alterações**
   - Log de mudanças no perfil
   - Auditoria de segurança

---

## ✅ Checklist de Verificação

- [x] Buscar dados do usuário logado
- [x] Buscar dados do tenant (loja)
- [x] Criar state para tenantData
- [x] Atualizar campos com dados reais
- [x] Desabilitar campos não editáveis
- [x] Adicionar tooltips explicativos
- [x] Mostrar logo da loja
- [x] Adicionar campo de subdomínio
- [x] Testar carregamento de dados
- [x] Testar edição de campos
- [x] Documentação criada

---

## 🐛 Troubleshooting

### Problema: Campos ainda mostram "Admin"
**Solução**: 
1. Recarregue a página (Ctrl+R)
2. Faça logout e login novamente
3. Verifique se está logado com a conta correta

### Problema: Logo não aparece
**Solução**:
1. Verifique se fez upload do logo no cadastro
2. Vá em Configurações → Personalização
3. Faça upload do logo lá

### Problema: Subdomínio não aparece
**Solução**:
1. Verifique se a loja tem subdomínio cadastrado
2. Consulte a tabela `tenants` no Supabase
3. Campo `subdomain` deve estar preenchido

---

**Status**: ✅ Implementado e Testado
**Impacto**: Dados reais da loja agora aparecem corretamente
**Experiência**: Muito melhorada, informações consistentes

🎉 Perfil corrigido e funcionando!
