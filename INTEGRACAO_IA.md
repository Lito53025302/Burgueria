# 🔧 INTEGRAÇÃO - Como Adicionar Botão "Melhorar com IA"

## 📍 Onde Integrar

Você precisa adicionar o botão de "Melhorar com IA" nas telas onde o usuário faz upload de imagem de produto.

### Arquivos a Modificar:

1. **Painel Burguer** - Adicionar/Editar Produto
   - Arquivo: `Painel Burguer/src/components/Products/ProductForm.tsx` (ou similar)
   - Ou: `Painel Burguer/src/components/Menu/MenuItemForm.tsx`

## 📝 Exemplo de Código

### 1. Importar o Componente

```typescript
import { ImageEnhancer } from '../ImageEnhancer';
import { Sparkles } from 'lucide-react';
```

### 2. Adicionar Estado

```typescript
const [showEnhancer, setShowEnhancer] = useState(false);
const [productImage, setProductImage] = useState<File | null>(null);
```

### 3. Adicionar Botão ao Upload de Imagem

```tsx
{/* Upload de Imagem Existente */}
<div className="space-y-2">
  <label>Imagem do Produto</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        setProductImage(file);
      }
    }}
  />

  {/* NOVO: Botão Melhorar com IA */}
  {productImage && (
    <button
      type="button"
      onClick={() => setShowEnhancer(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
    >
      <Sparkles className="h-4 w-4" />
      ✨ Melhorar com IA
    </button>
  )}
</div>
```

### 4. Adicionar Modal

```tsx
{/* Modal de Melhoramento */}
{showEnhancer && productImage && (
  <ImageEnhancer
    originalImage={productImage}
    onImageEnhanced={(enhancedImage) => {
      setProductImage(enhancedImage);
      // Atualizar preview também
    }}
    onClose={() => setShowEnhancer(false)}
  />
)}
```

## 🎯 Exemplo Completo

```typescript
import { useState } from 'react';
import { Sparkles, Upload } from 'lucide-react';
import { ImageEnhancer } from '../ImageEnhancer';

export function ProductForm() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageEnhanced = (enhancedImage: File) => {
    setProductImage(enhancedImage);
    setImagePreview(URL.createObjectURL(enhancedImage));
  };

  return (
    <div className="space-y-6">
      {/* ... outros campos ... */}

      {/* Upload de Imagem */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagem do Produto
        </label>

        {/* Preview */}
        {imagePreview && (
          <div className="mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
            />
          </div>
        )}

        {/* Upload Input */}
        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium">
            <Upload className="h-4 w-4 inline mr-2" />
            {productImage ? 'Trocar Imagem' : 'Escolher Imagem'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Botão Melhorar com IA */}
          {productImage && (
            <button
              type="button"
              onClick={() => setShowEnhancer(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              IA
            </button>
          )}
        </div>
      </div>

      {/* ... resto do formulário ... */}

      {/* Modal de IA */}
      {showEnhancer && productImage && (
        <ImageEnhancer
          originalImage={productImage}
          onImageEnhanced={handleImageEnhanced}
          onClose={() => setShowEnhancer(false)}
        />
      )}
    </div>
  );
}
```

## ✅ Checklist de Integração

- [ ] Importar `ImageEnhancer` e `Sparkles`
- [ ] Adicionar estados `showEnhancer` e `productImage`
- [ ] Adicionar botão "Melhorar com IA" após upload
- [ ] Adicionar modal `<ImageEnhancer />` no JSX
- [ ] Testar upload → melhorar → usar
- [ ] (Opcional) Adicionar loading state
- [ ] (Opcional) Mostrar toast de sucesso

## 🎨 Variações de Design

### Versão Compacta (Só Ícone):
```tsx
<button
  onClick={() => setShowEnhancer(true)}
  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
  title="Melhorar com IA"
>
  <Sparkles className="h-5 w-5" />
</button>
```

### Versão Com Badge:
```tsx
<button className="relative ...">
  <Sparkles className="h-4 w-4 mr-2" />
  Melhorar com IA
  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 rounded-full">
    Novo
  </span>
</button>
```

---

**Pronto! 🎉 A funcionalidade está implementada.**

Agora é só integrar nos formulários de produto!
