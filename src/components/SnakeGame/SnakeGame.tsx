import React, { useEffect, useRef } from 'react';
import './style.css';

interface SnakeGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canv = canvasRef.current;
    if (!canv) return;
    const ctx = canv.getContext('2d');
    if (!ctx) return;

    // Game variables
    const INITIAL_TAIL = 4;
    let fixedTail = false;
    let tileCount = 10;
    let gridSize = 400 / tileCount;
    const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };
    let velocity = { x: 0, y: 0 };
    let player = { x: INITIAL_PLAYER.x, y: INITIAL_PLAYER.y };
    let walls = false; // Deixa walls sempre falso para tela infinita
    let fruit = { x: 1, y: 1 };
    let trail: { x: number; y: number }[] = [];
    let tail = INITIAL_TAIL;
    let points = 0;
    let pointsMax = 0;
    let stopped = true;

    function reset() {
      if (!ctx || !canv) return;
      ctx.fillStyle = 'grey';
      ctx.fillRect(0, 0, canv.width, canv.height);
      tail = INITIAL_TAIL;
      points = 0;
      velocity.x = 0;
      velocity.y = 0;
      player.x = INITIAL_PLAYER.x;
      player.y = INITIAL_PLAYER.y;
      trail = [];
      trail.push({ x: player.x, y: player.y });
      stopped = true;
      randomFruit();
    }

    function randomFruit() {
      if (walls) {
        fruit.x = 1 + Math.floor(Math.random() * (tileCount - 2));
        fruit.y = 1 + Math.floor(Math.random() * (tileCount - 2));
      } else {
        fruit.x = Math.floor(Math.random() * tileCount);
        fruit.y = Math.floor(Math.random() * tileCount);
      }
    }

    function loop() {
      if (!ctx || !canv) return;
      ctx.fillStyle = 'rgba(40,40,40,0.8)';
      ctx.fillRect(0, 0, canv.width, canv.height);
      // Remover checagem de walls para não resetar ao bater na parede
      if (player.x < 0) player.x = tileCount - 1;
      if (player.x >= tileCount) player.x = 0;
      if (player.y < 0) player.y = tileCount - 1;
      if (player.y >= tileCount) player.y = 0;
      if (!stopped) {
        trail.push({ x: player.x, y: player.y });
        while (trail.length > tail) trail.shift();
      }
      ctx.fillStyle = 'green';
      for (let i = 0; i < trail.length - 1; i++) {
        ctx.fillRect(trail[i].x * gridSize + 1, trail[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
        if (!stopped && trail[i].x === player.x && trail[i].y === player.y) {
          reset();
        }
        ctx.fillStyle = 'lime';
      }
      ctx.fillRect(trail[trail.length - 1].x * gridSize + 1, trail[trail.length - 1].y * gridSize + 1, gridSize - 2, gridSize - 2);
      if (player.x === fruit.x && player.y === fruit.y) {
        if (!fixedTail) tail++;
        points++;
        if (points > pointsMax) pointsMax = points;
        randomFruit();
        while (trail.some(t => t.x === fruit.x && t.y === fruit.y)) {
          randomFruit();
        }
      }
      ctx.fillStyle = 'red';
      ctx.fillRect(fruit.x * gridSize + 1, fruit.y * gridSize + 1, gridSize - 2, gridSize - 2);
      ctx.fillStyle = 'white';
      ctx.font = 'bold small-caps 16px Helvetica';
      ctx.fillText('points: ' + points, 288, 40);
      ctx.fillText('top: ' + pointsMax, 292, 60);
      if (stopped) {
        ctx.fillStyle = 'rgba(250,250,250,0.8)';
        ctx.font = 'small-caps bold 14px Helvetica';
        ctx.fillText('press ARROW KEYS to START...', 24, 374);
      }
    }

    function keyPush(evt: KeyboardEvent) {
      switch (evt.keyCode) {
        case 37:
          if (velocity.x !== 1) { velocity.x = -1; velocity.y = 0; stopped = false; }
          evt.preventDefault();
          break;
        case 38:
          if (velocity.y !== 1) { velocity.x = 0; velocity.y = -1; stopped = false; }
          evt.preventDefault();
          break;
        case 39:
          if (velocity.x !== -1) { velocity.x = 1; velocity.y = 0; stopped = false; }
          evt.preventDefault();
          break;
        case 40:
          if (velocity.y !== -1) { velocity.x = 0; velocity.y = 1; stopped = false; }
          evt.preventDefault();
          break;
        case 32:
          velocity.x = 0; velocity.y = 0; stopped = true;
          evt.preventDefault();
          break;
        case 27:
          reset();
          evt.preventDefault();
          break;
      }
    }

    function handleAction(act: 'up' | 'down' | 'left' | 'right') {
      switch (act) {
        case 'left': if (velocity.x !== 1) { velocity.x = -1; velocity.y = 0; stopped = false; } break;
        case 'up': if (velocity.y !== 1) { velocity.x = 0; velocity.y = -1; stopped = false; } break;
        case 'right': if (velocity.x !== -1) { velocity.x = 1; velocity.y = 0; stopped = false; } break;
        case 'down': if (velocity.y !== -1) { velocity.x = 0; velocity.y = 1; stopped = false; } break;
      }
    }

    reset();
    document.addEventListener('keydown', keyPush);
    intervalRef.current = window.setInterval(() => {
      player.x += velocity.x;
      player.y += velocity.y;
      loop();
    }, 1000 / 8);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', keyPush);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Função para os botões
  const handleAction = (act: 'up' | 'down' | 'left' | 'right') => {
    const event = new KeyboardEvent('keydown', {
      keyCode:
        act === 'left' ? 37 :
        act === 'up' ? 38 :
        act === 'right' ? 39 :
        act === 'down' ? 40 : 0
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="snake-overlay">
      <div className="snake-modal">
        <button onClick={onClose} className="close-button">X</button>
        <div id="game-container">
          <canvas ref={canvasRef} className="game-canvas" width={400} height={400}></canvas>
        </div>
        <div className="keys">
          <button className="up arr" onClick={() => handleAction('up')}><span className="chevron up"></span></button><br />
          <button className="left arr" onClick={() => handleAction('left')}><span className="chevron left"></span></button>
          <button className="down arr" onClick={() => handleAction('down')}><span className="chevron down"></span></button>
          <button className="right arr" onClick={() => handleAction('right')}><span className="chevron right"></span></button>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
