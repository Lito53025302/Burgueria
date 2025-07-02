import { useState, useEffect } from 'react';
import { UserRewards, Reward } from '../types/rewards';

const STORAGE_KEY = 'burger_rewards';

export const useRewards = () => {
  const [userRewards, setUserRewards] = useState<UserRewards>({
    purchaseCount: 0,
    canSpin: false
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUserRewards(data);
      } catch (error) {
        console.error('Erro ao carregar recompensas:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage
  const saveRewards = (rewards: UserRewards) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards));
    setUserRewards(rewards);
  };

  // Adicionar uma compra
  const addPurchase = () => {
    const newRewards: UserRewards = {
      ...userRewards,
      purchaseCount: userRewards.purchaseCount + 1,
      canSpin: (userRewards.purchaseCount + 1) % 5 === 0 // Exemplo: pode girar a cada 5 compras
    };
    saveRewards(newRewards);
  };

  // Resgatar recompensa
  const redeemReward = () => {
    const newRewards: UserRewards = {
      ...userRewards,
      canSpin: false
    };
    saveRewards(newRewards);
  };

  return {
    userRewards,
    addPurchase,
    redeemReward
  };
};
