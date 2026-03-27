import { useState } from 'react';
import { Sparkles, Download, X, RefreshCw, Loader2 } from 'lucide-react';
import { enhanceImage, removeBackground, enhanceImageLocally } from '../../services/imageEnhancement';

interface ImageEnhancerProps {
    originalImage: File;
    onImageEnhanced: (enhancedImage: File) => void;
    onClose: () => void;
}

export function ImageEnhancer({ originalImage, onImageEnhanced, onClose }: ImageEnhancerProps) {
    const [enhancedImage, setEnhancedImage] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'enhance' | 'remove-bg'>('enhance');

    const originalUrl = URL.createObjectURL(originalImage);
    const enhancedUrl = enhancedImage ? URL.createObjectURL(enhancedImage) : null;

    const handleEnhance = async (useRemoveBg: boolean = false) => {
        setProcessing(true);
        setError(null);
        setMode(useRemoveBg ? 'remove-bg' : 'enhance');

        try {
            let result: Blob;

            // Melhoramento local (sempre funciona)
            result = await enhanceImageLocally(originalImage);
            
            if (useRemoveBg) {
                // Aviso: remoção de fundo não disponível
                console.info('ℹ️ Remoção de fundo requer backend. Aplicando melhoramento padrão.');
            }

            const enhancedFile = new File(
                [result],
                originalImage.name.replace(/\.(jpg|jpeg|png|webp)$/i, '_enhanced.$1'),
                { type: result.type || originalImage.type }
            );

            setEnhancedImage(enhancedFile);

        } catch (err) {
            console.error('Erro ao processar:', err);
            setError(err instanceof Error ? err.message : 'Erro ao processar imagem');
        } finally {
            setProcessing(false);
        }
    };

    const handleUseEnhanced = () => {
        if (enhancedImage) {
            onImageEnhanced(enhancedImage);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Melhorar Imagem com IA</h2>
                            <p className="text-sm text-gray-600">Aprimore automaticamente a qualidade da foto</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Ações */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handleEnhance(false)}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {processing && mode === 'enhance' ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Melhorar Qualidade
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => handleEnhance(true)}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60 font-medium"
                            title="Funcionalidade requer backend. Use remove.bg como alternativa."
                        >
                            <RefreshCw className="h-4 w-4" />
                            Remover Fundo (Em breve)
                        </button>

                        {enhancedImage && (
                            <a
                                href={enhancedUrl!}
                                download={enhancedImage.name}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium ml-auto"
                            >
                                <Download className="h-4 w-4" />
                                Baixar
                            </a>
                        )}
                    </div>

                    {/* Info/Error */}
                    {error && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <strong>ℹ️ Informação:</strong> {error}
                            </p>
                        </div>
                    )}

                    {/* Comparison */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Original */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Original</h3>
                                <span className="text-xs text-gray-500">
                                    {(originalImage.size / 1024).toFixed(0)} KB
                                </span>
                            </div>
                            <div className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
                                <img
                                    src={originalUrl}
                                    alt="Original"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        {/* Enhanced */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    Melhorada
                                    {enhancedImage && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                            ✓ Pronta
                                        </span>
                                    )}
                                </h3>
                                {enhancedImage && (
                                    <span className="text-xs text-gray-500">
                                        {(enhancedImage.size / 1024).toFixed(0)} KB
                                    </span>
                                )}
                            </div>
                            <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-300 overflow-hidden flex items-center justify-center">
                                {enhancedImage ? (
                                    <img
                                        src={enhancedUrl!}
                                        alt="Enhanced"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center p-6">
                                        <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">
                                            Clique em "Melhorar Qualidade" para processar
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dicas */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 Como Funciona:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>Melhorar Qualidade:</strong> Aumenta contraste, saturação e nitidez</li>
                            <li>• <strong>Processamento Local:</strong> Tudo é feito no seu navegador (rápido e privado)</li>
                            <li>• <strong>Ideal para:</strong> Fotos de comida, produtos e cardápios</li>
                            <li>• <strong>Sem limites:</strong> Use quantas vezes quiser, é totalmente gratuito</li>
                        </ul>
                    </div>
                    
                    {/* Aviso sobre remoção de fundo */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Sobre Remoção de Fundo:</h4>
                        <p className="text-sm text-yellow-800">
                            A funcionalidade de remover fundo requer configuração de backend devido a limitações de CORS das APIs externas. 
                            Por enquanto, use ferramentas online como <a href="https://remove.bg" target="_blank" rel="noopener noreferrer" className="underline font-semibold">remove.bg</a> para essa funcionalidade.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUseEnhanced}
                        disabled={!enhancedImage}
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Usar Imagem Melhorada
                    </button>
                </div>
            </div>
        </div>
    );
}
