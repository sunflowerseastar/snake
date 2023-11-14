import { Coordinate, Direction } from "./types";

export const isInBounds = (
  coord: Coordinate,
  boardWidth: number,
  boardHeight: number
): boolean =>
  coord.x >= 0 && coord.y >= 0 && coord.x < boardWidth && coord.y < boardHeight;

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

export const randomInt = (n: number) => Math.floor(Math.random() * n);

export const randomCoord = (
  boardWidth: number,
  boardHeight: number
): Coordinate => ({
  x: randomInt(boardWidth),
  y: randomInt(boardHeight),
});

export const randomCoordThatAvoidsCoords = (
  coordsToAvoid: Coordinate[],
  boardWidth: number,
  boardHeight: number
): Coordinate => {
  const possibleCoord = randomCoord(boardWidth, boardHeight);
  return isCoordInCoords(possibleCoord, coordsToAvoid)
    ? randomCoordThatAvoidsCoords(coordsToAvoid, boardWidth, boardHeight)
    : possibleCoord;
};

export const isLegalDirectionChange = (
  newDirection: Direction,
  previousDirection: Direction | undefined,
  snake: Coordinate[]
): boolean =>
  !(
    snake.length > 1 &&
    previousDirection &&
    newDirection === opposite(previousDirection)
  );

export const randomDirection = () =>
  Object.values(Direction)[Math.floor(Math.random() * 4)];

export const newRandomDirection = (
  previousDirection: Direction | undefined,
  snake: Coordinate[]
): Direction => {
  const possibleNewDirection = randomDirection();
  return isLegalDirectionChange(possibleNewDirection, previousDirection, snake)
    ? possibleNewDirection
    : newRandomDirection(previousDirection, snake);
};

export const getNewHeadPosition = (
  head: Coordinate,
  direction: Direction
): Coordinate =>
  direction === "ArrowUp"
    ? { x: head.x, y: head.y - 1 }
    : direction === "ArrowDown"
    ? { x: head.x, y: head.y + 1 }
    : direction === "ArrowLeft"
    ? { x: head.x - 1, y: head.y }
    : { x: head.x + 1, y: head.y };

export const getNewHeadPositionWithWrap = (
  head: Coordinate,
  direction: Direction,
  boardWidth: number,
  boardHeight: number
): Coordinate =>
  direction === "ArrowUp"
    ? { x: head.x, y: head.y - 1 < 0 ? boardHeight - 1 : head.y - 1 }
    : direction === "ArrowDown"
    ? { x: head.x, y: head.y + 1 >= boardHeight ? 0 : head.y + 1 }
    : direction === "ArrowLeft"
    ? { x: head.x - 1 < 0 ? boardWidth - 1 : head.x - 1, y: head.y }
    : { x: head.x + 1 >= boardWidth ? 0 : head.x + 1, y: head.y };

export const initSnake = (boardWidth: number, boardHeight: number) => {
  const y = Math.ceil((boardHeight - 1) / 2);
  const len = Math.floor(boardWidth * 0.75);
  return Array.from({ length: len }, (_, i) => ({
    x: Math.floor((boardWidth - len) / 2) + i,
    y,
  }));
};

export const generateInitialBoardHeight = (
  touch: string,
  testWidth = 0
): number =>
  (window.innerHeight < 768 && touch === "responsive") || touch === "on"
    ? Math.ceil((testWidth > 0 ? testWidth : window.innerHeight) / 70)
    : Math.ceil((testWidth > 0 ? testWidth : window.innerHeight) / 55);

export const generateInitialBoardWidth = (testWidth = 0): number =>
  Math.ceil((testWidth > 0 ? testWidth : window.innerWidth) / 50);
