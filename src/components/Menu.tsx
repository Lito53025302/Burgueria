import { useState, useCallback, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BurgerItem } from '../types';
import BurgerCard from './BurgerCard';
import BurgerModal from './BurgerModal';
import { logger } from '../utils/logger';

interface MenuProps {
  onAddToCart: (burger: BurgerItem, quantity?: number, customizations?: string[]) => void;
}

const Menu = ({ onAddToCart }: MenuProps) => {
  const [products, setProducts] = useState<BurgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBurger, setSelectedBurger] = useState<BurgerItem | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('name');

        if (error) throw error;

        if (data) {
          const mappedProducts: BurgerItem[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: item.category.toLowerCase(),
            ingredients: [],
            calories: 0,
            spiceLevel: 'mild',
            customizations: item.customizations || []
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        logger.error('Erro ao buscar produtos', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = useCallback((burger: BurgerItem, quantity: number = 1, customizations?: string[]) => {
    onAddToCart(burger, quantity, customizations);
  }, [onAddToCart]);

  const filteredBurgers = products.filter(burger => {
    const matchesCategory = activeCategory === 'all' || burger.category === activeCategory;
    const matchesSearch = burger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      burger.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Gerar categorias dinamicamente dos produtos
  const dynamicCategories = [
    { id: 'all', name: 'Todos', count: products.length },
    ...Array.from(new Set(products.map(p => p.category))).map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: products.filter(p => p.category === cat).length
    }))
  ];

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
            {dynamicCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeCategory === category.id
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-yellow-500 hover:text-yellow-400'
                  }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
            <p className="text-gray-400">Carregando cardápio...</p>
          </div>
        ) : (
          <>
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
          </>
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