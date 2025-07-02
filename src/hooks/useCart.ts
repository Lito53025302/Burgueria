import { useState, useCallback, useMemo } from 'react';
import { CartItem, BurgerItem } from '../types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const getCustomizationPrice = useCallback((customizations: string[] = []) => {
    const prices: { [key: string]: number } = {
      'Maionese Extra': 2.00,
      'Ketchup Extra': 1.50,
      'Mostarda': 1.50,
      'Molho Barbecue': 2.50,
      'Molho Picante': 2.00,
      'Bacon Extra': 8.00,
      'Queijo Extra': 5.00,
      'Cebola Caramelizada': 4.00,
      'Picles Extra': 2.00,
      'Alface Extra': 1.50,
      'Tomate Extra': 2.00,
      'Cebola Roxa': 2.50,
      'Abacate Extra': 6.00,
      'Queijo Vegano': 7.00,
      'Brotos Extra': 3.00,
      'Rúcula': 2.50,
      'Tomate Seco': 4.00,
      'Queijo Cheddar': 4.00,
      'Bacon Bits': 6.00,
      'Molho Ranch': 2.50,
      'Pimenta Calabresa': 1.50,
      'Ervas Extras': 2.00,
    };

    return customizations.reduce((total, item) => total + (prices[item] || 0), 0);
  }, []);

  const addToCart = useCallback((item: BurgerItem, quantity: number = 1, customizations?: string[]) => {
    setCartItems(prev => {
      // Se tiver personalizações, sempre adiciona como um novo item com ID único
      if (customizations && customizations.length > 0) {
        const customizationPrice = getCustomizationPrice(customizations);
        const uniqueId = `${item.id}-${Date.now()}-${Math.random()}`;
        return [...prev, { 
          ...item, 
          id: uniqueId, // ID único para itens personalizados
          quantity,
          customizations,
          price: item.price + customizationPrice // Atualiza o preço com as personalizações
        }];
      }

      // Se não tiver personalizações, verifica se já existe o item básico
      const existingItem = prev.find(cartItem => 
        cartItem.id === item.id && (!cartItem.customizations || cartItem.customizations.length === 0)
      );
      
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id && (!cartItem.customizations || cartItem.customizations.length === 0)
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      
      return [...prev, { ...item, quantity }];
    });
  }, [getCustomizationPrice]);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const basePrice = item.price * item.quantity;
      return sum + basePrice;
    }, 0);
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isOpen,
    toggleCart,
    totalItems,
    totalPrice
  };
};