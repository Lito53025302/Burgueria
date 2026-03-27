import { useState, useRef } from 'react';
import { Upload, Check, Loader2, Zap, Wand2 } from 'lucide-react';
import generativeAIService from '../services/generativeAIService';

interface AIImageUploadProProps {
    onImageSelected: (file: File, enhancedUrl?: string, generatedUrl?: string) => void;
    maxSizeMB?: number;
    productName?: string;
    showGenerativeAI?: boolean;
    tenantId?: string;
}

export default function AIImageUploadPro({
    onImageSelected,
    maxSizeMB = 5,
    productName = 'produto',
    showGenerativeAI = true,
    tenantId
}: AIImageUploadProProps) {
    void tenantId;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState('wooden_board');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [generativeCredits, setGenerativeCredits] = useState({ used: 0, limit: 10 });
    const [processingTime, setProcessingTime] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const backgroundStyles = generativeAIService.getAvailableStyles();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar formato
        if (!file.type.startsWith('image/')) {
            setError('Formato não suportado. Use imagens (JPG, PNG, WEBP)');
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

        // Mock de créditos (TODO: buscar do backend)
        setGenerativeCredits({ used: 3, limit: 10 });
    };

    const generateProfessionalPhoto = async () => {
        if (!selectedFile) return;

        setIsGenerating(true);
        setGenerationStatus('processing');
        setError(null);

        try {
            const result = await generativeAIService.generateProfessionalPhoto(
                selectedFile,
                productName,
                selectedStyle
            );

            if (result.success && result.generatedUrl) {
                setGeneratedUrl(result.generatedUrl);
                setGenerationStatus('completed');
                setProcessingTime(result.processingTimeMs / 1000);
                setGenerativeCredits(prev => ({ ...prev, used: prev.used + 1 }));
            } else {
                throw new Error(result.error || 'Erro ao gerar foto');
            }

        } catch (err) {
            console.error('Erro ao gerar foto:', err);
            setError(err instanceof Error ? err.message : 'Erro ao processar imagem. Tente novamente.');
            setGenerationStatus('error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConfirm = () => {
        if (!selectedFile) return;
        onImageSelected(selectedFile, undefined, generatedUrl || undefined);
        resetUpload();
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setGeneratedUrl(null);
        setGenerationStatus('idle');
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const hasCredits = generativeCredits.used < generativeCredits.limit;

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            {!selectedFile && (
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-purple-500 transition-all cursor-pointer group bg-gradient-to-br from-gray-50 to-purple-50"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="h-10 w-10 text-white" />
                            </div>
                            <div className="text-center">
                                <p className="text-gray-800 font-bold text-xl">Clique para fazer upload</p>
                                <p className="text-gray-600 mt-2">
                                    ou arraste e solte aqui
                                </p>
                                <p className="text-sm text-gray-500 mt-3">
                                    PNG, JPG ou WEBP (máx. {maxSizeMB}MB)
                                </p>
                            </div>
                        </div>
                    </button>

                    {showGenerativeAI && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                            <Wand2 className="h-4 w-4" />
                            IA Generativa Disponível
                        </div>
                    )}
                </div>
            )}

            {/* Preview & Generation */}
            {selectedFile && (
                <div className="space-y-6">
                    {/* Style Selector */}
                    {showGenerativeAI && !generatedUrl && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-purple-600" />
                                Escolha o Estilo de Fundo
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {backgroundStyles.map((style) => (
                                    <button
                                        key={style.name}
                                        type="button"
                                        onClick={() => setSelectedStyle(style.name)}
                                        className={`p-4 rounded-lg border-2 transition-all ${selectedStyle === style.name
                                                ? 'border-purple-600 bg-purple-100 shadow-lg'
                                                : 'border-gray-300 bg-white hover:border-purple-400'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">
                                                {style.name === 'wooden_board' && '🪵'}
                                                {style.name === 'marble_surface' && '⚪'}
                                                {style.name === 'slate_plate' && '⚫'}
                                                {style.name === 'restaurant_table' && '🍺'}
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {style.displayName}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comparison View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Original */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    📸 Original
                                </span>
                                <span className="text-xs text-gray-500">
                                    {(selectedFile.size / 1024).toFixed(0)} KB
                                </span>
                            </div>
                            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-300">
                                {previewUrl && (
                                    <img
                                        src={previewUrl}
                                        alt="Original"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Generated */}
                        {showGenerativeAI && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-2">
                                        <Wand2 className="h-4 w-4 text-purple-600" />
                                        Foto Profissional com IA
                                    </span>
                                    {generationStatus === 'completed' && (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            <Check className="h-3 w-3" />
                                            {processingTime.toFixed(1)}s
                                        </span>
                                    )}
                                </div>
                                <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden border-2 border-purple-400 shadow-xl">
                                    {generatedUrl ? (
                                        <img
                                            src={generatedUrl}
                                            alt="Generated"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-6">
                                            {isGenerating ? (
                                                <div className="text-center">
                                                    <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
                                                    <p className="text-gray-700 font-semibold">Criando foto profissional...</p>
                                                    <p className="text-sm text-gray-600 mt-2">Isso pode levar 10-20 segundos</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Wand2 className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                                                    <p className="text-gray-700 font-semibold">
                                                        Clique em "Gerar Foto Profissional"
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        A IA vai criar uma foto de restaurante!
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Credits Info */}
                    {showGenerativeAI && (
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Zap className="h-5 w-5" />
                                    <div>
                                        <p className="font-bold">Créditos de IA Generativa</p>
                                        <p className="text-sm text-purple-100">Cria fotos profissionais do zero</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">{generativeCredits.used}/{generativeCredits.limit}</p>
                                    <p className="text-xs text-purple-100">este mês</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
                            <p className="font-semibold">❌ {error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={resetUpload}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>

                        {showGenerativeAI && !generatedUrl && (
                            <button
                                type="button"
                                onClick={generateProfessionalPhoto}
                                disabled={isGenerating || !hasCredits}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="h-5 w-5" />
                                        Gerar Foto Profissional
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="h-5 w-5" />
                            {generatedUrl ? 'Usar Foto Profissional' : 'Usar Original'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
