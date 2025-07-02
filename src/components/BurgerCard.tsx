import { useState } from 'react';
import { Plus, Flame, Leaf } from 'lucide-react';
import { BurgerItem } from '../types';

interface BurgerCardProps {
  burger: BurgerItem;
  onAddToCart: (burger: BurgerItem) => void;
  onViewDetails: (burger: BurgerItem) => void;
}

const BurgerCard = ({ burger, onAddToCart, onViewDetails }: BurgerCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(burger);
    
    // Reset animation after 1 second
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const getSpiceIcon = () => {
    if (burger.spiceLevel === 'hot') return <Flame className="w-4 h-4 text-red-500" />;
    if (burger.category === 'veggie') return <Leaf className="w-4 h-4 text-green-500" />;
    return null;
  };

  return (
    <div
      className="group relative bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-yellow-500/10 hover:border-yellow-500/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={burger.image}
          alt={burger.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-lg shadow-lg">
          R$ {burger.price}
        </div>

        {/* Spice/Category Icon */}
        {getSpiceIcon() && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-2 rounded-full">
            {getSpiceIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
            {burger.name}
          </h3>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {burger.description}
        </p>

        {/* Ingredients Preview */}
        <div className="flex flex-wrap gap-1 mb-4">
          {burger.ingredients.slice(0, 3).map((ingredient, index) => (
            <span
              key={index}
              className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700"
            >
              {ingredient}
            </span>
          ))}
          {burger.ingredients.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{burger.ingredients.length - 3} mais
            </span>
          )}
        </div>

        {/* Calories */}
        {burger.calories && (
          <div className="text-xs text-gray-500 mb-4">
            {burger.calories} calorias
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 relative z-10">
          <button
            onClick={() => onViewDetails(burger)}
            className="flex-1 py-3 border border-gray-700 text-gray-300 font-medium rounded-xl transition-all duration-300 hover:border-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/5 active:scale-95 cursor-pointer"
          >
            Detalhes
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 active:scale-95 flex items-center gap-2 cursor-pointer ${
              isAdding ? 'animate-pulse' : ''
            }`}
          >
            <Plus className={`w-4 h-4 ${isAdding ? 'animate-spin' : ''}`} />
            {isAdding ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </div>

      {/* Hover Overlay - moved below content to avoid blocking clicks */}
      <div className={`absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 transition-opacity duration-500 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  );
};

export default BurgerCard;