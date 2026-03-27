import { useState, useRef } from 'react';
import { Upload, Sparkles, Check, Loader2, Zap, Image as ImageIcon } from 'lucide-react';

interface AIImageUploadProps {
    onImageSelected: (file: File, enhancedUrl?: string) => void;
    maxSizeMB?: number;
    acceptedFormats?: string[];
    showAIEnhancement?: boolean;
    tenantId?: string;
}

export default function AIImageUpload({
    onImageSelected,
    maxSizeMB = 5,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
    showAIEnhancement = true,
    tenantId
}: AIImageUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhancementStatus, setEnhancementStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [aiCredits, setAiCredits] = useState({ used: 0, limit: 0, unlimited: false });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar formato
        if (!acceptedFormats.includes(file.type)) {
            setError(`Formato não suportado. Use: ${acceptedFormats.join(', ')}`);
            return;
        }

        // Validar tamanho
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
            return;
        }

        setError(null);
        setSelectedFile(file);

        // Criar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Buscar créditos disponíveis se IA estiver habilitada
        if (showAIEnhancement && tenantId) {
            await checkAICredits();
        }
    };

    const checkAICredits = async () => {
        try {
            // TODO: Implementar chamada para verificar créditos
            // const { data } = await supabase.rpc('check_ai_credits', { p_tenant_id: tenantId });
            // setAiCredits({ used: data.credits_used, limit: data.credits_limit, unlimited: data.is_unlimited });

            // Mock para demonstração
            setAiCredits({ used: 15, limit: 50, unlimited: false });
        } catch (err) {
            console.error('Erro ao verificar créditos:', err);
        }
    };

    const enhanceWithAI = async () => {
        if (!selectedFile) return;

        setIsEnhancing(true);
        setEnhancementStatus('processing');
        setError(null);

        try {
            // TODO: Implementar integração com Cloudinary/Replicate
            // Por enquanto, simular processamento
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Mock: usar a mesma imagem como "melhorada"
            setEnhancedUrl(previewUrl);
            setEnhancementStatus('completed');

            // Incrementar contador de uso
            setAiCredits(prev => ({ ...prev, used: prev.used + 1 }));

        } catch (err) {
            console.error('Erro ao melhorar imagem:', err);
            setError('Erro ao processar imagem. Tente novamente.');
            setEnhancementStatus('error');
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleConfirm = () => {
        if (!selectedFile) return;
        onImageSelected(selectedFile, enhancedUrl || undefined);
        resetUpload();
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setEnhancedUrl(null);
        setEnhancementStatus('idle');
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const hasCredits = aiCredits.unlimited || aiCredits.used < aiCredits.limit;

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {!selectedFile && (
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFormats.join(',')}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors cursor-pointer group"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Upload className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-gray-700 font-medium">Clique para fazer upload</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    ou arraste e solte aqui
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    PNG, JPG ou WEBP (máx. {maxSizeMB}MB)
                                </p>
                            </div>
                        </div>
                    </button>

                    {showAIEnhancement && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            IA Disponível
                        </div>
                    )}
                </div>
            )}

            {/* Preview & Enhancement */}
            {selectedFile && (
                <div className="space-y-4">
                    {/* Comparison View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Original */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Original</span>
                                <span className="text-xs text-gray-500">
                                    {(selectedFile.size / 1024).toFixed(0)} KB
                                </span>
                            </div>
                            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {previewUrl && (
                                    <img
                                        src={previewUrl}
                                        alt="Original"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Enhanced */}
                        {showAIEnhancement && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Sparkles className="h-4 w-4 text-purple-500" />
                                        Melhorada com IA
                                    </span>
                                    {enhancementStatus === 'completed' && (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            <Check className="h-3 w-3" />
                                            Pronta
                                        </span>
                                    )}
                                </div>
                                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-purple-200">
                                    {enhancedUrl ? (
                                        <img
                                            src={enhancedUrl}
                                            alt="Enhanced"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {isEnhancing ? (
                                                <div className="text-center">
                                                    <Loader2 className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600">Melhorando...</p>
                                                </div>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">
                                                        Clique em "Melhorar com IA"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Credits Info */}
                    {showAIEnhancement && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Créditos de IA
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-purple-600">
                                    {aiCredits.unlimited ? '∞ Ilimitado' : `${aiCredits.used}/${aiCredits.limit}`}
                                </span>
                            </div>
                            {!hasCredits && (
                                <p className="text-xs text-red-600 mt-1">
                                    Você atingiu o limite mensal. Faça upgrade para continuar!
                                </p>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={resetUpload}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>

                        {showAIEnhancement && !enhancedUrl && (
                            <button
                                type="button"
                                onClick={enhanceWithAI}
                                disabled={isEnhancing || !hasCredits}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isEnhancing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Melhorar com IA
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="h-4 w-4" />
                            {enhancedUrl ? 'Usar Versão Melhorada' : 'Usar Original'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
