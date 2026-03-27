import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Store, Check, ArrowRight, ArrowLeft, Loader2, Upload, Palette, MapPin, Mail, Phone, User, Lock, Search } from 'lucide-react';
import { useCepLookup } from '../hooks/useCepLookup';
import { logger } from '../utils/logger';

interface SignupFormData {
    // Informações da Loja
    storeName: string;
    subdomain: string;

    // Proprietário
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
    ownerPhone: string;
    documentType: 'cpf' | 'cnpj';
    documentNumber: string;

    // Endereço
    address: string;
    city: string;
    state: string;
    zipCode: string;

    // Customização
    primaryColor: string;
    secondaryColor: string;
    logoFile: File | null;

    // Configurações
    openingTime: string;
    closingTime: string;
    deliveryFee: string;
    minimumOrder: string;
}

const STEPS = [
    { id: 1, title: 'Informações Básicas', icon: Store },
    { id: 2, title: 'Localização', icon: MapPin },
    { id: 3, title: 'Personalização', icon: Palette },
    { id: 4, title: 'Configurações', icon: Check }
];

export default function StoreSignup() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
    const [checkingSubdomain, setCheckingSubdomain] = useState(false);
    
    // Hook para buscar CEP
    const { searchCep, formatCep, loading: cepLoading, error: cepError, clearError: clearCepError } = useCepLookup();

    const [formData, setFormData] = useState<SignupFormData>({
        storeName: '',
        subdomain: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerPhone: '',
        documentType: 'cpf',
        documentNumber: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
        logoFile: null,
        openingTime: '18:00',
        closingTime: '23:00',
        deliveryFee: '5.00',
        minimumOrder: '20.00'
    });

    // Auto-gerar subdomain baseado no nome da loja
    useEffect(() => {
        if (formData.storeName) {
            const slug = formData.storeName
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            setFormData(prev => ({ ...prev, subdomain: slug }));
        }
    }, [formData.storeName]);

    // Verificar disponibilidade do subdomain
    useEffect(() => {
        const checkSubdomain = async () => {
            if (!formData.subdomain || formData.subdomain.length < 3) {
                setSubdomainAvailable(null);
                return;
            }

            setCheckingSubdomain(true);
            try {
                const { data, error } = await supabase
                    .from('tenants')
                    .select('id')
                    .eq('subdomain', formData.subdomain)
                    .maybeSingle(); // Usa maybeSingle() ao invés de single()

                // Se encontrou dados, o subdomain JÁ está em uso
                if (data && !error) {
                    setSubdomainAvailable(false); // Já existe, não disponível
                    logger.info('Subdomain já existe', { subdomain: formData.subdomain });
                } else {
                    setSubdomainAvailable(true); // Não existe, disponível
                    logger.info('Subdomain disponível', { subdomain: formData.subdomain });
                }
            } catch (err) {
                // Em caso de erro, assume que está disponível
                logger.warn('Erro ao verificar subdomain', err);
                setSubdomainAvailable(true);
            } finally {
                setCheckingSubdomain(false);
            }
        };

        const debounce = setTimeout(checkSubdomain, 500);
        return () => clearTimeout(debounce);
    }, [formData.subdomain]);

    const updateFormData = <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
        clearCepError();
    };

    // Função para buscar endereço pelo CEP
    const handleCepSearch = async (cep: string) => {
        const data = await searchCep(cep);
        
        if (data) {
            // Preencher campos automaticamente
            setFormData(prev => ({
                ...prev,
                address: data.logradouro || prev.address,
                city: data.localidade || prev.city,
                state: data.uf || prev.state,
                zipCode: formatCep(data.cep)
            }));
            
            logger.info('Endereço preenchido automaticamente', { 
                cidade: data.localidade, 
                estado: data.uf 
            });
        }
    };

    // Formatar CEP enquanto digita
    const handleCepChange = (value: string) => {
        const formatted = formatCep(value);
        updateFormData('zipCode', formatted);
        
        // Buscar automaticamente quando tiver 8 dígitos
        const cleanCep = value.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            handleCepSearch(cleanCep);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tamanho (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('Logo deve ter no máximo 2MB');
                return;
            }
            updateFormData('logoFile', file);
        }
    };

    const validateCurrentStep = (): boolean => {
        setError(null);

        switch (currentStep) {
            case 1: {
                if (!formData.storeName.trim()) {
                    setError('Nome da loja é obrigatório');
                    return false;
                }
                if (!formData.subdomain.trim() || formData.subdomain.length < 3) {
                    setError('Subdomain deve ter pelo menos 3 caracteres');
                    return false;
                }
                if (subdomainAvailable === false) {
                    setError('Este subdomain já está em uso');
                    return false;
                }
                if (!formData.ownerName.trim()) {
                    setError('Nome do proprietário é obrigatório');
                    return false;
                }
                if (!formData.ownerEmail.trim() || !formData.ownerEmail.includes('@')) {
                    setError('Email válido é obrigatório');
                    return false;
                }
                if (!formData.ownerPassword || formData.ownerPassword.length < 6) {
                    setError('Senha deve ter pelo menos 6 caracteres');
                    return false;
                }
                if (!formData.documentNumber.trim()) {
                    setError(`${formData.documentType.toUpperCase()} é obrigatório`);
                    return false;
                }
                // Validação básica de CPF/CNPJ (apenas tamanho)
                const docOnlyNumbers = formData.documentNumber.replace(/\D/g, '');
                if (formData.documentType === 'cpf' && docOnlyNumbers.length !== 11) {
                    setError('CPF deve ter 11 dígitos');
                    return false;
                }
                if (formData.documentType === 'cnpj' && docOnlyNumbers.length !== 14) {
                    setError('CNPJ deve ter 14 dígitos');
                    return false;
                }
                return true;
            }

            case 2:
                if (!formData.zipCode.trim()) {
                    setError('CEP é obrigatório');
                    return false;
                }
                if (!formData.city.trim()) {
                    setError('Cidade é obrigatória');
                    return false;
                }
                if (!formData.state.trim()) {
                    setError('Estado é obrigatório');
                    return false;
                }
                return true;

            case 3:
            case 4:
                return true;

            default:
                return false;
        }
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!validateCurrentStep()) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Upload do logo (se houver) - APÓS criar o tenant
            let logoUrl: string | null = null;
            let logoFile: File | null = formData.logoFile;

            // 2. Criar usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.ownerEmail,
                password: formData.ownerPassword,
                options: {
                    data: {
                        full_name: formData.ownerName,
                        phone: formData.ownerPhone
                    }
                }
            });

            if (authError) {
                // Verificar se é erro de email já cadastrado
                if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
                    throw new Error('Este email já está cadastrado. Use outro email ou faça login.');
                }
                throw new Error(`Erro ao criar usuário: ${authError.message}`);
            }
            if (!authData.user) throw new Error('Usuário não foi criado');

            // 3. Buscar o plano FREE
            const { data: freePlan, error: planError } = await supabase
                .from('subscription_plans')
                .select('id')
                .eq('name', 'free')
                .single();

            if (planError || !freePlan) {
                throw new Error('Erro ao buscar plano FREE. Verifique se a migration foi executada.');
            }

            // 4. Criar tenant (SEM logo primeiro)
            const { data: tenantData, error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    name: formData.storeName,
                    subdomain: formData.subdomain,
                    slug: formData.subdomain,
                    owner_name: formData.ownerName,
                    owner_email: formData.ownerEmail,
                    owner_phone: formData.ownerPhone,
                    document_type: formData.documentType,
                    document_number: formData.documentNumber.replace(/\D/g, ''),
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip_code: formData.zipCode,
                    primary_color: formData.primaryColor,
                    secondary_color: formData.secondaryColor,
                    logo_url: null, // Será atualizado depois
                    opening_time: formData.openingTime,
                    closing_time: formData.closingTime,
                    delivery_fee: parseFloat(formData.deliveryFee),
                    minimum_order: parseFloat(formData.minimumOrder),
                    is_active: true,
                    published: false, // Loja começa como rascunho (não aparece na vitrine)
                    subscription_plan_id: freePlan.id,
                    subscription_started_at: new Date().toISOString(),
                    subscription_plan: 'free'
                })
                .select()
                .single();

            if (tenantError) throw new Error(`Erro ao criar loja: ${tenantError.message}`);

            // 4.5. Upload do logo APÓS criar tenant (agora tem permissão)
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `${formData.subdomain}-logo-${Date.now()}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('tenant-assets')
                    .upload(`${formData.subdomain}/${fileName}`, logoFile);

                if (!uploadError && uploadData) {
                    const { data } = supabase.storage
                        .from('tenant-assets')
                        .getPublicUrl(uploadData.path);
                    logoUrl = data.publicUrl;

                    // Atualizar tenant com URL do logo
                    await supabase
                        .from('tenants')
                        .update({ logo_url: logoUrl })
                        .eq('id', tenantData.id);
                    
                    logger.info('Logo enviado com sucesso', { logoUrl });
                } else {
                    logger.warn('Erro ao fazer upload do logo', uploadError);
                }
            }

            // 5. Criar profile do admin
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    full_name: formData.ownerName,
                    phone: formData.ownerPhone,
                    role: 'admin',
                    tenant_id: tenantData.id
                });

            if (profileError) {
                logger.warn('Erro ao criar profile', profileError);
            }

            // 6. Atualizar app_metadata do usuário com tenant_id (via RPC se disponível)
            // Nota: Normalmente isso seria feito via Edge Function ou trigger
            // Por enquanto, o login já vai buscar o tenant_id do profile

            // 7. Sucesso! Mostrar mensagem e redirecionar
            alert(`🎉 Loja "${formData.storeName}" criada com sucesso!\n\n✅ Plano FREE ativado\n✅ 14 dias de trial gratuito\n\nVocê será redirecionado para fazer login no painel administrativo.`);

            // Fazer logout para forçar novo login no painel admin
            await supabase.auth.signOut();

            setTimeout(() => {
                // Redireciona para o painel administrativo
                // Em desenvolvimento: localhost:5174
                // Em produção: usar subdomain
                const isProd = window.location.hostname !== 'localhost';
                
                if (isProd) {
                    // Produção: usar subdomain
                    window.location.href = `https://${formData.subdomain}.${window.location.hostname}:5174`;
                } else {
                    // Desenvolvimento: redirecionar para localhost:5174
                    window.location.href = 'http://localhost:5174';
                }
            }, 1500);

        } catch (err) {
            logger.error('Erro ao criar loja', err);
            setError(err instanceof Error ? err.message : 'Erro ao criar loja. Tente novamente.');
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nome da Loja *
                            </label>
                            <input
                                type="text"
                                value={formData.storeName}
                                onChange={(e) => updateFormData('storeName', e.target.value)}
                                placeholder="Ex: Burguer do João"
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Subdomain * <span className="text-xs text-gray-500">(URL da sua loja)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.subdomain}
                                    onChange={(e) => updateFormData('subdomain', e.target.value.toLowerCase())}
                                    placeholder="burguer-joao"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                {checkingSubdomain && (
                                    <Loader2 className="absolute right-3 top-3 h-5 w-5 text-gray-400 animate-spin" />
                                )}
                                {!checkingSubdomain && subdomainAvailable !== null && (
                                    <div className="absolute right-3 top-3">
                                        {subdomainAvailable ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <span className="text-red-500 text-sm">✕</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-gray-400">
                                Sua URL será: <span className="text-orange-500 font-medium">/{formData.subdomain || '...'}</span>
                            </p>
                        </div>

                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Dados do Proprietário</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <User className="inline h-4 w-4 mr-1" />
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.ownerName}
                                        onChange={(e) => updateFormData('ownerName', e.target.value)}
                                        placeholder="João Silva"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Mail className="inline h-4 w-4 mr-1" />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.ownerEmail}
                                        onChange={(e) => updateFormData('ownerEmail', e.target.value)}
                                        placeholder="joao@email.com"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Lock className="inline h-4 w-4 mr-1" />
                                        Senha * <span className="text-xs text-gray-500">(mínimo 6 caracteres)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.ownerPassword}
                                        onChange={(e) => updateFormData('ownerPassword', e.target.value)}
                                        placeholder="••••••"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Phone className="inline h-4 w-4 mr-1" />
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.ownerPhone}
                                        onChange={(e) => updateFormData('ownerPhone', e.target.value)}
                                        placeholder="(11) 98765-4321"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        📄 CPF ou CNPJ * <span className="text-xs text-gray-500">(Documento da empresa/proprietário)</span>
                                    </label>

                                    {/* Toggle CPF/CNPJ */}
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                updateFormData('documentType', 'cpf');
                                                updateFormData('documentNumber', '');
                                            }}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${formData.documentType === 'cpf'
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            CPF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                updateFormData('documentType', 'cnpj');
                                                updateFormData('documentNumber', '');
                                            }}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${formData.documentType === 'cnpj'
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            CNPJ
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={formData.documentNumber}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '');

                                            // Aplicar máscara
                                            if (formData.documentType === 'cpf') {
                                                // Máscara CPF: 000.000.000-00
                                                value = value.substring(0, 11);
                                                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                                            } else {
                                                // Máscara CNPJ: 00.000.000/0000-00
                                                value = value.substring(0, 14);
                                                value = value.replace(/(\d{2})(\d)/, '$1.$2');
                                                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                                value = value.replace(/(\d{3})(\d)/, '$1/$2');
                                                value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
                                            }

                                            updateFormData('documentNumber', value);
                                        }}
                                        placeholder={formData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.documentType === 'cpf'
                                            ? 'Digite o CPF do proprietário (11 dígitos)'
                                            : 'Digite o CNPJ da empresa (14 dígitos)'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            <MapPin className="inline h-5 w-5 mr-2" />
                            Endereço da Loja
                        </h3>

                        {/* CEP - Primeiro campo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                CEP *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.zipCode}
                                    onChange={(e) => handleCepChange(e.target.value)}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                {cepLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
                                    </div>
                                )}
                            </div>
                            {cepError && (
                                <p className="text-red-400 text-sm mt-1">{cepError}</p>
                            )}
                            <p className="text-gray-400 text-xs mt-1">
                                Digite o CEP para preencher automaticamente o endereço
                            </p>
                        </div>

                        {/* Endereço Completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Endereço Completo
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => updateFormData('address', e.target.value)}
                                placeholder="Rua, número, complemento"
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <p className="text-gray-400 text-xs mt-1">
                                Adicione o número e complemento se necessário
                            </p>
                        </div>

                        {/* Cidade e Estado */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Cidade *
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => updateFormData('city', e.target.value)}
                                    placeholder="São Paulo"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Estado *
                                </label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => updateFormData('state', e.target.value.toUpperCase())}
                                    placeholder="SP"
                                    maxLength={2}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            <Palette className="inline h-5 w-5 mr-2" />
                            Personalização Visual
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Logo da Loja
                            </label>
                            <div className="flex items-center gap-4">
                                {formData.logoFile ? (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-700">
                                        <img
                                            src={URL.createObjectURL(formData.logoFile)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => updateFormData('logoFile', null)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                                        <Upload className="h-8 w-8 text-gray-500" />
                                        <span className="text-xs text-gray-500 mt-1">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400">
                                        Envie uma imagem quadrada (recomendado 512x512px)
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Formatos: JPG, PNG. Máximo 2MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Cor Primária
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={(e) => updateFormData('primaryColor', e.target.value)}
                                        className="h-12 w-20 rounded border-2 border-gray-700 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.primaryColor}
                                        onChange={(e) => updateFormData('primaryColor', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Cor Secundária
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.secondaryColor}
                                        onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                                        className="h-12 w-20 rounded border-2 border-gray-700 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.secondaryColor}
                                        onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-3">Preview:</p>
                            <div
                                className="p-6 rounded-lg text-white text-center font-bold text-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`
                                }}
                            >
                                {formData.storeName || 'Sua Loja'}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Configurações de Negócio
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Horário de Abertura
                                </label>
                                <input
                                    type="time"
                                    value={formData.openingTime}
                                    onChange={(e) => updateFormData('openingTime', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Horário de Fechamento
                                </label>
                                <input
                                    type="time"
                                    value={formData.closingTime}
                                    onChange={(e) => updateFormData('closingTime', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Taxa de Entrega (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.deliveryFee}
                                    onChange={(e) => updateFormData('deliveryFee', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Pedido Mínimo (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.minimumOrder}
                                    onChange={(e) => updateFormData('minimumOrder', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mt-6">
                            <h4 className="text-blue-400 font-semibold mb-2">🎉 Período de Trial Gratuito</h4>
                            <p className="text-sm text-gray-300">
                                Sua loja terá 14 dias de teste gratuito para experimentar todas as funcionalidades!
                            </p>
                        </div>

                        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6 mt-6">
                            <h4 className="text-white font-semibold mb-3">Resumo da Loja:</h4>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-400">Nome:</span> <span className="text-white font-medium">{formData.storeName}</span></p>
                                <p><span className="text-gray-400">URL:</span> <span className="text-orange-500">/{formData.subdomain}</span></p>
                                <p><span className="text-gray-400">Localização:</span> <span className="text-white">{formData.city}, {formData.state}</span></p>
                                <p><span className="text-gray-400">Horário:</span> <span className="text-white">{formData.openingTime} - {formData.closingTime}</span></p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 text-orange-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Criando sua loja...</h2>
                    <p className="text-gray-400">Aguarde enquanto configuramos tudo para você 🚀</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para Marketplace
                    </button>

                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-3">
                        Cadastre sua Loja
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Configure sua loja em poucos passos e comece a vender!
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex-1 relative">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isActive
                                                ? 'bg-orange-500 border-orange-500 text-white'
                                                : isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'bg-gray-800 border-gray-700 text-gray-500'
                                                }`}
                                        >
                                            {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                                        </div>
                                        <p
                                            className={`mt-2 text-xs text-center hidden sm:block ${isActive || isCompleted ? 'text-white font-medium' : 'text-gray-500'
                                                }`}
                                        >
                                            {step.title}
                                        </p>
                                    </div>

                                    {index < STEPS.length - 1 && (
                                        <div
                                            className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 transition-colors ${isCompleted ? 'bg-green-500' : 'bg-gray-700'
                                                }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Anterior
                        </button>

                        {currentStep < STEPS.length ? (
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2"
                            >
                                Próximo
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Criar Loja
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    Precisa de ajuda? Entre em contato: <a href="mailto:suporte@foodhub.com" className="text-orange-500 hover:underline">suporte@foodhub.com</a>
                </p>
            </div>
        </div>
    );
}
