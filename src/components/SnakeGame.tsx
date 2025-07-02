import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import './SnakeGame.css';

interface SnakeGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const BOARD_SIZE = 30;

const SnakeGame: React.FC<SnakeGameProps> = ({ isOpen, onClose }) => {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake-high-score') || '0');
  });
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [topScores, setTopScores] = useState<{score: number, date: number}[]>([]);

  const gameLoopRef = useRef<number>();

  const initGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: 0 });
    setFood({ x: Math.floor(Math.random() * BOARD_SIZE) + 1, y: Math.floor(Math.random() * BOARD_SIZE) + 1 });
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      let head = { ...newSnake[0] };

      // Move head
      head.x += direction.x;
      head.y += direction.y;

      // Wrap around logic (tela infinita)
      if (head.x < 1) head.x = BOARD_SIZE;
      if (head.x > BOARD_SIZE) head.x = 1;
      if (head.y < 1) head.y = BOARD_SIZE;
      if (head.y > BOARD_SIZE) head.y = 1;

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 1;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake-high-score', newScore.toString());
          }
          return newScore;
        });
        setFood({
          x: Math.floor(Math.random() * BOARD_SIZE) + 1,
          y: Math.floor(Math.random() * BOARD_SIZE) + 1
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, highScore]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameStarted && ((typeof e.key === 'string' && e.key.startsWith('Arrow')) || e.key === ' ')) {
      setGameStarted(true);
    }

    switch (e.key) {
      case 'ArrowUp':
        if (direction.y !== 1) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (direction.y !== -1) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (direction.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x !== -1) setDirection({ x: 1, y: 0 });
        break;
      case ' ':
        if (gameOver) initGame();
        break;
    }
  }, [direction, gameOver, gameStarted, initGame]);

  const handleDirectionClick = (newDirection: { x: number; y: number }) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    setDirection(newDirection);
  };

  // Ranking e controle de permissão para jogar após compra
  const SNAKE_SCORES_KEY = 'burger_snake_scores';
  const CAN_PLAY_SNAKE_KEY = 'canPlaySnake';

  function saveScore(score: number) {
    const scores = JSON.parse(localStorage.getItem(SNAKE_SCORES_KEY) || '[]');
    scores.push({ score, date: Date.now() });
    // Mantém só os 10 últimos
    const lastScores = scores.slice(-10);
    localStorage.setItem(SNAKE_SCORES_KEY, JSON.stringify(lastScores));
  }

  function getTopScores() {
    const scores = JSON.parse(localStorage.getItem(SNAKE_SCORES_KEY) || '[]');
    return scores.sort((a: any, b: any) => b.score - a.score).slice(0, 3);
  }

  useEffect(() => {
    if (isOpen) {
      initGame();
    }
  }, [isOpen, initGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = window.setInterval(moveSnake, 125);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveSnake, gameStarted, gameOver]);

  // Ao encerrar o jogo, salva score se pode jogar e mostra ranking
  useEffect(() => {
    if (gameOver && score > 0 && localStorage.getItem(CAN_PLAY_SNAKE_KEY) === 'true') {
      saveScore(score);
      setTopScores(getTopScores());
      localStorage.setItem(CAN_PLAY_SNAKE_KEY, 'false');
    }
  }, [gameOver, score]);

  // Ao abrir o jogo, mostra ranking se não pode jogar
  useEffect(() => {
    if (isOpen && !gameStarted) {
      setTopScores(getTopScores());
    }
  }, [isOpen, gameStarted]);

  const renderBoard = () => {
    const board = [];
    for (let y = 1; y <= BOARD_SIZE; y++) {
      for (let x = 1; x <= BOARD_SIZE; x++) {
        let className = '';

        if (food.x === x && food.y === y) {
          className = 'food';
        } else {
          const snakeIndex = snake.findIndex(segment => segment.x === x && segment.y === y);
          if (snakeIndex !== -1) {
            className = snakeIndex === 0 ? 'head' : 'body';
          }
        }

        board.push(
          <div key={`${x}-${y}`} className={className}></div>
        );
      }
    }
    return board;
  };

  if (!isOpen) return null;

  return (
    <div className="snake-overlay">
      <div className="snake-modal">
        <button onClick={onClose} className="close-button">
          <X size={24} />
        </button>

        <div className="snake-wrapper">
          <div className="game-details">
            <span className="score">Score: {score}</span>
            <span className="high-score">High Score: {highScore}</span>
          </div>

          <div className="play-board">
            {renderBoard()}
          </div>

          <div className="game-instructions">
            {!gameStarted && !gameOver && (
              <p>Pressione as setas ou clique nos botões para começar!</p>
            )}
            {gameOver && (
              <div className="game-over">
                <p>Game Over! Pontuação: {score}</p>
                <button onClick={initGame} className="restart-btn">
                  Jogar Novamente (ou pressione Espaço)
                </button>
              </div>
            )}
          </div>

          <div className="controls">
            <button
              onClick={() => handleDirectionClick({ x: -1, y: 0 })}
              className="control-btn"
            >
              ←
            </button>
            <div className="vertical-controls">
              <button
                onClick={() => handleDirectionClick({ x: 0, y: -1 })}
                className="control-btn"
              >
                ↑
              </button>
              <button
                onClick={() => handleDirectionClick({ x: 0, y: 1 })}
                className="control-btn"
              >
                ↓
              </button>
            </div>
            <button
              onClick={() => handleDirectionClick({ x: 1, y: 0 })}
              className="control-btn"
            >
              →
            </button>
          </div>

          {/* Exibir ranking ao encerrar o jogo */}
          {gameOver && topScores.length > 0 && (
            <div className="snake-ranking">
              <h4>Ranking das últimas compras</h4>
              <ol>
                {topScores.map((item, idx) => (
                  <li key={idx}>
                    {idx + 1}º - {item.score} pontos
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
