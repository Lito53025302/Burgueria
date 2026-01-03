import { X, Plus, Minus, Flame, Leaf, Clock, ChefHat } from 'lucide-react';
import { useState } from 'react';
import { BurgerItem } from '../types';

interface BurgerModalProps {
  burger: BurgerItem;
  onClose: () => void;
  onAddToCart: (burger: BurgerItem, quantity: number, customizations?: string[]) => void;
}

const BurgerModal = ({ burger, onClose, onAddToCart }: BurgerModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);

  // Opções de personalização baseadas na categoria ou no que vem do banco de dados
  const getCustomizationOptions = () => {
    // Se o item já tiver customizações cadastradas no banco de dados, use apenas elas
    if (burger.customizations && burger.customizations.length > 0) {
      return burger.customizations;
    }

    // Fallback: se não tiver nada no banco, usa a lógica antiga do sistema
    const baseOptions = [
      { name: 'Maionese Extra', price: 2.00 },
      { name: 'Ketchup Extra', price: 1.50 },
      { name: 'Mostarda', price: 1.50 },
      { name: 'Molho Barbecue', price: 2.50 },
      { name: 'Molho Picante', price: 2.00 },
    ];

    if (burger.category.toLowerCase().includes('hamb') ||
      burger.category.toLowerCase().includes('burguer') ||
      burger.category === 'signature' ||
      burger.category === 'classic') {
      return [
        ...baseOptions,
        { name: 'Bacon Extra', price: 8.00 },
        { name: 'Queijo Extra', price: 5.00 },
        { name: 'Cebola Caramelizada', price: 4.00 },
        { name: 'Picles Extra', price: 2.00 },
        { name: 'Alface Extra', price: 1.50 },
        { name: 'Tomate Extra', price: 2.00 },
        { name: 'Cebola Roxa', price: 2.50 },
      ];
    }

    if (burger.category.toLowerCase().includes('veggie') ||
      burger.category.toLowerCase().includes('vege')) {
      return [
        ...baseOptions.filter(opt => !opt.name.includes('Barbecue')),
        { name: 'Abacate Extra', price: 6.00 },
        { name: 'Queijo Vegano', price: 7.00 },
        { name: 'Brotos Extra', price: 3.00 },
        { name: 'Rúcula', price: 2.50 },
        { name: 'Tomate Seco', price: 4.00 },
      ];
    }

    if (burger.category.toLowerCase().includes('side') ||
      burger.category.toLowerCase().includes('acompanhamento') ||
      burger.category.toLowerCase().includes('petisco')) {
      return [
        { name: 'Queijo Cheddar', price: 4.00 },
        { name: 'Bacon Bits', price: 6.00 },
        { name: 'Molho Ranch', price: 2.50 },
        { name: 'Pimenta Calabresa', price: 1.50 },
        { name: 'Ervas Extras', price: 2.00 },
      ];
    }

    return baseOptions;
  };

  const customizationOptions = getCustomizationOptions();

  const toggleCustomization = (customization: string) => {
    setSelectedCustomizations(prev =>
      prev.includes(customization)
        ? prev.filter(item => item !== customization)
        : [...prev, customization]
    );
  };

  const getCustomizationPrice = () => {
    return selectedCustomizations.reduce((total, customization) => {
      const option = customizationOptions.find(opt => opt.name === customization);
      return total + (option?.price || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return (burger.price + getCustomizationPrice()) * quantity;
  };

  const handleAddToCart = () => {
    onAddToCart(burger, quantity, selectedCustomizations);
    onClose();
  };

  const getSpiceIcon = () => {
    if (burger.spiceLevel === 'hot') return <Flame className="w-5 h-5 text-red-500" />;
    if (burger.category === 'veggie') return <Leaf className="w-5 h-5 text-green-500" />;
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-end md:items-center justify-center overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-t-[2rem] md:rounded-3xl w-full max-w-4xl h-[92vh] md:h-auto md:max-h-[95vh] overflow-y-auto shadow-2xl border-t md:border border-gray-800 animate-slide-up md:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          <img
            src={burger.image}
            alt={burger.name}
            className="w-full h-56 md:h-80 object-cover rounded-t-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent rounded-t-3xl"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 bg-black/50 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/70 transition-colors duration-300"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
            <div className="flex items-center gap-3 mb-3">
              {getSpiceIcon()}
              <span className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-lg">
                R$ {burger.price}
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">{burger.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            {burger.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {burger.calories && (
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div className="text-yellow-400 font-bold text-xl">{burger.calories}</div>
                <div className="text-gray-400 text-sm">Calorias</div>
              </div>
            )}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <div className="text-yellow-400 font-bold text-xl flex items-center gap-2">
                <Clock className="w-5 h-5" />
                15-20
              </div>
              <div className="text-gray-400 text-sm">Tempo de Preparo (min)</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <div className="text-yellow-400 font-bold text-xl capitalize">
                {burger.spiceLevel === 'hot' ? 'Picante' : burger.spiceLevel === 'medium' ? 'Médio' : 'Suave'}
              </div>
              <div className="text-gray-400 text-sm">Nível de Picância</div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ingredientes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {burger.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 border border-gray-700 p-3 rounded-xl text-gray-300 text-center font-medium hover:border-yellow-500/50 transition-colors duration-300"
                >
                  {ingredient}
                </div>
              ))}
            </div>
          </div>

          {/* Customizations */}
          {burger.category !== 'drinks' && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ChefHat className="w-6 h-6 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white">Personalize seu pedido</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {customizationOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => toggleCustomization(option.name)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 ${selectedCustomizations.includes(option.name)
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                      : 'bg-gray-800/30 border-gray-700 text-gray-300 hover:border-yellow-500/50'
                      } border`}
                  >
                    <div className="font-medium mb-1">{option.name}</div>
                    <div className="text-sm opacity-75">+ R$ {option.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex items-center justify-between p-6 bg-gray-800/30 rounded-2xl border border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-white font-semibold">Quantidade:</span>
              <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-300"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4 text-gray-300" />
                </button>
                <span className="text-white font-bold text-lg min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-300"
                >
                  <Plus className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`px-8 py-4 bg-gradient-to-r ${'from-yellow-500 to-orange-500'
                } text-black font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 active:scale-95 flex items-center justify-center gap-3 w-full md:w-auto`}
            >
              <>
                <Plus className="w-5 h-5" />
                Adicionar R$ {getTotalPrice().toFixed(2)}
              </>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BurgerModal;