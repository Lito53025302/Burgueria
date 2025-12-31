import { Gamepad2 } from 'lucide-react';

interface RewardFloatingButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const RewardFloatingButton = ({ onClick, disabled }: RewardFloatingButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-[100] transition-all duration-300 group
        ${disabled
          ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
          : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:scale-110 hover:shadow-yellow-500/50 animate-bounce'
        }`}
      title={disabled ? 'Faça uma compra para liberar!' : 'JOGAR AGORA!'}
    >
      <Gamepad2 className="w-8 h-8 relative z-10" />

      {!disabled && (
        <>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />

          <div className="absolute right-full mr-4 bg-white text-black px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg arrow-right">
            🎁 PRÊMIO LIBERADO!
          </div>
        </>
      )}
    </button>
  );
};

export default RewardFloatingButton;
