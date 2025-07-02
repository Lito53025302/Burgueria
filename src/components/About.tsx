import { ChefHat, Clock, Award, UtensilsCrossed } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Nossa História
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Desde 2015 servindo os melhores hambúrgueres artesanais com paixão e dedicação
          </p>
        </div>

        {/* Grid de recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* História */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
            <ChefHat className="w-12 h-12 text-yellow-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Tradição Artesanal</h3>
            <p className="text-gray-300 leading-relaxed">
              Nossa jornada começou em uma pequena cozinha com um sonho: criar os hambúrgueres mais saborosos da cidade. 
              Hoje, mantemos a mesma dedicação artesanal, selecionando os melhores ingredientes e criando receitas únicas.
            </p>
          </div>

          {/* Processo */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
            <UtensilsCrossed className="w-12 h-12 text-yellow-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Processo Único</h3>
            <p className="text-gray-300 leading-relaxed">
              Cada hambúrguer é preparado na hora, com blend exclusivo de carnes selecionadas, 
              molhos caseiros e ingredientes frescos. Nossa equipe é treinada para garantir a 
              perfeição em cada detalhe.
            </p>
          </div>

          {/* Qualidade */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
            <Award className="w-12 h-12 text-yellow-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Reconhecimento</h3>
            <p className="text-gray-300 leading-relaxed">
              Premiados como "Melhor Hambúrguer" por 3 anos consecutivos, nossa dedicação à 
              qualidade e inovação nos tornou referência na gastronomia local, com clientes 
              fiéis e críticos gastronômicos.
            </p>
          </div>

          {/* Compromisso */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
            <Clock className="w-12 h-12 text-yellow-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Compromisso</h3>
            <p className="text-gray-300 leading-relaxed">
              Nosso compromisso é proporcionar não apenas uma refeição, mas uma experiência 
              gastronômica completa. Da preparação ao serviço, mantemos o padrão de excelência 
              que nos tornou famosos.
            </p>
          </div>
        </div>

        {/* Números */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center group">
            <div className="text-4xl font-bold text-yellow-400 mb-2 transition-transform duration-300 group-hover:scale-110">
              10+
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider">Anos de Experiência</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-yellow-400 mb-2 transition-transform duration-300 group-hover:scale-110">
              50k+
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider">Clientes Satisfeitos</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-yellow-400 mb-2 transition-transform duration-300 group-hover:scale-110">
              20+
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider">Receitas Exclusivas</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-yellow-400 mb-2 transition-transform duration-300 group-hover:scale-110">
              4.9
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider">Avaliação Média</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
