import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Palette, Save, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTenantContext } from '../../contexts/TenantContext';

export function StoreCustomization() {
    const { tenant, refetch } = useTenantContext();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [customization, setCustomization] = useState({
        primaryColor: tenant?.primaryColor || '#FF6B6B',
        secondaryColor: tenant?.secondaryColor || '#4ECDC4',
        logoUrl: tenant?.logoUrl || '',
        bannerUrl: tenant?.bannerUrl || ''
    });

    useEffect(() => {
        if (tenant) {
            setCustomization({
                primaryColor: tenant.primaryColor,
                secondaryColor: tenant.secondaryColor,
                logoUrl: tenant.logoUrl || '',
                bannerUrl: tenant.bannerUrl || ''
            });
        }
    }, [tenant]);

    const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
        setCustomization(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (file: File, type: 'logo' | 'banner') => {
        if (!tenant) return;

        try {
            setUploading(true);

            // Validar tipo de arquivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione uma imagem válida');
                return;
            }

            // Validar tamanho (máx 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Imagem muito grande. Máximo 2MB');
                return;
            }

            // Criar nome único
            const fileExt = file.name.split('.').pop();
            const fileName = `${tenant.id}/${type}_${Date.now()}.${fileExt}`;

            // Upload com fallback:
            // 1) tenant-assets (ideal, isolado por tenant)
            // 2) products (compatibilidade enquanto JWT não tiver tenant_id)
            const buckets = ['tenant-assets', 'products'] as const;
            let publicUrl = '';
            let lastError: unknown = null;

            for (const bucket of buckets) {
                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (!uploadError) {
                    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
                    publicUrl = data.publicUrl;
                    break;
                }

                lastError = uploadError;
            }

            if (!publicUrl) {
                console.error('Erro no upload:', lastError);
                alert('Erro ao fazer upload da imagem. Verifique as políticas do Storage.');
                return;
            }

            // Atualizar estado local
            setCustomization(prev => ({
                ...prev,
                [type === 'logo' ? 'logoUrl' : 'bannerUrl']: publicUrl
            }));

            alert(`${type === 'logo' ? 'Logo' : 'Banner'} enviado! Clique em "Salvar" para aplicar.`);

        } catch (err) {
            console.error('Erro:', err);
            alert('Erro ao processar imagem');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!tenant) return;

        try {
            setLoading(true);

            const { error } = await supabase
                .from('tenants')
                .update({
                    primary_color: customization.primaryColor,
                    secondary_color: customization.secondaryColor,
                    logo_url: customization.logoUrl || null,
                    banner_url: customization.bannerUrl || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', tenant.id);

            if (error) throw error;

            alert('✅ Personalização salva com sucesso!');
            refetch(); // Recarregar tenant

        } catch (err) {
            console.error('Erro ao salvar:', err);
            alert('❌ Erro ao salvar personalização');
        } finally {
            setLoading(false);
        }
    };

    if (!tenant) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Preview */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-2 mb-4">
                    <Eye className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                </div>

                <div
                    className="rounded-lg overflow-hidden shadow-lg"
                    style={{ backgroundColor: customization.primaryColor }}
                >
                    {/* Banner Preview */}
                    <div
                        className="h-32 bg-cover bg-center relative"
                        style={{
                            backgroundImage: customization.bannerUrl ? `url(${customization.bannerUrl})` : undefined,
                            backgroundColor: customization.secondaryColor
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                            <h2 className="text-white text-2xl font-bold">{tenant.name}</h2>
                        </div>
                    </div>

                    {/* Logo Preview */}
                    {customization.logoUrl && (
                        <div className="relative -mt-12 ml-4 w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                            <img
                                src={customization.logoUrl}
                                alt="Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content Preview */}
                    <div className="p-6 bg-white">
                        <div className="flex gap-2 mb-2">
                            <div
                                className="px-4 py-2 rounded-lg text-white font-semibold"
                                style={{ backgroundColor: customization.primaryColor }}
                            >
                                Botão Primário
                            </div>
                            <div
                                className="px-4 py-2 rounded-lg text-white font-semibold"
                                style={{ backgroundColor: customization.secondaryColor }}
                            >
                                Botão Secundário
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cores */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-blue-600" />
                    Paleta de Cores
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cor Primária */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cor Primária
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={customization.primaryColor}
                                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={customization.primaryColor}
                                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                placeholder="#FF6B6B"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Cor principal dos botões e destaques
                        </p>
                    </div>

                    {/* Cor Secundária */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cor Secundária
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={customization.secondaryColor}
                                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={customization.secondaryColor}
                                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                placeholder="#4ECDC4"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Cor secundária para acentos e variações
                        </p>
                    </div>
                </div>
            </div>

            {/* Logo e Banner */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    Imagens
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            {customization.logoUrl ? (
                                <div className="space-y-3">
                                    <img
                                        src={customization.logoUrl}
                                        alt="Logo atual"
                                        className="w-24 h-24 object-cover mx-auto rounded-full border-4 border-gray-200"
                                    />
                                    <p className="text-sm text-gray-600">Logo atual</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                    <p className="text-sm text-gray-600">Nenhum logo enviado</p>
                                </div>
                            )}

                            <label className="mt-4 inline-block cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                {uploading ? 'Enviando...' : 'Escolher Logo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-2">
                                Recomendado: 200x200px, PNG ou JPG, máx 2MB
                            </p>
                        </div>
                    </div>

                    {/* Banner */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Banner
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            {customization.bannerUrl ? (
                                <div className="space-y-3">
                                    <img
                                        src={customization.bannerUrl}
                                        alt="Banner atual"
                                        className="w-full h-24 object-cover mx-auto rounded border-2 border-gray-200"
                                    />
                                    <p className="text-sm text-gray-600">Banner atual</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                    <p className="text-sm text-gray-600">Nenhum banner enviado</p>
                                </div>
                            )}

                            <label className="mt-4 inline-block cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                {uploading ? 'Enviando...' : 'Escolher Banner'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'banner')}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-2">
                                Recomendado: 1200x300px, PNG ou JPG, máx 2MB
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    disabled={loading || uploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                    <Save className="h-5 w-5" />
                    <span>{loading ? 'Salvando...' : 'Salvar Personalização'}</span>
                </button>
            </div>
        </div>
    );
}
