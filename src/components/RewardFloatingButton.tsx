import { Gamepad2 } from 'lucide-react';
import { UserRewards } from '../types/rewards';

interface RewardFloatingButtonProps {
  userRewards: UserRewards;
  onClick: () => void;
}

const RewardFloatingButton = ({ userRewards, onClick }: RewardFloatingButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 hover:scale-110"
      title="Jogar Snake - Divirta-se enquanto espera!"
    >
      <Gamepad2 className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold animate-pulse">
        🎮
      </span>
    </button>
  );
};

export default RewardFloatingButton;
