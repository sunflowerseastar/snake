import { assign, createMachine } from "xstate";
import { Coordinate, Direction } from "../types";
import {
  getNewHeadPositionWithWrap,
  isCoordInCoords,
  newRandomDirection,
} from "../utilities";
import { CRASHFLASH_INTERVAL_MS } from "../constants";

type MiniOverlapContext = {
  boardSize: number;
  crashflashCount: number;
  direction: Direction;
  numMovesWithoutTurning: number;
  // TODO type
  overlap: string;
  snake: Coordinate[];
  speed: number;
};
interface UpdateOverlapEvent {
  type: "update overlap";
  newOverlap: string;
}

const initSnake = (boardSize: number) => {
  const y = Math.ceil((boardSize - 1) / 2);
  const len = Math.floor(boardSize * 0.75);
  return Array.from({ length: len }, (_, i) => ({
    x: Math.floor((boardSize - len) / 2) + i,
    y,
  }));
};

export const settingOverlapMachine = createMachine(
  {
    types: {} as {
      context: MiniOverlapContext;
      events: UpdateOverlapEvent;
    },
    context: ({
      input: { boardSize, overlap },
    }: {
      input: {
        boardSize: number;
        overlap: string;
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
        overlap: overlap,
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
            guard: "is crashing by overlapping itself",
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
          "update overlap": {
            actions: assign({
              overlap: ({ event }) => {
                const { newOverlap } = event as UpdateOverlapEvent;
                return newOverlap;
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
          "update overlap": {
            actions: assign({
              overlap: ({ event }) => {
                const { newOverlap } = event as UpdateOverlapEvent;
                return newOverlap;
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
          const newHead = getNewHeadPositionWithWrap(
            snake[0],
            direction,
            boardSize
          );

          const isChangingDirection = Math.random() > 0.7;

          return {
            direction: isChangingDirection
              ? newRandomDirection(direction, snake)
              : direction,
            numMovesWithoutTurning: isChangingDirection
              ? 0
              : numMovesWithoutTurning + 1,
            snake: [newHead, ...snake.slice(0, -1)],
          };
        }
      ),
    },
    guards: {
      "is crashing by overlapping itself": ({
        context: { boardSize, direction, overlap, snake },
      }) =>
        overlap === "crash" &&
        isCoordInCoords(
          getNewHeadPositionWithWrap(snake[0], direction, boardSize),
          snake
        ),
    },
  }
);
