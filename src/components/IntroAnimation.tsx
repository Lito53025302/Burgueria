import { useState, useEffect } from 'react';
import { ChefHat } from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Após 4 segundos, inicia o fade out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    // Após 5 segundos total, completa a introdução
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Vídeo de fundo simulado - Hambúrguer na brasa */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Simulação de vídeo com gradientes animados */}
        <div className="w-full h-full relative">
          {/* Fundo da brasa */}
          <div className="absolute inset-0 bg-gradient-radial from-orange-600/40 via-red-600/30 to-black animate-pulse"></div>
          
          {/* Efeito de fogo/brasa */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={`fire-${i}`}
                className="absolute bg-gradient-to-t from-yellow-500 via-orange-500 to-red-500 rounded-full opacity-70 animate-bounce"
                style={{
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 20 + 10}px`,
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 30}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 1 + 0.5}s`,
                  filter: 'blur(1px)'
                }}
              />
            ))}
          </div>

          {/* Hambúrguer sendo grelhado */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-80 h-80">
              {/* Grelha */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-72 h-4 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-lg shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>

              {/* Hambúrguer */}
              <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-64 h-16">
                {/* Pão inferior */}
                <div className="absolute bottom-0 w-full h-8 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-full shadow-xl"></div>
                
                {/* Carne */}
                <div className="absolute bottom-6 left-2 right-2 h-6 bg-gradient-to-b from-amber-800 to-amber-900 rounded-lg shadow-xl animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                </div>
                
                {/* Pão superior */}
                <div className="absolute bottom-10 left-1 right-1 h-8 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-full shadow-xl">
                  <div className="absolute top-1 left-8 w-3 h-3 bg-yellow-300 rounded-full opacity-60"></div>
                  <div className="absolute top-2 right-12 w-2 h-2 bg-yellow-300 rounded-full opacity-40"></div>
                </div>
              </div>

              {/* Vapor/Fumaça */}
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`steam-${i}`}
                    className="absolute w-2 h-8 bg-gradient-to-t from-white/30 to-transparent rounded-full animate-pulse blur-sm"
                    style={{
                      left: `${i * 8 - 28}px`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: '2s',
                      transform: `translateY(${Math.sin(i) * 5}px)`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Overlay escuro nas bordas */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
        </div>
      </div>

      {/* Logo central */}
      <div className="relative z-10 text-center">
        <div className="mb-8 animate-fade-in">
          <ChefHat className="w-20 h-20 mx-auto mb-6 text-yellow-400 animate-pulse" />
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
          GOURMET
        </h1>
        
        <p className="text-2xl text-gray-300 font-light animate-fade-in">
          Na brasa, como deve ser
        </p>
      </div>

      {/* Efeitos de luz ambiente */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-red-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default IntroAnimation;