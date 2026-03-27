# 🎨 Sistema de Melhoria de Imagens com IA

Sistema completo de upload e melhoria automática de fotos de produtos usando Inteligência Artificial.

---

## ✨ **FUNCIONALIDADES**

### **1. Upscaling Automático** 🔍
- Aumenta resolução da imagem em 2x ou 4x
- Melhora qualidade sem perder detalhes
- Ideal para fotos tiradas com celular

### **2. Auto Enhancement** 🌟
- Ajusta automaticamente:
  - Brilho e contraste
  - Saturação de cores
  - Nitidez
  - Balanço de branco

### **3. Remoção de Fundo** 🎭
- Remove fundo automaticamente
- Adiciona fundo profissional
- Centraliza o produto

### **4. Sistema de Créditos** 💳
- **Plano FREE**: 0 créditos/mês
- **Plano BÁSICO**: 50 créditos/mês
- **Plano PRO**: Ilimitado

---

## 🚀 **INSTALAÇÃO**

### **1. Executar Migration**

```sql
-- Copie e execute no Supabase SQL Editor:
migrations/add_ai_image_enhancement.sql
```

### **2. Configurar Cloudinary**

1. **Criar conta gratuita:**
   - Acesse: https://cloudinary.com/users/register/free
   - Preencha os dados e confirme email

2. **Copiar credenciais:**
   - Dashboard > Settings > Account
   - Copie: Cloud Name, API Key, API Secret

3. **Configurar .env:**
   ```bash
   # Copie o arquivo de exemplo
   cp .env.cloudinary.example .env.local
   
   # Edite e adicione suas credenciais
   VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
   VITE_CLOUDINARY_API_KEY=sua_api_key
   VITE_CLOUDINARY_API_SECRET=seu_api_secret
   ```

4. **Criar Upload Preset:**
   - Dashboard > Settings > Upload
   - Add upload preset
   - Nome: `ml_default`
   - Signing Mode: `Unsigned`
   - Folder: `products`
   - Save

5. **Habilitar AI Features:**
   - Settings > AI & Automation
   - Enable: ✅ Auto Enhancement
   - Enable: ✅ Upscaling
   - Enable: ✅ Background Removal

---

## 📦 **COMO USAR**

### **No Painel Administrativo:**

```typescript
import AIImageUpload from '../components/AIImageUpload';

function ProductForm() {
    const handleImageSelected = (file: File, enhancedUrl?: string) => {
        console.log('Arquivo original:', file);
        console.log('URL melhorada:', enhancedUrl);
        
        // Usar a URL melhorada se disponível
        const finalUrl = enhancedUrl || URL.createObjectURL(file);
        // Salvar no produto...
    };

    return (
        <AIImageUpload
            onImageSelected={handleImageSelected}
            maxSizeMB={5}
            showAIEnhancement={true}
            tenantId={tenant.id}
        />
    );
}
```

---

## 🎯 **FLUXO DE USO**

```
1. Usuário faz upload da foto
   ↓
2. Preview da imagem original
   ↓
3. Clica em "Melhorar com IA"
   ↓
4. Sistema envia para Cloudinary
   ↓
5. Cloudinary processa com IA:
   - Upscaling 2x
   - Auto enhancement
   - Otimização de formato
   ↓
6. Retorna URL da imagem melhorada
   ↓
7. Mostra preview lado a lado
   ↓
8. Usuário escolhe: Original ou Melhorada
   ↓
9. Salva no produto
```

---

## 💰 **CUSTOS**

### **Cloudinary (Plano Gratuito):**
- ✅ **25 GB** de armazenamento
- ✅ **25 GB** de bandwidth/mês
- ✅ **25.000** transformações/mês
- ✅ **Ilimitado** para desenvolvimento

### **Estimativa de Uso:**
- Foto média: **500 KB**
- Upscaling: **1 transformação**
- **50 lojas** × **20 produtos** × **3 fotos** = **3.000 fotos/mês**
- **Custo:** **R$ 0,00** (dentro do plano grátis)

### **Quando pagar:**
- Após **25.000 transformações/mês**
- Plano pago: **$89/mês** (ilimitado)

---

## 🔧 **CONFIGURAÇÃO AVANÇADA**

### **Personalizar Transformações:**

```typescript
// Em aiImageService.ts

// Upscaling 4x (mais qualidade, mais lento)
transformations.push('e_upscale:4');

// Adicionar marca d'água
transformations.push('l_watermark,o_50');

// Converter para WebP (menor tamanho)
transformations.push('f_webp,q_auto:eco');

// Redimensionar para thumbnail
transformations.push('w_300,h_300,c_fill');
```

---

## 📊 **MONITORAMENTO**

### **Ver Uso de Créditos:**

```sql
-- Créditos usados por loja
SELECT 
    t.name,
    t.ai_images_used_this_month,
    sp.ai_image_credits_per_month,
    sp.display_name as plano
FROM tenants t
JOIN subscription_plans sp ON t.subscription_plan_id = sp.id
ORDER BY t.ai_images_used_this_month DESC;

-- Histórico de processamento
SELECT 
    t.name as loja,
    aie.enhancement_type,
    aie.status,
    aie.processing_time_ms,
    aie.created_at
FROM ai_image_enhancements aie
JOIN tenants t ON aie.tenant_id = t.id
ORDER BY aie.created_at DESC
LIMIT 50;
```

---

## 🎨 **EXEMPLOS DE RESULTADO**

### **Antes (Original):**
- Resolução: 800x600
- Tamanho: 450 KB
- Qualidade: Média
- Iluminação: Ruim

### **Depois (IA):**
- Resolução: 1600x1200 (2x)
- Tamanho: 380 KB (otimizado)
- Qualidade: Alta
- Iluminação: Ajustada automaticamente
- Cores: Mais vibrantes
- Nitidez: Melhorada

---

## 🚨 **TROUBLESHOOTING**

### **Erro: "Cloudinary não configurado"**
- Verifique se as variáveis de ambiente estão corretas
- Reinicie o servidor de desenvolvimento

### **Erro: "Upload failed"**
- Verifique se o Upload Preset `ml_default` existe
- Confirme que está configurado como `Unsigned`

### **Imagem não melhora:**
- Verifique se AI Features estão habilitadas no Cloudinary
- Teste com uma imagem diferente
- Veja os logs do console

---

## 📚 **RECURSOS**

- [Documentação Cloudinary](https://cloudinary.com/documentation)
- [AI Transformations](https://cloudinary.com/documentation/transformation_reference#ai_based_transformations)
- [Upload Presets](https://cloudinary.com/documentation/upload_presets)

---

## 🎉 **PRÓXIMOS PASSOS**

1. ✅ Executar migration
2. ✅ Configurar Cloudinary
3. ✅ Testar upload com IA
4. 🔜 Integrar no formulário de produtos
5. 🔜 Adicionar analytics de uso
6. 🔜 Implementar background removal
7. 🔜 Adicionar IA generativa (DALL-E)

---

**Desenvolvido com ❤️ e IA** 🤖✨
