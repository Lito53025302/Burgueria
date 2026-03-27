import { LucideIcon } from 'lucide-react';

export interface Reward {
  id: string;
  name: string;
  description: string;
  minPurchases: number; // Número mínimo de compras necessárias
  probability: number; // Probabilidade de 0 a 100
  icon: LucideIcon;
}

export interface UserRewards {
  purchaseCount: number;
  lastReward?: string;
  canSpin: boolean;
}
