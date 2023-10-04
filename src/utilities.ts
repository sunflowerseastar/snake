import { Coordinate, Direction } from "./types";

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

export const randomInt = (boardSize: number) =>
  Math.floor(Math.random() * boardSize);

export const randomCoord = (boardSize: number) => ({
  x: randomInt(boardSize),
  y: randomInt(boardSize),
});

export const randomCoordThatAvoidsCoords = (
  coordsToAvoid: Coordinate[],
  boardSize: number
): Coordinate => {
  const possibleCoord = randomCoord(boardSize);
  return isCoordInCoords(possibleCoord, coordsToAvoid)
    ? randomCoordThatAvoidsCoords(coordsToAvoid, boardSize)
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
  direction: Direction,
  boardSize: number
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
  boardSize: number
): Coordinate =>
  direction === "ArrowUp"
    ? { x: head.x, y: head.y - 1 < 0 ? boardSize - 1 : head.y - 1 }
    : direction === "ArrowDown"
    ? { x: head.x, y: head.y + 1 >= boardSize ? 0 : head.y + 1 }
    : direction === "ArrowLeft"
    ? { x: head.x - 1 < 0 ? boardSize - 1 : head.x - 1, y: head.y }
    : { x: head.x + 1 >= boardSize ? 0 : head.x + 1, y: head.y };
