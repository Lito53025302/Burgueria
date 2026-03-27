/**
 * Serviço de IA Generativa para Fotos de Produtos
 * Usa Replicate (Stable Diffusion) para criar fotos profissionais
 */

interface GenerativeAIConfig {
    replicateApiToken: string;
}

interface BackgroundStyle {
    name: string;
    displayName: string;
    promptTemplate: string;
}

interface GenerativeResult {
    success: boolean;
    originalUrl: string;
    generatedUrl?: string;
    backgroundStyle?: string;
    prompt?: string;
    error?: string;
    processingTimeMs: number;
}

interface ReplicatePrediction {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | string;
    output?: string[];
}

export class GenerativeAIService {
    private config: GenerativeAIConfig;

    // Estilos de fundo disponíveis
    private backgroundStyles: BackgroundStyle[] = [
        {
            name: 'wooden_board',
            displayName: 'Tábua de Madeira',
            promptTemplate: 'Professional food photography of {product} on rustic wooden board, dark background, beer glass, studio lighting, appetizing, 8K, ultra detailed, photorealistic'
        },
        {
            name: 'marble_surface',
            displayName: 'Mármore Branco',
            promptTemplate: 'Professional food photography of {product} on white marble surface, minimalist, clean background, natural lighting, elegant, 8K, ultra detailed, photorealistic'
        },
        {
            name: 'slate_plate',
            displayName: 'Ardósia Preta',
            promptTemplate: 'Professional food photography of {product} on black slate plate, dark moody background, dramatic lighting, gourmet, 8K, ultra detailed, photorealistic'
        },
        {
            name: 'restaurant_table',
            displayName: 'Mesa de Restaurante',
            promptTemplate: 'Professional food photography of {product} on restaurant table, beer glass and fries in background, warm ambient lighting, cozy atmosphere, 8K, ultra detailed, photorealistic'
        }
    ];

    constructor(config: GenerativeAIConfig) {
        this.config = config;
    }

    /**
     * Gerar foto profissional com IA
     */
    async generateProfessionalPhoto(
        imageFile: File,
        productName: string,
        backgroundStyle: string = 'wooden_board'
    ): Promise<GenerativeResult> {
        const startTime = Date.now();

        try {
            // 1. Detectar tipo de produto
            const productType = this.detectProductType(productName);

            // 2. Obter estilo de fundo
            const style = this.backgroundStyles.find(s => s.name === backgroundStyle)
                || this.backgroundStyles[0];

            // 3. Construir prompt
            const prompt = style.promptTemplate.replace('{product}', productType);
            const negativePrompt = 'blurry, low quality, distorted, ugly, bad lighting, amateur, pixelated';

            // 4. Upload da imagem original (para usar como referência)
            const imageBase64 = await this.fileToBase64(imageFile);

            // 5. Chamar API do Replicate (Stable Diffusion)
            const generatedUrl = await this.callReplicateAPI(imageBase64, prompt, negativePrompt);

            return {
                success: true,
                originalUrl: URL.createObjectURL(imageFile),
                generatedUrl,
                backgroundStyle: style.name,
                prompt,
                processingTimeMs: Date.now() - startTime
            };

        } catch (error) {
            console.error('Erro ao gerar foto:', error);
            return {
                success: false,
                originalUrl: '',
                error: error instanceof Error ? error.message : 'Erro ao processar imagem',
                processingTimeMs: Date.now() - startTime
            };
        }
    }

    /**
     * Detectar tipo de produto pelo nome
     */
    private detectProductType(productName: string): string {
        const name = productName.toLowerCase();

        if (name.includes('burger') || name.includes('hambur')) return 'gourmet burger';
        if (name.includes('pizza')) return 'artisan pizza';
        if (name.includes('hot dog') || name.includes('cachorro')) return 'gourmet hot dog';
        if (name.includes('batata') || name.includes('fries')) return 'french fries';
        if (name.includes('milk') || name.includes('shake')) return 'milkshake';
        if (name.includes('refri') || name.includes('soda')) return 'soft drink';
        if (name.includes('cerveja') || name.includes('beer')) return 'cold beer';
        if (name.includes('sobremesa') || name.includes('dessert')) return 'dessert';

        return 'gourmet food';
    }

    /**
     * Converter File para Base64
     */
    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Chamar API do Replicate (Stable Diffusion)
     */
    private async callReplicateAPI(
        imageBase64: string,
        prompt: string,
        negativePrompt: string
    ): Promise<string> {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this.config.replicateApiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
                input: {
                    image: `data:image/jpeg;base64,${imageBase64}`,
                    prompt: prompt,
                    negative_prompt: negativePrompt,
                    num_outputs: 1,
                    guidance_scale: 7.5,
                    num_inference_steps: 50,
                    scheduler: 'DPMSolverMultistep'
                }
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao chamar API do Replicate');
        }

        const prediction = await response.json() as ReplicatePrediction;

        // Aguardar processamento
        const result = await this.waitForPrediction(prediction.id);

        return result.output?.[0] || ''; // URL da imagem gerada
    }

    /**
     * Aguardar conclusão do processamento
     */
    private async waitForPrediction(predictionId: string): Promise<ReplicatePrediction> {
        let attempts = 0;
        const maxAttempts = 60; // 60 segundos

        while (attempts < maxAttempts) {
            const response = await fetch(
                `https://api.replicate.com/v1/predictions/${predictionId}`,
                {
                    headers: {
                        'Authorization': `Token ${this.config.replicateApiToken}`
                    }
                }
            );

            const prediction = await response.json() as ReplicatePrediction;

            if (prediction.status === 'succeeded') {
                return prediction;
            }

            if (prediction.status === 'failed') {
                throw new Error('Falha ao processar imagem');
            }

            // Aguardar 1 segundo antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        throw new Error('Timeout ao processar imagem');
    }

    /**
     * Obter estilos disponíveis
     */
    getAvailableStyles(): BackgroundStyle[] {
        return this.backgroundStyles;
    }
}

// Singleton instance
let generativeAIService: GenerativeAIService | null = null;

export function getGenerativeAIService(): GenerativeAIService {
    if (!generativeAIService) {
        const config: GenerativeAIConfig = {
            replicateApiToken: import.meta.env.VITE_REPLICATE_API_TOKEN || ''
        };

        if (!config.replicateApiToken) {
            console.warn('⚠️ Replicate não configurado. Defina VITE_REPLICATE_API_TOKEN no .env');
        }

        generativeAIService = new GenerativeAIService(config);
    }

    return generativeAIService;
}

export default getGenerativeAIService();
