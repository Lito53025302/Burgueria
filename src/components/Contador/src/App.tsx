import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import Confetti from './components/Confetti';

interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

type GameStatus = 'idle' | 'running' | 'stopped' | 'victory';

function App() {
  const [timer, setTimer] = useState<TimerState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const animationFrameRef = useRef<number>();

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
    
    // Check if stopped at exactly 1 minute (00:01:00)
    if (timer.minutes === 1 && timer.seconds === 0 && timer.milliseconds < 100) {
      setGameStatus('victory');
    }
  };

  const handleReset = () => {
    setTimer({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    setGameStatus('idle');
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
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
        return 'Click START to begin the timer. Your goal is to stop it at exactly 00:01:00!';
      case 'running':
        return 'Timer is running! Stop it at exactly 00:01:00 to win!';
      case 'stopped':
        return timer.minutes === 1 && timer.seconds === 0 && timer.milliseconds < 100
          ? 'Checking...'
          : 'Nice try! Click RESET to try again.';
      case 'victory':
        return 'PERFECT TIMING! You stopped at exactly 1 minute!';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {gameStatus === 'victory' && <Confetti />}
      
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 max-w-2xl w-full text-center shadow-2xl border border-white/20">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          Precision Timer
        </h1>
        <p className="text-white/80 mb-8 text-lg">
          Challenge your timing skills!
        </p>

        {/* Timer Display */}
        <div className="bg-black/30 rounded-2xl p-6 md:p-8 mb-8 border border-white/10">
          <div className="text-5xl md:text-7xl font-mono font-bold text-white mb-2 tracking-wider">
            {formatTime(timer)}
          </div>
          <div className="text-white/60 text-sm">
            HH:MM:SS:mmm
          </div>
        </div>

        {/* Victory Message */}
        {gameStatus === 'victory' && (
          <div className="mb-8 animate-pulse">
            <div className="text-6xl md:text-8xl font-bold text-yellow-400 mb-4 animate-bounce">
              VICTORY!
            </div>
            <div className="text-2xl text-white/90">
              🎉 Perfect timing! 🎉
            </div>
          </div>
        )}

        {/* Status Message */}
        <div className="mb-8 text-white/90 text-lg md:text-xl min-h-[3rem] flex items-center justify-center">
          {getStatusMessage()}
        </div>

        {/* Control Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {gameStatus === 'idle' && (
            <button
              onClick={handleStart}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
              START
            </button>
          )}

          {gameStatus === 'running' && (
            <button
              onClick={handleStop}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <Square className="w-6 h-6" />
              STOP
            </button>
          )}

          {(gameStatus === 'stopped' || gameStatus === 'victory') && (
            <button
              onClick={handleReset}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-6 h-6" />
              RESET
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 text-white/60 text-sm">
          <p className="mb-2">🎯 <strong>Goal:</strong> Stop the timer at exactly 00:01:00</p>
          <p className="mb-2">⏱️ <strong>Precision:</strong> Milliseconds matter!</p>
          <p>🎮 <strong>Challenge:</strong> One attempt per round</p>
        </div>
      </div>
    </div>
  );
}

export default App;