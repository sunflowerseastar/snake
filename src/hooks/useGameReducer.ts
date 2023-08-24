import { Dispatch, useReducer } from "react";

const BOARD_SIZE = 20;

// types

export enum Direction {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
}

type Coordinate = { x: number; y: number };

interface State {
  direction: Direction;
  food: Coordinate;
  isGameOver: boolean;
  isPaused: boolean;
  lastDirectionMoved: Direction | undefined;
  snake: Coordinate[];
}

type SnakeGameAction =
  | { type: "startGame" }
  | { type: "moveSnake" }
  | { type: "pause" }
  | { type: "changeDirection"; value: State["direction"] };

// utilities

const isInBounds = (coord: Coordinate): boolean =>
  coord.x >= 0 && coord.y >= 0 && coord.x < BOARD_SIZE && coord.y < BOARD_SIZE;

const isCoordInCoords = (coord: Coordinate, coords: Coordinate[]): boolean =>
  coords.some(({ x, y }) => x === coord.x && y === coord.y);

const opposite = (d: Direction) =>
  d === "ArrowUp"
    ? "ArrowDown"
    : d === "ArrowDown"
    ? "ArrowUp"
    : d === "ArrowLeft"
    ? "ArrowRight"
    : "ArrowLeft";

// TODO make snake starting coordinates two random adjacent x/y's
const initialSnake: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
];

// TODO make food random, and make sure it does not appear in the snake
const initialFood: Coordinate = { x: 5, y: 5 };

export const initialState: State = {
  direction: Direction.ArrowUp,
  food: initialFood,
  isGameOver: false,
  isPaused: false,
  lastDirectionMoved: undefined,
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

      const isHittingWall = !isInBounds(newHead);
      const isHittingSelf = isCoordInCoords(newHead, state.snake);
      const isGameOver = isHittingWall || isHittingSelf;

      const isEatingFood =
        newHead.x === state.food.x && newHead.y === state.food.y;

      const newSnake = isEatingFood
        ? [newHead, ...state.snake]
        : [newHead, ...state.snake.slice(0, -1)];

      // TODO make sure food does not appear in the snake
      const newFood = isEatingFood
        ? {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE),
          }
        : state.food;

      return {
        ...state,
        food: newFood,
        isGameOver,
        lastDirectionMoved: state.direction,
        snake: isGameOver ? state.snake : newSnake,
      };
    case "changeDirection":
      return action.value === state.direction ||
        (state.lastDirectionMoved &&
          action.value === opposite(state.lastDirectionMoved))
        ? state
        : { ...state, direction: action.value };
    default:
      throw new Error("Unknown action");
  }
}

export const useGameReducer = (): [State, Dispatch<SnakeGameAction>] =>
  useReducer(stateReducer, initialState);
