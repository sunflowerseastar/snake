import React, { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { GameBoard, SnakePart, Food } from '../styles/GameStyles';

const Game: React.FC = () => {
  const { snake, food, direction, isGameOver, startGame, changeDirection } = useGame();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          if (direction !== 'ArrowDown') changeDirection('ArrowUp');
          break;
        case 'ArrowDown':
          if (direction !== 'ArrowUp') changeDirection('ArrowDown');
          break;
        case 'ArrowLeft':
          if (direction !== 'ArrowRight') changeDirection('ArrowLeft');
          break;
        case 'ArrowRight':
          if (direction !== 'ArrowLeft') changeDirection('ArrowRight');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, changeDirection]);

  useEffect(() => {
    if (isGameOver) {
      alert('Game Over!');
      startGame();
    }
  }, [isGameOver, startGame]);

  return (
    <GameBoard>
      {snake.map((part, index) => (
        <SnakePart key={index} style={{ gridRowStart: part.y, gridColumnStart: part.x }} />
      ))}
      <Food style={{ gridRowStart: food.y, gridColumnStart: food.x }} />
    </GameBoard>
  );
};

export default Game;
