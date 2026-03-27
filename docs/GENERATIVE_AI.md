# 🎨 IA GENERATIVA - Fotos Profissionais Automáticas

Sistema completo de geração de fotos profissionais usando Inteligência Artificial Generativa (Stable Diffusion).

---

## ✨ **O QUE FAZ:**

### **Transforma isso:**
```
📸 Foto amadora de hambúrguer
- Fundo: Mesa de cozinha
- Iluminação: Ruim
- Qualidade: Baixa
```

### **Nisso:**
```
🎨 Foto profissional de restaurante
- Fundo: Tábua de madeira rústica
- Iluminação: Studio profissional
- Extras: Copo de cerveja, guardanapo
- Qualidade: 8K ultra detalhada
```

---

## 🚀 **INSTALAÇÃO:**

### **1. Executar Migration:**
```sql
-- Copie e execute no Supabase:
migrations/add_generative_ai.sql
```

### **2. Criar Conta no Replicate:**

1. **Acesse:** https://replicate.com/signin
2. **Crie conta** (pode usar GitHub)
3. **Vá em:** Account > API Tokens
4. **Crie um token**
5. **Copie o token**

### **3. Configurar .env:**
```bash
# Adicione no .env do Painel:
VITE_REPLICATE_API_TOKEN=r8_seu_token_aqui
```

### **4. Reiniciar servidor:**
```bash
npm run dev
```

---

## 🎯 **COMO USAR:**

### **No formulário de produtos:**

```typescript
import AIImageUploadPro from '../components/AIImageUploadPro';

function ProductForm() {
    const [product, setProduct] = useState({
        name: 'X-Bacon Artesanal',
        image: ''
    });

    const handleImageSelected = (file: File, enhancedUrl?: string, generatedUrl?: string) => {
        // Prioridade: Generada > Melhorada > Original
        const finalUrl = generatedUrl || enhancedUrl || URL.createObjectURL(file);
        
        setProduct(prev => ({ ...prev, image: finalUrl }));
    };

    return (
        <AIImageUploadPro
            onImageSelected={handleImageSelected}
            productName={product.name}
            showGenerativeAI={true}
            tenantId={tenant.id}
        />
    );
}
```

---

## 🎨 **ESTILOS DISPONÍVEIS:**

### **1. 🪵 Tábua de Madeira** (Padrão)
```
- Fundo: Tábua rústica de madeira
- Ambiente: Escuro/aconchegante
- Extras: Copo de cerveja
- Melhor para: Hambúrgueres, carnes
```

### **2. ⚪ Mármore Branco**
```
- Fundo: Superfície de mármore
- Ambiente: Minimalista/elegante
- Estilo: Clean e moderno
- Melhor para: Saladas, pratos leves
```

### **3. ⚫ Ardósia Preta**
```
- Fundo: Prato de ardósia
- Ambiente: Gourmet/sofisticado
- Iluminação: Dramática
- Melhor para: Pratos premium
```

### **4. 🍺 Mesa de Restaurante** (Premium)
```
- Fundo: Mesa completa
- Ambiente: Restaurante real
- Extras: Cerveja, batatas
- Melhor para: Combos, refeições
```

---

## 💰 **CUSTOS E LIMITES:**

### **Por Plano:**

| Plano | Fotos Generativas/Mês | Custo para Você | Você Cobra | Lucro |
|-------|----------------------|-----------------|------------|-------|
| FREE | 0 | R$ 0 | R$ 0 | - |
| BÁSICO | 10 | R$ 0,50 | R$ 49,90 | R$ 49,40 |
| PRO | 50 | R$ 2,50 | R$ 99,90 | R$ 97,40 |

### **Custo Real:**
- **Replicate:** $0.002/imagem (~R$ 0,01)
- **Tempo:** 10-20 segundos
- **Créditos grátis:** $5 (~2.500 imagens)

---

## 🔥 **FLUXO COMPLETO:**

```
1. Lojista faz upload de foto amadora
   ↓
2. Escolhe estilo de fundo (Tábua, Mármore, etc.)
   ↓
3. Clica em "Gerar Foto Profissional"
   ↓
4. Sistema detecta tipo de produto ("hambúrguer")
   ↓
5. Constrói prompt:
   "Professional food photography of gourmet burger 
    on rustic wooden board, dark background, 
    beer glass, studio lighting, 8K, photorealistic"
   ↓
6. Envia para Replicate (Stable Diffusion SDXL)
   ↓
7. IA CRIA foto nova do zero (10-20s)
   ↓
8. Retorna URL da imagem gerada
   ↓
9. Mostra preview lado a lado
   ↓
10. Lojista escolhe: Original ou Profissional
   ↓
11. Salva no produto
```

---

## 🎯 **DETECÇÃO AUTOMÁTICA:**

O sistema detecta automaticamente o tipo de produto:

| Nome do Produto | Detectado Como | Prompt Gerado |
|-----------------|----------------|---------------|
| X-Bacon | gourmet burger | Professional burger photo... |
| Pizza Margherita | artisan pizza | Professional pizza photo... |
| Batata Frita | french fries | Professional fries photo... |
| Milk Shake | milkshake | Professional milkshake photo... |

---

## 📊 **MONITORAMENTO:**

### **Ver uso de créditos:**

```sql
-- Créditos generativos por loja
SELECT 
    t.name,
    t.ai_generative_used_this_month,
    sp.ai_generative_images as limite,
    sp.display_name as plano
FROM tenants t
JOIN subscription_plans sp ON t.subscription_plan_id = sp.id
ORDER BY t.ai_generative_used_this_month DESC;

-- Histórico de fotos geradas
SELECT 
    t.name as loja,
    aie.background_style,
    aie.prompt_used,
    aie.processing_time_ms,
    aie.created_at
FROM ai_image_enhancements aie
JOIN tenants t ON aie.tenant_id = t.id
WHERE aie.enhancement_type = 'generative'
ORDER BY aie.created_at DESC;
```

---

## 🎨 **EXEMPLOS DE RESULTADO:**

### **Antes (Upload Original):**
```
📸 Foto tirada com celular
- Fundo: Mesa de cozinha
- Iluminação: Luz fluorescente
- Qualidade: 800x600
- Ambiente: Caseiro
```

### **Depois (IA Generativa):**
```
✨ Foto profissional de restaurante
- Fundo: Tábua de madeira rústica
- Iluminação: Studio profissional
- Qualidade: 2048x2048 (8K)
- Ambiente: Restaurante gourmet
- Extras: Copo de cerveja, guardanapo
- Cores: Vibrantes e apetitosas
```

---

## 🚨 **TROUBLESHOOTING:**

### **Erro: "Replicate não configurado"**
- Verifique se `VITE_REPLICATE_API_TOKEN` está no `.env`
- Reinicie o servidor (`npm run dev`)

### **Erro: "Timeout ao processar"**
- Normal em horários de pico
- Tente novamente em alguns minutos

### **Foto gerada não ficou boa:**
- Tente outro estilo de fundo
- Use uma foto original melhor
- Ajuste o nome do produto para melhor detecção

---

## 💡 **DICAS PARA MELHORES RESULTADOS:**

1. **Nome do produto claro:**
   - ✅ "X-Bacon Artesanal"
   - ❌ "Lanche 1"

2. **Foto original razoável:**
   - ✅ Produto visível e centralizado
   - ❌ Foto muito escura ou desfocada

3. **Escolha o estilo certo:**
   - Hambúrguer → Tábua de Madeira
   - Salada → Mármore Branco
   - Premium → Ardósia Preta

---

## 🎉 **DIFERENCIAL COMPETITIVO:**

**NENHUM concorrente oferece isso!**

- ❌ iFood: Sem IA
- ❌ Uber Eats: Sem IA
- ❌ Rappi: Sem IA
- ✅ **SEU SISTEMA:** IA Generativa! 🚀

---

## 📚 **RECURSOS:**

- [Replicate Docs](https://replicate.com/docs)
- [Stable Diffusion SDXL](https://replicate.com/stability-ai/sdxl)
- [Pricing](https://replicate.com/pricing)

---

## 🔜 **PRÓXIMOS PASSOS:**

1. ✅ Executar migration
2. ✅ Configurar Replicate
3. ✅ Testar geração
4. 🔜 Integrar no formulário de produtos
5. 🔜 Adicionar mais estilos
6. 🔜 Implementar batch processing
7. 🔜 Analytics de uso

---

**Desenvolvido com ❤️ e muita IA** 🤖✨🎨
