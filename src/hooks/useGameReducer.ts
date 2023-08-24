import { Dispatch, useReducer } from "react";

// types

export enum Direction {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
}

type Coordinate = { x: number; y: number };

interface State {
  boardSize: number;
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

const isInBounds = (coord: Coordinate, boardSize: number): boolean =>
  coord.x >= 0 && coord.y >= 0 && coord.x < boardSize && coord.y < boardSize;

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

// random int from 0 to 19
const randomInt = (boardSize: number) => Math.floor(Math.random() * boardSize);

const randomCoord = (boardSize: number) => ({
  x: randomInt(boardSize),
  y: randomInt(boardSize),
});

const randomCoordThatAvoidsCoord = (
  coordToAvoid: Coordinate,
  boardSize: number
): Coordinate => {
  const possibleCoord = randomCoord(boardSize);
  return possibleCoord.x === coordToAvoid.x &&
    possibleCoord.y === coordToAvoid.y
    ? randomCoordThatAvoidsCoord(coordToAvoid, boardSize)
    : possibleCoord;
};

const randomCoordThatAvoidsCoords = (
  coordsToAvoid: Coordinate[],
  boardSize: number
): Coordinate => {
  const possibleCoord = randomCoord(boardSize);
  return isCoordInCoords(possibleCoord, coordsToAvoid)
    ? randomCoordThatAvoidsCoords(coordsToAvoid, boardSize)
    : possibleCoord;
};

// TODO make snake starting coordinates two random adjacent x/y's
const initialSnake: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
];

const initialBoardSize = 20;

export const initialState: State = {
  boardSize: initialBoardSize,
  direction: Direction.ArrowUp,
  food: randomCoordThatAvoidsCoords(initialSnake, initialBoardSize),
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

      const isHittingWall = !isInBounds(newHead, state.boardSize);
      const isHittingSelf = isCoordInCoords(newHead, state.snake);
      const isGameOver = isHittingWall || isHittingSelf;

      const isEatingFood =
        newHead.x === state.food.x && newHead.y === state.food.y;

      const newSnake = isEatingFood
        ? [newHead, ...state.snake]
        : [newHead, ...state.snake.slice(0, -1)];

      const newFood = isEatingFood
        ? randomCoordThatAvoidsCoords(newSnake, state.boardSize)
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
