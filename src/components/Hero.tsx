import { Play } from 'lucide-react';
import { useStoreTenant } from '../hooks/useStoreTenant';

const Hero = () => {
  const { tenant } = useStoreTenant();

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Usar cores do tenant ou fallback
  const primaryColor = tenant?.primaryColor || '#FFA500';
  const secondaryColor = tenant?.secondaryColor || '#FF6347';
  const storeName = tenant?.name || 'GOURMET';
  const bannerUrl = tenant?.bannerUrl;
  const heroHeight = bannerUrl
    ? 'clamp(280px, 42vh, 420px)'
    : 'clamp(420px, 58vh, 620px)';

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        height: heroHeight,
        background: bannerUrl
          ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.72)), url(${bannerUrl}) center 35% / cover`
          : 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(0, 0, 0))'
      }}
    >
      {/* Video Background Simulation - só mostra se NÃO tiver banner */}
      {!bannerUrl && (
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full animate-pulse"
            style={{
              background: `linear-gradient(to right, ${primaryColor}33, ${secondaryColor}33, ${primaryColor}33)`
            }}
          ></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto py-5">
        <div className="mb-3 animate-fade-in">
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight"
            style={{
              color: primaryColor,
              textShadow: `
                0 0 20px rgba(255,255,255,0.9),
                0 0 40px rgba(255,255,255,0.6),
                2px 2px 4px rgba(0,0,0,0.8),
                -1px -1px 0 rgba(255,255,255,0.5),
                1px -1px 0 rgba(255,255,255,0.5),
                -1px 1px 0 rgba(255,255,255,0.5),
                1px 1px 0 rgba(255,255,255,0.5)
              `
            }}
          >
            {storeName.toUpperCase()}
            <br />
            <span
              className="text-xl md:text-3xl lg:text-4xl font-light"
              style={{
                color: 'white',
                textShadow: `
                  0 0 20px rgba(0,0,0,0.9),
                  0 0 10px ${primaryColor},
                  2px 2px 8px rgba(0,0,0,0.8)
                `
              }}
            >
              DELIVERY
            </span>
          </h1>
        </div>

        <p className="text-sm md:text-base lg:text-lg text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed animate-slide-up">
          Experimente os melhores hambúrgueres artesanais da cidade. Ingredientes premium, sabores marcantes, entregues frescos na sua porta.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-slide-up mb-4">
          <button
            onClick={scrollToMenu}
            className="group relative px-8 py-2.5 text-white font-bold text-sm md:text-base rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
            }}
          >
            <span className="relative z-10">PEÇA AGORA</span>
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"
              style={{
                background: `linear-gradient(to right, ${primaryColor}dd, ${secondaryColor}dd)`
              }}
            ></div>
          </button>

          <button className="flex items-center gap-2 px-5 py-2.5 border-2 text-white font-semibold text-sm md:text-base rounded-full transition-all duration-300 hover:shadow-lg"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = primaryColor;
              e.currentTarget.style.color = primaryColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = 'white';
            }}
          >
            <Play className="w-4 h-4" />
            Nossa História
          </button>
        </div>

        {/* Floating Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 animate-fade-in">
          <div className="text-center group">
            <div
              className="text-xl md:text-2xl font-bold mb-1 transition-transform duration-300 group-hover:scale-110"
              style={{ color: primaryColor }}
            >
              500+
            </div>
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Clientes Satisfeitos</div>
          </div>
          <div className="text-center group">
            <div
              className="text-xl md:text-2xl font-bold mb-1 transition-transform duration-300 group-hover:scale-110"
              style={{ color: primaryColor }}
            >
              25min
            </div>
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Tempo de Entrega</div>
          </div>
          <div className="text-center group">
            <div
              className="text-xl md:text-2xl font-bold mb-1 transition-transform duration-300 group-hover:scale-110"
              style={{ color: primaryColor }}
            >
              4.9★
            </div>
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Avaliação</div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
