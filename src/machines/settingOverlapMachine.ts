import { assign, createMachine } from "xstate";
import { Coordinate, Direction } from "../types";
import {
  getNewHeadPositionWithWrap,
  initSnake,
  isCoordInCoords,
  newRandomDirection,
} from "../utilities";
import { CRASHFLASH_INTERVAL_MS } from "../constants";

type MiniOverlapContext = {
  boardWidth: number;
  boardHeight: number;
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

export const settingOverlapMachine = createMachine(
  {
    types: {} as {
      context: MiniOverlapContext;
      events: UpdateOverlapEvent;
    },
    context: ({
      input: { boardWidth, boardHeight, overlap },
    }: {
      input: {
        boardWidth: number;
        boardHeight: number;
        overlap: string;
      };
    }) => {
      const snake = initSnake(boardWidth, boardHeight);
      return {
        boardWidth: boardWidth,
        boardHeight: boardHeight,
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
        after: {
          DELAY: [
            {
              guard: "is crashing by overlapping itself",
              target: "crashflash",
            },
            {
              actions: [{ type: "move snake" }],
              target: ".",
              reenter: true,
            },
          ],
        },
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
          context: {
            boardWidth,
            boardHeight,
            direction,
            numMovesWithoutTurning,
            snake,
          },
        }) => {
          const newHead = getNewHeadPositionWithWrap(
            snake[0],
            direction,
            boardWidth,
            boardHeight,
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
        },
      ),
    },
    guards: {
      "is crashing by overlapping itself": ({
        context: { boardWidth, boardHeight, direction, overlap, snake },
      }) =>
        overlap === "crash" &&
        isCoordInCoords(
          getNewHeadPositionWithWrap(
            snake[0],
            direction,
            boardWidth,
            boardHeight,
          ),
          snake,
        ),
    },
  },
).provide({
  delays: {
    DELAY: ({ context: { speed } }) => speed,
  },
});
