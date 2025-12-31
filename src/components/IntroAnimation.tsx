import { useState, useEffect, useRef } from 'react';
import { ChefHat, SkipForward } from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Mostra botão skip após 1 segundo
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 1000);

    // Após o vídeo terminar ou 5 segundos, inicia o fade out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 5000);

    // Após 6 segundos total, completa a introdução
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleVideoEnd = () => {
    // Quando o vídeo terminar, fade out automaticamente
    setFadeOut(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>

      {/* Vídeo de fundo - Hambúrguer sendo montado */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      >
        <source src="/intro-video.MP4" type="video/mp4" />
        Seu navegador não suporta vídeos.
      </video>

      {/* Overlay escuro para melhor contraste com o texto */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Logo e texto central */}
      <div className="relative z-10 text-center px-4">
        <div className="mb-8 animate-fade-in">
          <ChefHat className="w-20 h-20 mx-auto mb-6 text-yellow-400 animate-pulse drop-shadow-2xl" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse drop-shadow-2xl">
          GOURMET
        </h1>

        <p className="text-xl md:text-2xl text-white font-light animate-fade-in drop-shadow-2xl">
          Hambúrgueres Artesanais
        </p>
      </div>

      {/* Botão Skip no canto superior direito */}
      {showSkip && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-20 flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 animate-fade-in"
        >
          <SkipForward className="w-5 h-5" />
          <span className="hidden sm:inline">Pular</span>
        </button>
      )}

      {/* Efeitos de luz ambiente para dar profundidade */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default IntroAnimation;