import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CartItem } from '../types';
import Checkout from './Checkout';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  totalPrice: number;
  onOrderComplete?: (amount: number) => void;
}

import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { AuthModal } from './AuthModal';

const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onClearCart, totalPrice, onOrderComplete }: CartProps) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useCustomerAuth();

  const handleCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleOrderComplete = () => {
    const finalAmount = totalPrice;
    onClearCart();
    setIsCheckoutOpen(false);
    onClose(); // Fecha o sidebar do carrinho
    onOrderComplete?.(finalAmount); // Chama o callback se existir passando o valor
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Cart Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 z-50 shadow-2xl border-l border-gray-800 animate-slide-in-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-yellow-400" />
              Seu Pedido
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <div className="text-gray-400 mt-2">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Seu carrinho está vazio</h3>
              <p className="text-gray-500">Adicione alguns hambúrgueres deliciosos para começar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 hover:border-gray-600 transition-colors duration-300"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-400 mb-1">R$ {item.price.toFixed(2)} cada</p>

                      {/* Customizations */}
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-yellow-400 mb-1">Personalizações:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.customizations.map((customization, index) => (
                              <span
                                key={index}
                                className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full"
                              >
                                {customization}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-700 rounded transition-colors duration-300"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4 text-gray-300" />
                          </button>
                          <span className="text-white font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-700 rounded transition-colors duration-300"
                          >
                            <Plus className="w-4 h-4 text-gray-300" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-yellow-400">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-white">Total:</span>
              <span className="text-2xl font-bold text-yellow-400">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/25 active:scale-95"
            >
              Finalizar Pedido
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Taxa de entrega será calculada na finalização
            </p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={items}
        totalPrice={totalPrice}
        onOrderComplete={handleOrderComplete}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          // Se o usuário logou, abre o checkout automaticamente
          if (user) setIsCheckoutOpen(true);
        }}
      />
    </>
  );
};

export default Cart;