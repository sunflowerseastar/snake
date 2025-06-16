import { assign, createMachine } from "xstate";
import { Coordinate, Direction } from "../types";
import {
  initSnake,
  isInBounds,
  getNewHeadPosition,
  getNewHeadPositionWithWrap,
  newRandomDirection,
} from "../utilities";
import { CRASHFLASH_INTERVAL_MS } from "../constants";

type MiniWallContext = {
  boardWidth: number;
  boardHeight: number;
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

export const settingWallMachine = createMachine(
  {
    types: {} as {
      context: MiniWallContext;
      events: UpdateWallEvent;
    },
    context: ({
      input: { boardWidth, boardHeight, wall },
    }: {
      input: {
        boardWidth: number;
        boardHeight: number;
        wall: string;
      };
    }) => {
      const snake = initSnake(boardWidth, boardHeight);
      return {
        boardWidth,
        boardHeight,
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
        after: {
          DELAY: [
            {
              guard: "is wall-crash and hitting a wall",
              target: "crashflash",
            },
            {
              actions: [
                {
                  type: "move snake",
                },
              ],
              target: ".",
              reenter: true,
            },
          ],
        },
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
        after: {
          [CRASHFLASH_INTERVAL_MS]: [
            {
              // is not finished flashing
              guard: ({ context: { crashflashCount } }) => crashflashCount < 6,
              actions: assign({
                crashflashCount: ({ context: { crashflashCount } }) =>
                  crashflashCount + 1,
              }),
              target: "crashflash",
              reenter: true,
            },
            {
              actions: assign({
                snake: ({ context: { boardWidth, boardHeight } }) =>
                  initSnake(boardWidth, boardHeight),
                direction: Direction.ArrowLeft,
              }),
              target: "unpaused",
            },
          ],
        },
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
          context: {
            boardWidth,
            boardHeight,
            direction,
            numMovesWithoutTurning,
            snake,
          },
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
              getNewHeadPositionWithWrap(
                snake[0],
                direction,
                boardWidth,
                boardHeight,
              ),
              ...snake.slice(0, -1),
            ],
          };
        },
      ),
    },
    guards: {
      "is wall-crash and hitting a wall": ({
        context: { boardWidth, boardHeight, direction, snake, wall },
      }) =>
        wall === "crash" &&
        !isInBounds(
          getNewHeadPosition(snake[0], direction),
          boardWidth,
          boardHeight,
        ),
    },
  },
).provide({
  delays: {
    DELAY: ({ context: { speed } }) => speed,
  },
});
