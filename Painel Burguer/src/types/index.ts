export interface Customization {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  soldCount: number;
  createdAt: string;
  customizations?: Customization[];
  spiceLevel?: 'none' | 'suave' | 'medio' | 'forte' | 'extra_forte';
  prepTimeMin?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'awaiting_pickup' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedTime: number;
  address: string;
  paymentMethod: 'money' | 'card' | 'pix';
  changeFor?: string;
  motoboy_id?: string; // ID do motoboy que aceitou
  motoboyName?: string; // Nome do motoboy (opcional, se disponível)
  motoboy_arrived?: boolean; // Adicionado para refletir chegada do motoboy
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  dailyRevenue: number[];
  weeklyRevenue: number[];
  monthlyRevenue: number[];
  topSellingItems: MenuItem[];
  recentOrders: Order[];
}

export interface StoreStatus {
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}