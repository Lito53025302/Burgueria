import { useState, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { burgerData } from '../data/burgers';
import { BurgerItem } from '../types';
import BurgerCard from './BurgerCard';
import BurgerModal from './BurgerModal';

interface MenuProps {
  onAddToCart: (burger: BurgerItem, quantity?: number, customizations?: string[]) => void;
}

const categories = [
  { id: 'all', name: 'Todos', count: burgerData.length },
  { id: 'signature', name: 'Especiais', count: burgerData.filter(b => b.category === 'signature').length },
  { id: 'classic', name: 'Clássicos', count: burgerData.filter(b => b.category === 'classic').length },
  { id: 'veggie', name: 'Vegetarianos', count: burgerData.filter(b => b.category === 'veggie').length },
  { id: 'sides', name: 'Acompanhamentos', count: burgerData.filter(b => b.category === 'sides').length },
  { id: 'drinks', name: 'Bebidas', count: burgerData.filter(b => b.category === 'drinks').length },
];

const Menu = ({ onAddToCart }: MenuProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBurger, setSelectedBurger] = useState<BurgerItem | null>(null);

  const handleAddToCart = useCallback((burger: BurgerItem, quantity: number = 1, customizations?: string[]) => {
    onAddToCart(burger, quantity, customizations);
  }, [onAddToCart]);

  const filteredBurgers = burgerData.filter(burger => {
    const matchesCategory = activeCategory === 'all' || burger.category === activeCategory;
    const matchesSearch = burger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         burger.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Cardápio
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Perfeição artesanal em cada mordida. Descubra nossa coleção exclusiva de hambúrgueres gourmet.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-yellow-500 hover:text-yellow-400'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBurgers.map((burger, index) => (
            <div
              key={burger.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <BurgerCard
                burger={burger}
                onAddToCart={handleAddToCart}
                onViewDetails={setSelectedBurger}
              />
            </div>
          ))}
        </div>

        {filteredBurgers.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Nenhum item encontrado</h3>
            <p className="text-gray-500">Tente ajustar sua busca ou filtros</p>
          </div>
        )}
      </div>

      {/* Burger Details Modal */}
      {selectedBurger && (
        <BurgerModal
          burger={selectedBurger}
          onClose={() => setSelectedBurger(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
};

export default Menu;