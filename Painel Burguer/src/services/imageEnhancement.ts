// ============================================
// SERVIÇO DE MELHORAMENTO DE IMAGEM COM IA
// Usando Hugging Face Inference API (Gratuito)
// ============================================

const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY || '';

// Modelos disponíveis
const MODELS = {
    // Upscaling 4x - Excelente para fotos de comida
    REAL_ESRGAN: 'https://api-inference.huggingface.co/models/Bingsu/Real-ESRGAN',

    // Melhoramento geral de imagem
    SWIN_IR: 'https://api-inference.huggingface.co/models/caidas/swin2SR-classical-sr-x2-64',

    // Remover fundo (útil para produto)
    REMBG: 'https://api-inference.huggingface.co/models/briaai/RMBG-1.4'
};

interface EnhanceImageOptions {
    model?: keyof typeof MODELS;
    removeBackground?: boolean;
}

/**
 * Melhorar imagem usando IA
 */
export async function enhanceImage(
    imageFile: File,
    options: EnhanceImageOptions = {}
): Promise<Blob> {
    const { model = 'REAL_ESRGAN', removeBackground = false } = options;

    try {
        // Converter File para Blob
        const imageBlob = new Blob([imageFile], { type: imageFile.type });

        // Escolher modelo
        const modelUrl = removeBackground ? MODELS.REMBG : MODELS[model];

        // NOTA: A API do HuggingFace tem problemas de CORS quando chamada diretamente do navegador
        // Por isso, vamos usar o melhoramento local como padrão
        // Para usar a API, seria necessário criar um backend proxy
        
        console.warn('⚠️ API do HuggingFace não disponível (CORS). Usando melhoramento local.');
        
        // Usar melhoramento local diretamente
        const enhancedFile = await enhanceImageLocally(imageFile);
        return new Blob([enhancedFile], { type: enhancedFile.type });

    } catch (error) {
        console.error('Erro ao melhorar imagem:', error);
        throw error;
    }
}

/**
 * Remover fundo da imagem
 * NOTA: Funcionalidade desabilitada devido a limitações de CORS
 * Requer backend proxy para funcionar
 */
export async function removeBackground(imageFile: File): Promise<Blob> {
    console.warn('⚠️ Remoção de fundo requer backend proxy. Retornando imagem original.');
    // Por enquanto, retorna a imagem original
    return new Blob([imageFile], { type: imageFile.type });
}

/**
 * Converter Blob para File
 */
export function blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, { type: blob.type });
}

/**
 * Redimensionar imagem antes de enviar (para economizar custos/tempo)
 */
export async function resizeImage(
    file: File,
    maxWidth: number = 1024,
    maxHeight: number = 1024
): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calcular novo tamanho mantendo aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], file.name, { type: file.type }));
                } else {
                    reject(new Error('Erro ao redimensionar imagem'));
                }
            }, file.type);
        };

        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * FALLBACK: Se a API não funcionar, aplicar melhoramentos simples com Canvas
 */
export async function enhanceImageLocally(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            if (!ctx) {
                reject(new Error('Canvas não suportado'));
                return;
            }

            // Desenhar imagem
            ctx.drawImage(img, 0, 0);

            // Aplicar melhoramentos básicos
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Aumentar contraste e saturação
            for (let i = 0; i < data.length; i += 4) {
                // Aumentar contraste (fator 1.2)
                data[i] = Math.min(255, (data[i] - 128) * 1.2 + 128);     // R
                data[i + 1] = Math.min(255, (data[i + 1] - 128) * 1.2 + 128); // G
                data[i + 2] = Math.min(255, (data[i + 2] - 128) * 1.2 + 128); // B

                // Aumentar saturação levemente
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = Math.min(255, data[i] + (data[i] - avg) * 0.3);
                data[i + 1] = Math.min(255, data[i + 1] + (data[i + 1] - avg) * 0.3);
                data[i + 2] = Math.min(255, data[i + 2] + (data[i + 2] - avg) * 0.3);
            }

            ctx.putImageData(imageData, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], file.name, { type: file.type }));
                } else {
                    reject(new Error('Erro ao processar imagem'));
                }
            }, file.type, 0.95);
        };

        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = URL.createObjectURL(file);
    });
}
