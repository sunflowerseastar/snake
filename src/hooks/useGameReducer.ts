import { Dispatch, useReducer } from "react";

// types

export enum Direction {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
}

export enum GamePlayState {
  ready = "ready",
  over = "over",
  unpaused = "unpaused",
  paused = "paused",
}

type Coordinate = { x: number; y: number };

interface State {
  boardSize: number;
  direction: Direction;
  food: Coordinate;
  gamePlayState: GamePlayState;
  isGameOver: boolean;
  lastDirectionMoved: Direction | undefined;
  snake: Coordinate[];
  tickSpeedMs: number;
}

type SnakeGameAction =
  | { type: "startGame" }
  | { type: "endGame" }
  | { type: "moveSnake" }
  | { type: "pressSpace" }
  | { type: "pressArrowKey"; value: State["direction"] };

// utilities

export const isInBounds = (coord: Coordinate, boardSize: number): boolean =>
  coord.x >= 0 && coord.y >= 0 && coord.x < boardSize && coord.y < boardSize;

export const isCoordInCoords = (
  coord: Coordinate,
  coords: Coordinate[]
): boolean => coords.some(({ x, y }) => x === coord.x && y === coord.y);

export const opposite = (d: Direction) =>
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

const randomCoordThatAvoidsCoords = (
  coordsToAvoid: Coordinate[],
  boardSize: number
): Coordinate => {
  const possibleCoord = randomCoord(boardSize);
  return isCoordInCoords(possibleCoord, coordsToAvoid)
    ? randomCoordThatAvoidsCoords(coordsToAvoid, boardSize)
    : possibleCoord;
};

const initialBoardSize = 20;

const getInitialState = () => {
  const initialSnake: Coordinate[] = [randomCoord(initialBoardSize)];

  return {
    boardSize: initialBoardSize,
    direction: Direction.ArrowUp,
    food: randomCoordThatAvoidsCoords(initialSnake, initialBoardSize),
    gamePlayState: GamePlayState.ready,
    isGameOver: false,
    lastDirectionMoved: undefined,
    snake: initialSnake,
    tickSpeedMs: 80
  };
};

function stateReducer(state: State, action: SnakeGameAction): State {
  switch (action.type) {
    case "startGame":
      return getInitialState();
    case "endGame":
      return {
        ...state,
        gamePlayState: GamePlayState.over,
      };
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
    case "pressSpace":
      return state.gamePlayState === GamePlayState.over
        ? { ...getInitialState(), gamePlayState: GamePlayState.ready }
        : state.gamePlayState === GamePlayState.ready
        ? { ...state, gamePlayState: GamePlayState.unpaused }
        : state.gamePlayState === GamePlayState.unpaused
        ? { ...state, gamePlayState: GamePlayState.paused }
        : { ...state, gamePlayState: GamePlayState.unpaused };
    case "pressArrowKey":
      return state.gamePlayState === GamePlayState.over
        ? state
        : state.gamePlayState === GamePlayState.ready
        ? {
            ...state,
            direction: action.value,
            gamePlayState: GamePlayState.unpaused,
          }
        : state.snake.length > 1 &&
          state.lastDirectionMoved &&
          action.value === opposite(state.lastDirectionMoved)
        ? state
        : action.value === state.direction
        ? { ...state, gamePlayState: GamePlayState.unpaused }
        : {
            ...state,
            direction: action.value,
            gamePlayState: GamePlayState.unpaused,
          };
    default:
      throw new Error("Unknown action");
  }
}

export const useGameReducer = (): [State, Dispatch<SnakeGameAction>] =>
  useReducer(stateReducer, getInitialState());
