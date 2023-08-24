import { useState, useEffect, useCallback } from 'react';
import { Direction, Coordinate } from '../types';

const initialSnake: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const initialFood: Coordinate = { x: 5, y: 5 };

const initialDirection: Direction = 'ArrowUp';

export const useGame = () => {
  const [snake, setSnake] = useState<Coordinate[]>(initialSnake);
  const [food, setFood] = useState<Coordinate>(initialFood);
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [isGameOver, setGameOver] = useState<boolean>(false);

  const startGame = useCallback(() => {
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection(initialDirection);
    setGameOver(false);
  }, []);

  const endGame = useCallback(() => {
    setGameOver(true);
  }, []);

  const moveSnake = useCallback(() => {
    if (isGameOver) return;

    const head = snake[0];
    let newHead: Coordinate;

    switch (direction) {
      case 'ArrowUp':
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case 'ArrowDown':
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case 'ArrowLeft':
        newHead = { x: head.x - 1, y: head.y };
        break;
      case 'ArrowRight':
        newHead = { x: head.x + 1, y: head.y };
        break;
    }

    if (newHead.x < 0 || newHead.y < 0 || newHead.x >= 20 || newHead.y >= 20 || snake.some(coord => coord.x === newHead.x && coord.y === newHead.y)) {
      endGame();
      return;
    }

    let newSnake = [...snake];

    if (newHead.x === food.x && newHead.y === food.y) {
      setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
    } else {
      newSnake.pop();
    }

    newSnake.unshift(newHead);
    setSnake(newSnake);
  }, [snake, direction, food, isGameOver, endGame]);

  const changeDirection = useCallback((newDirection: Direction) => {
    setDirection(newDirection);
  }, []);

  useEffect(() => {
    const interval = setInterval(moveSnake, 200);
    return () => clearInterval(interval);
  }, [moveSnake]);

  return {
    snake,
    food,
    direction,
    isGameOver,
    startGame,
    endGame,
    moveSnake,
    changeDirection,
  };
};
