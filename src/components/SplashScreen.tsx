import { useEffect, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Iniciar animação de subida após 800ms
        const startTimer = setTimeout(() => {
            setIsAnimating(true);
        }, 800);

        // Fade out após 1.8s
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 1800);

        // Completar após 2.2 segundos
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 2200);

        return () => {
            clearTimeout(startTimer);
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Logo animado */}
            <div
                className={`absolute flex items-center gap-4 transition-all duration-[1200ms] ease-out ${isAnimating
                        ? 'top-6 left-6 scale-[0.35] opacity-80' // Posição final (header)
                        : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100' // Posição inicial (centro)
                    }`}
            >
                {/* Ícone de garfo e faca */}
                <div className="relative">
                    <UtensilsCrossed
                        className={`w-20 h-20 text-orange-500 transition-all duration-1000 ${isAnimating ? 'rotate-0' : 'rotate-12'
                            }`}
                        strokeWidth={1.5}
                    />
                    {/* Brilho animado */}
                    {!isAnimating && (
                        <>
                            <div className="absolute inset-0 animate-pulse">
                                <UtensilsCrossed
                                    className="w-20 h-20 text-orange-400 opacity-50 blur-md"
                                    strokeWidth={1.5}
                                />
                            </div>
                            {/* Círculo de destaque */}
                            <div className="absolute inset-0 -m-4 rounded-full border-2 border-orange-500/30 animate-ping"></div>
                        </>
                    )}
                </div>

                {/* Texto FoodHub */}
                <div className="flex flex-col">
                    <h1 className={`font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent transition-all duration-1000 ${isAnimating ? 'text-3xl' : 'text-7xl'
                        }`}>
                        FoodHub
                    </h1>
                    {!isAnimating && (
                        <p className="text-gray-400 text-sm mt-1 animate-pulse">
                            Descubra as melhores lojas da região
                        </p>
                    )}
                </div>
            </div>

            {/* Partículas de fundo animadas */}
            {!isAnimating && (
                <>
                    {/* Partículas laranja */}
                    <div className="absolute top-20 left-20 w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
                    <div className="absolute top-40 right-32 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                    <div className="absolute bottom-32 left-40 w-2 h-2 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                    <div className="absolute bottom-20 right-20 w-3 h-3 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>

                    {/* Partículas vermelhas */}
                    <div className="absolute top-60 left-60 w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute top-32 right-40 w-3 h-3 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-40 left-32 w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>

                    {/* Círculos grandes de fundo */}
                    <div className="absolute top-10 right-10 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </>
            )}

            {/* Barra de progresso sutil */}
            {!isAnimating && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
                </div>
            )}

            {/* Adicionar keyframe para loading */}
            <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
        </div>
    );
}
