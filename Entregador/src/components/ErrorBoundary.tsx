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
 * Error Boundary Component - App Entregador
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
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error('Error Boundary capturou um erro no App Entregador', error, {
            componentStack: errorInfo.componentStack,
            errorInfo: errorInfo
        });

        this.setState({
            error,
            errorInfo
        });
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
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Ops! Erro</h1>
                                    <p className="text-green-100 text-sm">Algo deu errado</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-gray-600 mb-6">
                                O aplicativo encontrou um erro. Não se preocupe,
                                você pode tentar novamente.
                            </p>

                            {/* Detalhes do erro (apenas em desenvolvimento) */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
                                    <p className="text-xs font-mono text-red-800">
                                        {this.state.error.toString()}
                                    </p>
                                </div>
                            )}

                            {/* Ações */}
                            <div className="space-y-2">
                                <button
                                    onClick={this.handleReset}
                                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Tentar Novamente</span>
                                </button>

                                <button
                                    onClick={this.handleReload}
                                    className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Recarregar App</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
