/**
 * Serviço de Melhoria de Imagens com IA
 * Integração com Cloudinary AI para upscaling e melhorias automáticas
 */

interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
}

interface EnhancementOptions {
    type: 'upscale' | 'background_removal' | 'auto_enhance';
    quality?: number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
}

interface EnhancementResult {
    success: boolean;
    originalUrl: string;
    enhancedUrl?: string;
    error?: string;
    processingTimeMs: number;
}

export class AIImageService {
    private config: CloudinaryConfig;

    constructor(config: CloudinaryConfig) {
        this.config = config;
    }

    /**
     * Melhorar imagem com IA (Upscaling + Auto Enhancement)
     */
    async enhanceImage(
        imageFile: File,
        options: EnhancementOptions = { type: 'upscale', quality: 90, format: 'auto' }
    ): Promise<EnhancementResult> {
        const startTime = Date.now();

        try {
            // 1. Upload para Cloudinary
            const uploadedUrl = await this.uploadToCloudinary(imageFile);

            // 2. Aplicar transformações de IA
            const enhancedUrl = this.buildEnhancedUrl(uploadedUrl, options);

            return {
                success: true,
                originalUrl: uploadedUrl,
                enhancedUrl,
                processingTimeMs: Date.now() - startTime
            };
        } catch (error) {
            console.error('Erro ao melhorar imagem:', error);
            return {
                success: false,
                originalUrl: '',
                error: error instanceof Error ? error.message : 'Erro ao processar imagem',
                processingTimeMs: Date.now() - startTime
            };
        }
    }

    /**
     * Upload para Cloudinary
     */
    private async uploadToCloudinary(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default'); // Criar preset no Cloudinary
        formData.append('folder', 'products');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error('Erro ao fazer upload da imagem');
        }

        const data = await response.json();
        return data.secure_url;
    }

    /**
     * Construir URL com transformações de IA
     */
    private buildEnhancedUrl(originalUrl: string, options: EnhancementOptions): string {
        const transformations: string[] = [];

        switch (options.type) {
            case 'upscale':
                // Upscaling 2x com IA + Auto enhancement
                transformations.push('e_upscale');
                transformations.push('e_enhance');
                transformations.push('q_auto:best');
                transformations.push('f_auto');
                break;

            case 'background_removal':
                // Remover fundo
                transformations.push('e_background_removal');
                transformations.push('q_auto:best');
                transformations.push('f_auto');
                break;

            case 'auto_enhance':
                // Auto enhancement (cor, contraste, nitidez)
                transformations.push('e_enhance');
                transformations.push('e_auto_color');
                transformations.push('e_auto_contrast');
                transformations.push('e_sharpen');
                transformations.push('q_auto:best');
                transformations.push('f_auto');
                break;
        }

        // Inserir transformações na URL do Cloudinary
        const urlParts = originalUrl.split('/upload/');
        if (urlParts.length === 2) {
            return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
        }

        return originalUrl;
    }

    /**
     * Remover fundo da imagem
     */
    async removeBackground(imageFile: File): Promise<EnhancementResult> {
        return this.enhanceImage(imageFile, { type: 'background_removal' });
    }

    /**
     * Auto enhancement (melhorar cores, contraste, nitidez)
     */
    async autoEnhance(imageFile: File): Promise<EnhancementResult> {
        return this.enhanceImage(imageFile, { type: 'auto_enhance' });
    }
}

// Singleton instance
let aiImageService: AIImageService | null = null;

export function getAIImageService(): AIImageService {
    if (!aiImageService) {
        const config: CloudinaryConfig = {
            cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
            apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
            apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET || ''
        };

        if (!config.cloudName) {
            console.warn('⚠️ Cloudinary não configurado. Defina VITE_CLOUDINARY_CLOUD_NAME no .env');
        }

        aiImageService = new AIImageService(config);
    }

    return aiImageService;
}

// Export default instance
export default getAIImageService();
