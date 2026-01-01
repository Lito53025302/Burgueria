import React, { useState, useEffect, useRef } from 'react';
import Confetti from './Confetti';
import { useState as useStateReact, useEffect as useEffectReact } from 'react';
import { getPremioDia } from '../lib/supabase';

interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

type GameStatus = 'idle' | 'running' | 'stopped' | 'victory';

interface ContadorGameProps {
  isOpen: boolean;
  onClose: () => void;
  canPlay?: boolean;
}

const ContadorGame: React.FC<ContadorGameProps> = ({ isOpen, onClose, canPlay }) => {
  const [premioDia, setPremioDia] = useStateReact<string | null>(null);

  useEffectReact(() => {
    if (isOpen) {
      getPremioDia().then(setPremioDia);
    }
  }, [isOpen]);
  const [timer, setTimer] = useState<TimerState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isOpen) {
      setTimer({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
      setGameStatus('idle');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isOpen]);

  const updateTimer = () => {
    if (gameStatus === 'running') {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
      const milliseconds = elapsed % 1000;
      setTimer({ hours, minutes, seconds, milliseconds });
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  };

  useEffect(() => {
    if (gameStatus === 'running') {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStatus, startTime]);

  const handleStart = () => {
    setStartTime(Date.now());
    setGameStatus('running');
  };

  const handleStop = () => {
    setGameStatus('stopped');
    if (timer.minutes === 1 && timer.seconds === 0 && timer.milliseconds < 100) {
      setGameStatus('victory');
    }
  };



  const formatTime = (time: TimerState) => {
    const h = time.hours.toString().padStart(2, '0');
    const m = time.minutes.toString().padStart(2, '0');
    const s = time.seconds.toString().padStart(2, '0');
    const ms = time.milliseconds.toString().padStart(3, '0');
    return `${h}:${m}:${s}:${ms}`;
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'idle':
        return 'Clique em INICIAR para começar. O objetivo é parar em exatamente 00:01:00!';
      case 'running':
        return 'Cronômetro rodando! Pare em exatamente 00:01:00 para ganhar!';
      case 'stopped':
        return 'Que pena! Não foi dessa vez. Tente novamente na próxima compra!';
      case 'victory':
        return 'PERFEITO! Você parou em exatamente 1 minuto!';
      default:
        return '';
    }
  };

  const handleFinish = () => {
    onClose(); // Fecha o modal e consome a tentativa (no App.tsx)
  };

  if (!isOpen || canPlay === false) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-gray-900/95 backdrop-blur-sm rounded-t-[2.5rem] md:rounded-3xl p-8 md:p-12 max-w-2xl w-full text-center shadow-2xl border-t md:border border-white/10 relative h-[90vh] md:h-auto overflow-y-auto animate-slide-up md:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {!['running'].includes(gameStatus) && (
          <button onClick={handleFinish} className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">×</button>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Precision Timer</h1>
        {premioDia && (
          <div className="mb-4 text-lg text-yellow-300 font-semibold">Prêmio do Dia: {premioDia}</div>
        )}
        <p className="text-white/80 mb-8 text-lg">Desafie sua precisão!</p>
        <div className="bg-black/30 rounded-2xl p-6 md:p-8 mb-8 border border-white/10">
          <div className={`text-5xl md:text-7xl font-mono font-bold mb-2 tracking-wider ${gameStatus === 'victory' ? 'text-green-400' : gameStatus === 'stopped' ? 'text-red-400' : 'text-white'}`}>
            {formatTime(timer)}
          </div>
          <div className="text-white/60 text-sm">HH:MM:SS:mmm</div>
        </div>
        {gameStatus === 'victory' && <Confetti />}
        {gameStatus === 'victory' && (
          <div className="mb-8 animate-pulse">
            <div className="text-6xl md:text-8xl font-bold text-yellow-400 mb-4 animate-bounce">VITÓRIA!</div>
            <div className="text-2xl text-white/90">🎉 Parabéns! Você ganhou o prêmio! 🎉</div>
            <div className="text-sm text-yellow-200 mt-2">Tire um print e mostre ao atendente ou aguarde no seu próximo pedido.</div>
          </div>
        )}
        <div className="mb-8 text-white/90 text-lg md:text-xl min-h-[3rem] flex items-center justify-center">
          {getStatusMessage()}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {gameStatus === 'idle' && (
            <button onClick={handleStart} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">INICIAR</button>
          )}
          {gameStatus === 'running' && (
            <button onClick={handleStop} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">PARAR</button>
          )}
          {(gameStatus === 'stopped' || gameStatus === 'victory') && (
            <button onClick={handleFinish} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
              {gameStatus === 'victory' ? 'RESGATAR (Fechar)' : 'FECHAR'}
            </button>
          )}
        </div>
        <div className="mt-8 text-white/60 text-sm">
          <p className="mb-2">🎯 <strong>Objetivo:</strong> Parar o cronômetro em exatamente 00:01:00</p>
          <p className="mb-2">⏱️ <strong>Precisão:</strong> Milissegundos contam!</p>
          <p className="text-yellow-400 font-bold">⚠️ ATENÇÃO: Apenas uam tentativa por compra!</p>
        </div>
      </div>
    </div>
  );
};

export default ContadorGame;
