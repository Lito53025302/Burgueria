import { useState } from 'react';
import { X, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name,
                            phone,
                        }
                    }
                });

                if (error) {
                    console.error('Erro no SignUp:', error);
                    throw error;
                }

                if (data.user && data.session === null) {
                    alert('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
                } else {
                    alert('Cadastro realizado com sucesso!');
                }

                setIsLogin(true);
            }
            onClose();
        } catch (err: any) {
            console.error('Erro detalhado:', err);
            setError(err.message || 'Ocorreu um erro na autenticação. Verifique os dados ou as configurações do banco.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 border-t md:border border-gray-800 w-full max-w-md rounded-t-[2rem] md:rounded-3xl overflow-hidden shadow-2xl animate-slide-up md:animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-8">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {isLogin ? 'Bem-vindo de volta!' : 'Criar sua conta'}
                        </h2>
                        <p className="text-gray-400">
                            {isLogin ? 'Entre para finalizar seu pedido com segurança' : 'Cadastre-se para acompanhar seus pedidos'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Seu Nome Completo"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="tel"
                                        placeholder="Seu WhatsApp"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500 transition-all outline-none"
                                    />
                                </div>
                            </>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500 transition-all outline-none"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                placeholder="Sua senha secreta"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500 transition-all outline-none"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'ENTRAR AGORA' : 'CRIAR CONTA'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-gray-400">
                        {isLogin ? (
                            <p>
                                Ainda não tem conta?{' '}
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className="text-yellow-500 font-bold hover:underline"
                                >
                                    Cadastre-se
                                </button>
                            </p>
                        ) : (
                            <p>
                                Já tem uma conta?{' '}
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className="text-yellow-500 font-bold hover:underline"
                                >
                                    Fazer Login
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
