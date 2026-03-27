# 🎨 Melhoramento de Imagem com IA

## 📋 Sobre

Esta funcionalidade permite que lojas melhorem automaticamente a qualidade das fotos de seus produtos usando **Inteligência Artificial gratuita**.

## ✨ Funcionalidades

- ✅ **Melhorar Qualidade**: Aumenta a resolução, nitidez e cores da imagem
- ✅ **Remover Fundo**: Remove o fundo da imagem (deixa transparente)
- ✅ **Preview Antes/Depois**: Veja o resultado antes de aplicar
- ✅ **100% Gratuito** (com limits razoáveis)
- ✅ **Fallback Local**: Se a API falhar, usa melhoramento local no navegador

## 🚀 Como Usar

### 1. Configurar API Key (Opcional mas Recomendado)

A API funciona **sem API key**, mas com rate limits menores. Para melhor experiência:

1. Crie uma conta grátis em [Hugging Face](https://huggingface.co/join)
2. Vá em [Settings → Access Tokens](https://huggingface.co/settings/tokens)
3. Clique em **"New token"**
4. Dê um nome (ex: "Burgueria AI")
5. Escolha tipo **"Read"**
6. Copie o token

### 2. Adicionar ao .env

Edite o arquivo `.env` no **Painel Burguer** e adicione:

```env
VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Usar no Painel

1. Vá em **Cardápio** → Adicionar/Editar produto
2. Faça upload de uma foto
3. Clique no botão **"✨ Melhorar com IA"**
4. Escolha:
   - **Melhorar Qualidade** (upscaling + nitidez)
   - **Remover Fundo** (transparente)
5. Aguarde ~10-30 segundos
6. Veja o preview lado a lado
7. Clique em **"Usar Imagem Melhorada"**

## 🎯 Casos de Uso

### ✅ Quando usar "Melhorar Qualidade":
- Foto tirada com celular de qualidade baixa
- Imagem com pouca iluminação
- Foto tremida ou desfocada
- Precisa aumentar resolução

### ✅ Quando usar "Remover Fundo":
- Quer destaque limpo do produto
- Foto tem fundo bagunçado/feio
- Quer fundo transparente profissional
- Padronizar todas as fotos

## ⚙️ Tecnologia

- **API**: Hugging Face Inference API
- **Modelos**:
  - `Real-ESRGAN`: Upscaling 4x de imagens
  - `RMBG-1.4`: Remoção de fundo
- **Fallback**: Canvas API (melhoramento local)

## 📊 Limites Gratuitos

### Sem API Key:
- ~10-20 requisições por hora
- Pode ter fila de espera
- Primeira requisição ~30s (modelo acordando)

### Com API Key (Gratuita):
- ~1000 requisições por mês
- Prioridade média
- Velocidade melhor

## 🐛 Troubleshooting

### "Erro ao processar imagem"
- ✅ Verifique se a imagem é válida (JPG, PNG, WEBP)
- ✅ Tente novamente (pode ser timeout)
- ✅ O sistema usará fallback local automaticamente

### "Muito lento"
- Primeira requisição demora ~30s (modelo iniciando)
- Próximas são mais rápidas (~10s)
- Considere obter API key para prioridade

### "Rate limit excedido"
- Aguarde 1 hora
- Ou crie conta Hugging Face e use API key

## 💡 Dicas

1. **Tire foto bem iluminada** - A IA melhora, mas não faz milagres
2. **Use JPG para comida** - Melhor compressão
3. **Use PNG com fundo removido** - Fica profissional
4. **Teste antes/depois** - Nem sempre a IA melhora 100%
5. **Baixe o original** - Guarde backup antes de aplicar

## 🔮 Próximas Melhorias

- [ ] Adicionar mais modelos de IA
- [ ] Batch processing (múltiplas imagens)
- [ ] Ajuste manual de parâmetros
- [ ] Histórico de versões
- [ ] Integração com editor de imagem

---

**Desenvolvido com ❤️ usando IA gratuita!**
