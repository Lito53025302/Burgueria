import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { nameToSlug, isValidSubdomain } from '../utils/tenant';
import { logger } from '../utils/logger';
import { Store, User, Lock, Mail, Phone, MapPin } from 'lucide-react';

interface SignupFormData {
    storeName: string;
    subdomain: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
    ownerPhone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

interface TenantLookup {
    id: string;
}

interface CreatedTenant {
    id: string;
    subdomain: string;
}

export function StoreSignup() {
    const [formData, setFormData] = useState<SignupFormData>({
        storeName: '',
        subdomain: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerPhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState<string | null>(null);

    // Gerar subdomain automaticamente quando o nome da loja mudar
    const handleStoreNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            storeName: name,
            subdomain: nameToSlug(name)
        }));
    };

    const handleSubdomainChange = (subdomain: string) => {
        // Permitir apenas caracteres válidos
        const cleaned = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({ ...prev, subdomain: cleaned }));
    };

    const formatCep = (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 5) {
            return numbers;
        }
        return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    };

    const handleCepSearch = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');

        if (cleanCep.length !== 8) {
            setCepError('CEP deve ter 8 dígitos');
            return;
        }

        setCepLoading(true);
        setCepError(null);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

            if (!response.ok) {
                throw new Error('Erro ao buscar CEP');
            }

            const data = await response.json() as {
                cep?: string;
                logradouro?: string;
                localidade?: string;
                uf?: string;
                erro?: boolean;
            };

            if (data.erro) {
                setCepError('CEP não encontrado');
                return;
            }

            setFormData(prev => ({
                ...prev,
                address: data.logradouro || prev.address,
                city: data.localidade || prev.city,
                state: data.uf || prev.state,
                zipCode: formatCep(data.cep || cleanCep)
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar CEP';
            setCepError(message);
            logger.error('Erro ao buscar CEP', err);
        } finally {
            setCepLoading(false);
        }
    };

    const handleCepChange = (value: string) => {
        const formatted = formatCep(value);
        setFormData(prev => ({ ...prev, zipCode: formatted }));
        setCepError(null);

        const cleanCep = value.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            handleCepSearch(cleanCep);
        }
    };

    const validateForm = (): string | null => {
        if (!formData.storeName.trim()) return 'Nome da loja é obrigatório';
        if (!formData.subdomain.trim()) return 'Subdomain é obrigatório';
        if (!isValidSubdomain(formData.subdomain)) {
            return 'Subdomain inválido. Use apenas letras, números e hífens (3-30 caracteres)';
        }
        if (!formData.ownerName.trim()) return 'Nome do responsável é obrigatório';
        if (!formData.ownerEmail.trim()) return 'Email é obrigatório';
        if (!formData.ownerEmail.includes('@')) return 'Email inválido';
        if (formData.ownerPassword.length < 6) return 'Senha deve ter no mínimo 6 caracteres';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Verificar se subdomain já existe
            const { data: existingTenant } = await supabase
                .from('tenants')
                .select('id')
                .eq('subdomain', formData.subdomain)
                .single();
            const tenantLookup = existingTenant as TenantLookup | null;

            if (tenantLookup) {
                throw new Error('Este subdomain já está em uso. Escolha outro.');
            }

            // 2. Criar tenant (loja)
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .insert([{
                    name: formData.storeName,
                    subdomain: formData.subdomain,
                    slug: formData.subdomain,
                    owner_name: formData.ownerName,
                    owner_email: formData.ownerEmail,
                    owner_phone: formData.ownerPhone || null,
                    address: formData.address || null,
                    city: formData.city || null,
                    state: formData.state || null,
                    zip_code: formData.zipCode || null,
                    subscription_plan: 'trial',
                    subscription_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias trial
                    is_active: true
                }])
                .select()
                .single();

            if (tenantError) throw tenantError;

            const createdTenant = tenant as CreatedTenant;
            logger.info('Tenant criado', { tenantId: createdTenant.id, subdomain: createdTenant.subdomain });

            // 3. Criar usuário admin no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.ownerEmail,
                password: formData.ownerPassword,
                options: {
                    data: {
                        name: formData.ownerName,
                        tenant_id: createdTenant.id,
                        role: 'admin'
                    }
                }
            });

            if (authError) {
                // Se falhar criar usuário, deletar tenant
                await supabase.from('tenants').delete().eq('id', createdTenant.id);
                throw authError;
            }

            logger.info('Usuário admin criado', { userId: authData.user?.id });

            // 4. Profile será criado automaticamente pelo trigger handle_new_user()

            // 5. Sucesso!
            setStep('success');
            logger.info('Loja cadastrada com sucesso!', { tenantId: createdTenant.id });

        } catch (err) {
            logger.error('Erro ao cadastrar loja', err);
            setError(err instanceof Error ? err.message : 'Erro ao cadastrar loja. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-3">🎉 Loja Criada!</h1>
                    <p className="text-gray-600 mb-2">
                        Sua loja <strong>{formData.storeName}</strong> foi cadastrada com sucesso!
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Enviamos um email de confirmação para <strong>{formData.ownerEmail}</strong>
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-700 mb-2">🔗 Seu endereço:</p>
                        <p className="text-lg font-bold text-blue-600">
                            {formData.subdomain}.seusistema.com
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            (Em desenvolvimento: localhost:5173)
                        </p>
                    </div>

                    <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-3"
                    >
                        Fazer Login
                    </button>

                    <p className="text-xs text-gray-500">
                        ✨ Você tem 14 dias de trial grátis!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">🏪 Cadastrar Nova Loja</h1>
                    <p className="text-blue-100">
                        Crie sua loja em menos de 2 minutos. 14 dias grátis!
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Erro */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Informações da Loja */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Store className="h-5 w-5 text-blue-600" />
                            Informações da Loja
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Loja *
                            </label>
                            <input
                                type="text"
                                value={formData.storeName}
                                onChange={(e) => handleStoreNameChange(e.target.value)}
                                placeholder="Ex: Pizzaria do João"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subdomain * <span className="text-gray-500 text-xs">(gerado automaticamente)</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={formData.subdomain}
                                    onChange={(e) => handleSubdomainChange(e.target.value)}
                                    placeholder="pizzaria-joao"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <span className="text-gray-600">.seusistema.com</span>
                            </div>
                            {formData.subdomain && !isValidSubdomain(formData.subdomain) && (
                                <p className="text-xs text-red-600 mt-1">
                                    Use apenas letras minúsculas, números e hífens (3-30 caracteres)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Informações do Responsável */}
                    <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Dados do Responsável
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    value={formData.ownerName}
                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    placeholder="João Silva"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Telefone
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.ownerPhone}
                                        onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                                        placeholder="(11) 98765-4321"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.ownerEmail}
                                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                                    placeholder="joao@email.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.ownerPassword}
                                    onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Endereço (Opcional) */}
                    <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Endereço da Loja <span className="text-sm font-normal text-gray-500">(opcional)</span>
                        </h3>

                        <div>
                            <input
                                type="text"
                                value={formData.zipCode}
                                onChange={(e) => handleCepChange(e.target.value)}
                                placeholder="CEP (00000-000)"
                                maxLength={9}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {cepLoading && (
                                <div className="mt-2 text-sm text-gray-500">
                                    Buscando CEP...
                                </div>
                            )}
                            {cepError && (
                                <div className="mt-2 text-sm text-red-600">
                                    {cepError}
                                </div>
                            )}
                        </div>

                        <div>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Rua, número, bairro"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Cidade"
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="Estado"
                                maxLength={2}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Criando sua loja...
                            </>
                        ) : (
                            <>
                                <Store className="h-5 w-5" />
                                Criar Minha Loja Grátis
                            </>
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Já tem uma conta?{' '}
                        <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Fazer Login
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
