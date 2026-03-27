import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Captura erros em qualquer componente filho e exibe uma UI amigável
 * ao invés de quebrar toda a aplicação.
 * 
 * Uso:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Atualiza o estado para exibir a UI de fallback
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log do erro para monitoramento
        logger.error('Error Boundary capturou um erro', error, {
            componentStack: errorInfo.componentStack,
            errorInfo: errorInfo
        });

        // Atualiza o estado com informações detalhadas
        this.setState({
            error,
            errorInfo
        });

        // TODO: Enviar para serviço de monitoramento (Sentry)
        // if (!import.meta.env.DEV) {
        //   Sentry.captureException(error, {
        //     contexts: {
        //       react: {
        //         componentStack: errorInfo.componentStack,
        //       },
        //     },
        //   });
        // }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Se foi fornecido um fallback customizado, usa ele
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // UI padrão de erro
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Oops! Algo deu errado</h1>
                                    <p className="text-red-100 mt-1">
                                        Encontramos um erro inesperado
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    O que aconteceu?
                                </h2>
                                <p className="text-gray-600">
                                    A aplicação encontrou um erro e não conseguiu continuar.
                                    Não se preocupe, seus dados estão seguros!
                                </p>
                            </div>

                            {/* Detalhes do erro (apenas em desenvolvimento) */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                        Detalhes técnicos (apenas em desenvolvimento):
                                    </h3>
                                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                                        <p className="text-sm font-mono text-red-800">
                                            {this.state.error.toString()}
                                        </p>
                                    </div>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-gray-600">
                                            <summary className="cursor-pointer font-semibold mb-2">
                                                Stack trace
                                            </summary>
                                            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Ações */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={this.handleReset}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Tentar Novamente</span>
                                </button>

                                <button
                                    onClick={this.handleReload}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Recarregar Página</span>
                                </button>

                                <button
                                    onClick={this.handleGoHome}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <Home className="w-5 h-5" />
                                    <span>Ir para Início</span>
                                </button>
                            </div>

                            {/* Informações adicionais */}
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>💡 Dica:</strong> Se o problema persistir, tente limpar o cache do navegador
                                    ou entre em contato com o suporte.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook para usar Error Boundary de forma funcional
 * Útil para componentes que precisam de error handling específico
 */
export const useErrorHandler = () => {
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return setError;
};
