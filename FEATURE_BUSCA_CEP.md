# 🔍 Feature: Busca Automática de Endereço por CEP

## 📋 Descrição

Implementada funcionalidade de busca automática de endereço através do CEP no formulário de cadastro de loja. Quando o usuário digita o CEP, o sistema busca automaticamente os dados do endereço na API ViaCEP e preenche os campos.

---

## ✨ Funcionalidades

### 1. Busca Automática
- Digite o CEP (8 dígitos)
- Sistema busca automaticamente na API ViaCEP
- Campos preenchidos automaticamente:
  - Endereço (logradouro)
  - Cidade
  - Estado

### 2. Formatação Automática
- CEP é formatado enquanto digita: `12345-678`
- Aceita apenas números
- Máximo de 8 dígitos

### 3. Feedback Visual
- Loading spinner enquanto busca
- Mensagem de erro se CEP não encontrado
- Dica de uso abaixo do campo

### 4. Validação
- CEP obrigatório
- Deve ter 8 dígitos
- Validação de formato

---

## 🎯 Ordem dos Campos (Reorganizada)

**Antes:**
1. Endereço Completo
2. Cidade
3. Estado
4. CEP

**Depois:**
1. ✅ CEP (primeiro - busca automática)
2. Endereço Completo (preenchido automaticamente + edição manual)
3. Cidade (preenchida automaticamente)
4. Estado (preenchido automaticamente)

---

## 🔧 Implementação Técnica

### Arquivos Criados

#### `src/hooks/useCepLookup.ts`
Hook customizado para buscar CEP:

```typescript
export function useCepLookup() {
  const searchCep = async (cep: string): Promise<CepData | null> => {
    // Busca na API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    return data;
  };

  const formatCep = (value: string): string => {
    // Formata: 12345-678
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return { searchCep, formatCep, loading, error };
}
```

### Arquivos Modificados

#### `src/components/StoreSignup.tsx`
- Adicionado hook `useCepLookup`
- Criada função `handleCepChange` para formatar e buscar
- Criada função `handleCepSearch` para preencher campos
- Reorganizada ordem dos campos no formulário
- Adicionado loading spinner no campo CEP
- Adicionada validação de CEP obrigatório

---

## 🚀 Como Usar

### Para Usuários

1. Acesse a tela de cadastro de loja
2. Vá para a etapa "Localização"
3. Digite o CEP no primeiro campo
4. Aguarde a busca automática (1-2 segundos)
5. Campos serão preenchidos automaticamente
6. Adicione o número e complemento no campo "Endereço Completo"
7. Clique em "Próximo"

### Exemplo

```
CEP: 05549-300
↓ (busca automática)
Endereço: Rua Gervásio Gonçalves
Cidade: São Paulo
Estado: SP

Usuário adiciona: "60" no campo Endereço
Resultado final: "Rua Gervásio Gonçalves 60"
```

---

## 🎨 Interface

### Campo CEP
```
┌─────────────────────────────────────┐
│ CEP *                               │
│ ┌─────────────────────────────────┐ │
│ │ 05549-300                    ⟳  │ │ ← Loading spinner
│ └─────────────────────────────────┘ │
│ Digite o CEP para preencher         │
│ automaticamente o endereço          │
└─────────────────────────────────────┘
```

### Estados do Campo

**Normal:**
```
┌─────────────────────┐
│ 00000-000           │
└─────────────────────┘
```

**Buscando:**
```
┌─────────────────────┐
│ 05549-300        ⟳  │ ← Spinner animado
└─────────────────────┘
```

**Erro:**
```
┌─────────────────────┐
│ 99999-999           │
└─────────────────────┘
❌ CEP não encontrado
```

**Sucesso:**
```
┌─────────────────────┐
│ 05549-300        ✓  │
└─────────────────────┘
✓ Endereço preenchido automaticamente
```

---

## 📊 API Utilizada

### ViaCEP
- **URL:** https://viacep.com.br/
- **Endpoint:** `https://viacep.com.br/ws/{cep}/json/`
- **Gratuita:** Sim
- **Limite:** Sem limite oficial
- **Documentação:** https://viacep.com.br/

### Exemplo de Resposta

```json
{
  "cep": "05549-300",
  "logradouro": "Rua Gervásio Gonçalves",
  "complemento": "",
  "bairro": "Jardim Bonfiglioli",
  "localidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308",
  "gia": "1004",
  "ddd": "11",
  "siafi": "7107"
}
```

---

## ✅ Validações Implementadas

### CEP
- ✅ Obrigatório
- ✅ Deve ter 8 dígitos
- ✅ Formato: 00000-000
- ✅ Apenas números

### Cidade
- ✅ Obrigatória
- ✅ Preenchida automaticamente pelo CEP
- ✅ Pode ser editada manualmente

### Estado
- ✅ Obrigatório
- ✅ Preenchido automaticamente pelo CEP
- ✅ Máximo 2 caracteres
- ✅ Convertido para maiúsculas
- ✅ Pode ser editado manualmente

### Endereço
- ✅ Opcional (mas recomendado)
- ✅ Preenchido automaticamente com logradouro
- ✅ Usuário adiciona número e complemento

---

## 🧪 Testes

### Teste 1: CEP Válido
1. Digite: `05549300`
2. Resultado esperado:
   - CEP formatado: `05549-300`
   - Endereço: `Rua Gervásio Gonçalves`
   - Cidade: `São Paulo`
   - Estado: `SP`

### Teste 2: CEP Inválido
1. Digite: `99999999`
2. Resultado esperado:
   - Mensagem de erro: "CEP não encontrado"
   - Campos não preenchidos

### Teste 3: CEP Incompleto
1. Digite: `05549`
2. Resultado esperado:
   - Não busca automaticamente
   - Aguarda completar 8 dígitos

### Teste 4: Formatação
1. Digite: `05549300` (sem hífen)
2. Resultado esperado:
   - Formatado automaticamente: `05549-300`

### Teste 5: Edição Manual
1. Busque CEP válido
2. Edite manualmente cidade ou estado
3. Resultado esperado:
   - Alterações mantidas
   - Não sobrescreve ao buscar novamente

---

## 🐛 Tratamento de Erros

### CEP Não Encontrado
```typescript
if (data.erro) {
  setError('CEP não encontrado');
  return null;
}
```

### Erro de Rede
```typescript
catch (err) {
  setError('Erro ao buscar CEP');
  logger.error('Erro ao buscar CEP', err);
}
```

### CEP Incompleto
```typescript
if (cleanCep.length !== 8) {
  setError('CEP deve ter 8 dígitos');
  return null;
}
```

---

## 📈 Melhorias Futuras

### Curto Prazo
- [ ] Adicionar debounce na busca (aguardar 500ms após parar de digitar)
- [ ] Cache de CEPs já buscados
- [ ] Botão manual "Buscar CEP" ao lado do campo

### Médio Prazo
- [ ] Sugestão de CEPs próximos se não encontrado
- [ ] Validação de CEP por estado
- [ ] Integração com Google Maps para validar endereço

### Longo Prazo
- [ ] Autocomplete de endereços
- [ ] Geolocalização automática
- [ ] Mapa interativo para selecionar localização

---

## 🎓 Boas Práticas Implementadas

### 1. Separação de Responsabilidades
- Hook customizado (`useCepLookup`) separado do componente
- Lógica de formatação isolada
- Lógica de busca isolada

### 2. Feedback ao Usuário
- Loading spinner durante busca
- Mensagens de erro claras
- Dicas de uso

### 3. Performance
- Busca apenas quando CEP completo (8 dígitos)
- Formatação em tempo real
- Sem requisições desnecessárias

### 4. Acessibilidade
- Labels descritivos
- Placeholders informativos
- Mensagens de erro visíveis

### 5. Logging
- Logs de sucesso
- Logs de erro
- Medição de performance

---

## 📝 Exemplo de Código

### Uso do Hook

```typescript
import { useCepLookup } from '@/hooks/useCepLookup';

function MyComponent() {
  const { searchCep, formatCep, loading, error } = useCepLookup();

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);

    if (value.replace(/\D/g, '').length === 8) {
      const data = await searchCep(value);
      if (data) {
        setAddress(data.logradouro);
        setCity(data.localidade);
        setState(data.uf);
      }
    }
  };

  return (
    <input
      value={cep}
      onChange={(e) => handleCepChange(e.target.value)}
      placeholder="00000-000"
    />
  );
}
```

---

## 🎉 Conclusão

A funcionalidade de busca automática de CEP melhora significativamente a experiência do usuário ao:

- ✅ Reduzir tempo de preenchimento
- ✅ Evitar erros de digitação
- ✅ Padronizar formato de endereços
- ✅ Facilitar cadastro de lojas

**Status:** ✅ Implementado e testado
**Data:** 04/03/2026
