# 🎯 Catálogo de Complementos Reutilizáveis

## 📋 O que foi implementado

Agora você tem um **catálogo global de complementos** que pode ser reutilizado em todos os itens do menu!

### ✨ Funcionalidades:

1. **Seleção Visual**: Clique nos complementos para adicionar/remover
2. **Catálogo Reutilizável**: Complementos salvos ficam disponíveis para todos os itens
3. **Agrupamento por Categoria**: Molhos, Ingredientes, Bebidas, etc.
4. **Adicionar Novos**: Crie novos complementos que vão direto pro catálogo
5. **Preview de Selecionados**: Veja todos os complementos selecionados em tempo real

---

## 🚀 Como Usar

### 1️⃣ **Configurar o Banco de Dados (PRIMEIRA VEZ)**

Execute o SQL no Supabase SQL Editor:

```sql
-- Este arquivo está em: create_customizations_catalog.sql
```

✅ Isso vai:
- Criar a tabela `available_customizations`
- Inserir os complementos padrão (Catchup, Mostarda, etc.)

### 2️⃣ **Adicionar/Editar Item no Painel Admin**

1. Clique em "Adicionar Item" ou edite um item existente
2. Role até a seção **"Complementos Disponíveis"**
3. **Clique nos complementos** que deseja adicionar (eles ficam verdes ✅)
4. Clique novamente para remover

### 3️⃣ **Criar Novo Complemento**

1. Clique no botão **"+ Criar Novo"**
2. Preencha:
   - Nome (ex: "Queijo Cheddar")
   - Preço (ex: 4.50)
   - Categoria (Molhos, Ingredientes, etc.)
3. Clique em **"Salvar no Catálogo"**
4. O complemento fica disponível **para sempre!**

---

## 📊 Estrutura do Banco

### Tabela: `available_customizations`

| Coluna      | Tipo     | Descrição                          |
|-------------|----------|------------------------------------|
| id          | uuid     | ID único                           |
| name        | text     | Nome do complemento (único)        |
| price       | numeric  | Preço (ex: 0.50, 4.00)             |
| category    | text     | Categoria (Molhos, Ingredientes)   |
| created_at  | timestamp| Data de criação                    |

### Complementos Pré-cadastrados:

**Molhos:**
- Catchup - R$ 0,50
- Mostarda - R$ 0,50
- Maionese temperada - R$ 3,00
- Barbecue - R$ 4,00
- MAIONESE DEFUMADA - R$ 5,00
- MAIONESE DEFUMADA BRANCA - R$ 5,00
- maionese sache - R$ 0,50
- BACONESE - R$ 5,00

**Ingredientes:**
- Bacon Extra - R$ 5,00
- Queijo Extra - R$ 4,00
- Ovo - R$ 2,00
- Cebola Caramelizada - R$ 3,00

---

## 🎨 Interface Visual

### Antes (Manual):
```
Nome: [ Catchup_____________ ]  Preço: [ 0.50 ]  [X]
Nome: [ Mostarda____________ ]  Preço: [ 0.50 ]  [X]
```

### Agora (Seleção Visual):
```
✅ Catchup            +R$ 0,50
✅ Mostarda           +R$ 0,50
☐  Maionese temperada +R$ 3,00
☐  Barbecue           +R$ 4,00
```

---

## 💡 Dicas

1. **Padronize os nomes**: Use sempre o mesmo nome (ex: "Catchup" não "Ketchup")
2. **Categorize bem**: Facilita encontrar os complementos
3. **Preços corretos**: Digite valores como `0.50` não `0,50`
4. **Evite duplicatas**: Antes de criar, veja se já existe

---

## 🔄 Migração dos Itens Antigos

Itens já cadastrados **mantêm seus complementos antigos**. Ao editar:
- Os complementos antigos **aparecem selecionados**
- Você pode adicionar/remover normalmente
- Ao salvar, os novos complementos são atualizados

---

## 🐛 Troubleshooting

### Erro ao criar complemento:
- ✅ Verifique se já existe um com o mesmo nome
- ✅ Confirme que o preço é um número válido

### Complementos não aparecem:
- ✅ Execute o SQL de criação da tabela
- ✅ Recarregue a página do painel admin

### Changes não salvam:
- ✅ Verifique a conexão com internet
- ✅ Veja o console do browser (F12) para erros

---

## 📝 Arquivos Criados/Modificados

### Novos Arquivos:
- `create_customizations_catalog.sql` - Script de criação da tabela
- `Painel Burguer/src/components/MenuItems/CustomizationSelector.tsx` - Componente de seleção

### Modificados:
- `Painel Burguer/src/components/MenuItems/MenuItemForm.tsx` - Integração do novo componente

---

**Criado em:** 05/01/2026  
**Versão:** 1.0
