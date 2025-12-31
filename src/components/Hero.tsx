import { ChefHat, Play } from 'lucide-react';

const Hero = () => {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-[80vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Video Background Simulation */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gradient-to-r from-yellow-600/20 via-red-600/20 to-orange-600/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto py-8">
        <div className="mb-4 animate-fade-in">
          <ChefHat className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 text-yellow-400 animate-bounce" />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent leading-tight">
            GOURMET
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl font-light text-white">HAMBURGUERIA</span>
          </h1>
        </div>

        <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed animate-slide-up">
          Experimente os melhores hambúrgueres artesanais da cidade. Ingredientes premium, sabores marcantes, entregues frescos na sua porta.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up mb-8">
          <button
            onClick={scrollToMenu}
            className="group relative px-10 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-base md:text-lg rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-yellow-500/25 active:scale-95"
          >
            <span className="relative z-10">PEÇA AGORA</span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          </button>

          <button className="flex items-center gap-3 px-6 py-3 border-2 border-white/30 text-white font-semibold text-sm md:text-base rounded-full transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400 hover:shadow-lg">
            <Play className="w-4 h-4" />
            Nossa História
          </button>
        </div>

        {/* Floating Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 animate-fade-in">
          <div className="text-center group">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1 transition-transform duration-300 group-hover:scale-110">500+</div>
            <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">Clientes Satisfeitos</div>
          </div>
          <div className="text-center group">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1 transition-transform duration-300 group-hover:scale-110">25min</div>
            <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">Tempo de Entrega</div>
          </div>
          <div className="text-center group">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1 transition-transform duration-300 group-hover:scale-110">4.9★</div>
            <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">Avaliação</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;