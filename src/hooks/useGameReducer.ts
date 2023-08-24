import { Dispatch, useReducer } from "react";

type Coordinate = { x: number; y: number };

// TODO make '20' (board size) a constant

export enum Direction {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
}

interface State {
  direction: Direction;
  food: Coordinate;
  isGameOver: boolean;
  isPaused: boolean;
  snake: Coordinate[];
}

type SnakeGameAction =
  | { type: "startGame" }
  | { type: "moveSnake" }
  | { type: "pause" }
  | { type: "changeDirection"; value: State["direction"] };

// TODO make snake start random
const initialSnake: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
];

// TODO make food random, and make sure it does not appear in the snake
const initialFood: Coordinate = { x: 5, y: 5 };

const initialDirection: Direction = Direction.ArrowUp;

export const initialState: State = {
  direction: initialDirection,
  food: initialFood,
  isGameOver: false,
  isPaused: false,
  snake: initialSnake,
};

function stateReducer(state: State, action: SnakeGameAction): State {
  switch (action.type) {
    case "startGame":
      return initialState;
    case "pause":
      return { ...state, isPaused: !state.isPaused };
    case "moveSnake":
      const head = state.snake[0];

      const newHead =
        state.direction === "ArrowUp"
          ? { x: head.x, y: head.y - 1 }
          : state.direction === "ArrowDown"
          ? { x: head.x, y: head.y + 1 }
          : state.direction === "ArrowLeft"
          ? { x: head.x - 1, y: head.y }
          : { x: head.x + 1, y: head.y };

      const isHittingWall =
        newHead.x < 0 || newHead.y < 0 || newHead.x >= 20 || newHead.y >= 20;

      const isHittingSelf = state.snake.some(
        (coord) => coord.x === newHead.x && coord.y === newHead.y
      );
      const isGameNowOver = isHittingWall || isHittingSelf;

      const isEatingFood =
        newHead.x === state.food.x && newHead.y === state.food.y;

      const newSnake = isEatingFood
        ? [newHead, ...state.snake]
        : [newHead, ...state.snake.slice(0, -1)];

      // TODO make sure food does not appear in the snake
      const newFood = isEatingFood
        ? {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
          }
        : state.food;

      return {
        ...state,
        food: newFood,
        isGameOver: isGameNowOver,
        snake: isGameNowOver ? state.snake : newSnake,
      };
    case "changeDirection":
      const opposite = (d: Direction) =>
        d === "ArrowUp"
          ? "ArrowDown"
          : d === "ArrowDown"
          ? "ArrowUp"
          : d === "ArrowLeft"
          ? "ArrowRight"
          : "ArrowLeft";

      return action.value === state.direction ||
        action.value === opposite(state.direction)
        ? state
        : { ...state, direction: action.value };
    default:
      throw new Error("Unknown action");
  }
}

export const useGameReducer = (): [State, Dispatch<SnakeGameAction>] =>
  useReducer(stateReducer, initialState);
