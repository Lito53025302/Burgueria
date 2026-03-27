import { useState, useCallback, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BurgerItem } from '../types';
import BurgerCard from './BurgerCard';
import BurgerModal from './BurgerModal';
import { logger } from '../utils/logger';
import { useStoreTenant } from '../hooks/useStoreTenant';

interface MenuProps {
  onAddToCart: (burger: BurgerItem, quantity?: number, customizations?: string[]) => void;
}

type MenuItemRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  customizations?: string[];
};

const Menu = ({ onAddToCart }: MenuProps) => {
  const { tenant } = useStoreTenant();
  const primaryColor = tenant?.primaryColor || '#facc15';
  const secondaryColor = tenant?.secondaryColor || '#f97316';
  const [products, setProducts] = useState<BurgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBurger, setSelectedBurger] = useState<BurgerItem | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      // Se não tiver tenant, não busca nada
      if (!tenant?.id) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('tenant_id', tenant.id)  // ✅ FILTRO CRÍTICO - Isolar por tenant
          .eq('available', true)
          .order('name');

        if (error) throw error;

        if (data) {
          const mappedProducts: BurgerItem[] = data.map((item) => {
            const row = item as MenuItemRow;
            return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            image: row.image,
            category: row.category.toLowerCase(),
            ingredients: [],
            calories: 0,
            spiceLevel: 'mild',
            customizations: row.customizations || []
          };
          });
          setProducts(mappedProducts);
        }
      } catch (error) {
        logger.error('Erro ao buscar produtos', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [tenant?.id]);

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
    <section id="menu" className="pt-8 pb-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search and Filter */}
        <div className="mb-10">
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300"
              style={{
                borderColor: 'rgba(55, 65, 81, 1)',
                boxShadow: searchTerm ? `0 0 0 1px ${primaryColor}55` : undefined
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {dynamicCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'text-black shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 border border-gray-700'
                }`}
                style={activeCategory === category.id
                  ? { background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }
                  : undefined}
                onMouseEnter={(e) => {
                  if (activeCategory !== category.id) {
                    e.currentTarget.style.borderColor = primaryColor;
                    e.currentTarget.style.color = primaryColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== category.id) {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.color = '';
                  }
                }}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: primaryColor }} />
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
