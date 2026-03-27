export interface CustomizationOption {
  name: string;
  price: number;
}

export interface BurgerItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  ingredients: string[];
  calories?: number;
  spiceLevel?: 'mild' | 'medium' | 'hot';
  customizations?: CustomizationOption[];
}

export interface CartItem extends BurgerItem {
  quantity: number;
  customizations?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
  deliveryTime?: Date;
  address: string;
}