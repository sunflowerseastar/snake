import { assign, createMachine } from "xstate";
import { Coordinate, Direction } from "../types";
import {
  isInBounds,
  getNewHeadPosition,
  getNewHeadPositionWithWrap,
  newRandomDirection,
} from "../utilities";
import { CRASHFLASH_INTERVAL_MS } from "../constants";

type MiniWallContext = {
  boardSize: number;
  crashflashCount: number;
  direction: Direction;
  numMovesWithoutTurning: number;
  snake: Coordinate[];
  speed: number;
  // TODO type
  wall: string;
};
interface UpdateWallEvent {
  type: "update wall";
  newWall: string;
}

const initSnake = (boardSize: number) => {
  const y = Math.ceil((boardSize - 1) / 2);
  return Array.from({ length: 3 }, (_, i) => ({
    x: Math.floor(y * 1.6) + i,
    y,
  }));
};

export const settingWallMachine = createMachine(
  {
    types: {} as {
      context: MiniWallContext;
      events: UpdateWallEvent;
    },
    context: ({
      input: { boardSize, wall },
    }: {
      input: {
        boardSize: number;
        wall: string;
      };
    }) => {
      const snake = initSnake(boardSize);
      return {
        boardSize: boardSize,
        crashflashCount: 0,
        direction: Direction.ArrowLeft,
        numMovesWithoutTurning: 0,
        snake,
        speed: 60,
        wall: wall,
      };
    },
    id: "MiniSnake",
    initial: "unpaused",
    states: {
      unpaused: {
        entry: assign({
          crashflashCount: 0,
        }),
        after: [
          {
            delay: ({ context: { speed } }) => speed,
            guard: "is wall-crash and hitting a wall",
            target: "crashflash",
          },
          {
            delay: ({ context: { speed } }) => speed,
            actions: [
              {
                type: "move snake",
              },
            ],
            target: ".",
          },
        ],
        on: {
          "update wall": {
            actions: assign({
              wall: ({ event }) => {
                const { newWall } = event as UpdateWallEvent;
                return newWall;
              },
            }),
            reenter: true,
          },
        },
      },
      crashflash: {
        after: [
          {
            delay: CRASHFLASH_INTERVAL_MS,
            // is not finished flashing
            guard: ({ context: { crashflashCount } }) => crashflashCount < 6,
            actions: assign({
              crashflashCount: ({ context: { crashflashCount } }) =>
                crashflashCount + 1,
            }),
            target: "crashflash",
          },
          {
            delay: CRASHFLASH_INTERVAL_MS,
            actions: assign({
              snake: ({ context: { boardSize } }) => initSnake(boardSize),
              direction: Direction.ArrowLeft,
            }),
            target: "unpaused",
          },
        ],
        on: {
          "update wall": {
            actions: assign({
              wall: ({ event }) => {
                const { newWall } = event as UpdateWallEvent;
                return newWall;
              },
            }),
            target: "unpaused",
          },
        },
      },
    },
  },
  {
    actions: {
      "move snake": assign(
        ({
          context: { boardSize, direction, numMovesWithoutTurning, snake },
        }) => {
          const isChangingDirection = Math.random() > 0.7;

          return {
            direction: isChangingDirection
              ? newRandomDirection(direction, snake)
              : direction,
            numMovesWithoutTurning: isChangingDirection
              ? 0
              : numMovesWithoutTurning + 1,
            snake: [
              getNewHeadPositionWithWrap(snake[0], direction, boardSize),
              ...snake.slice(0, -1),
            ],
          };
        }
      ),
    },
    guards: {
      "is wall-crash and hitting a wall": ({
        context: { boardSize, direction, snake, wall },
      }) =>
        wall === "crash" &&
        !isInBounds(
          getNewHeadPosition(snake[0], direction, boardSize),
          boardSize
        ),
    },
  }
);
