import { assign, createMachine } from "xstate";
import { Coordinate, Direction } from "../types";
import { isCoordInCoords, isInBounds } from "../utilities";

type MiniWallContext = {
  boardSize: number;
  crashflashCount: number;
  direction: Direction;
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
  return Array.from({ length: y / 1.4 }, (_, i) => ({
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
        snake,
        speed: 80,
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
            delay: 500,
            guard: "is not finished flashing",
            actions: assign({
              crashflashCount: ({ context: { crashflashCount } }) =>
                crashflashCount + 1,
            }),
            target: "crashflash",
          },
          {
            delay: 500,
            actions: assign({
              snake: ({ context: { boardSize } }) => initSnake(boardSize),
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
        ({ context: { boardSize, direction, snake, wall } }) => {
          const head = snake[0];

          const newHead =
            wall === "crash"
              ? direction === "ArrowUp"
                ? { x: head.x, y: head.y - 1 }
                : direction === "ArrowDown"
                ? { x: head.x, y: head.y + 1 }
                : direction === "ArrowLeft"
                ? { x: head.x - 1, y: head.y }
                : { x: head.x + 1, y: head.y }
              : direction === "ArrowUp"
              ? { x: head.x, y: head.y - 1 < 0 ? boardSize - 1 : head.y - 1 }
              : direction === "ArrowDown"
              ? { x: head.x, y: head.y + 1 >= boardSize ? 0 : head.y + 1 }
              : direction === "ArrowLeft"
              ? { x: head.x - 1 < 0 ? boardSize - 1 : head.x - 1, y: head.y }
              : { x: head.x + 1 >= boardSize ? 0 : head.x + 1, y: head.y };

          return {
            snake: [newHead, ...snake.slice(0, -1)],
          };
        }
      ),
    },
    guards: {
      "is wall-crash and hitting a wall": ({
        context: { boardSize, direction, snake, wall: wallSetting },
      }) => {
        if (wallSetting !== "crash") {
          return false;
        }

        const head = snake[0];

        const newHead =
          wallSetting === "crash"
            ? direction === "ArrowUp"
              ? { x: head.x, y: head.y - 1 }
              : direction === "ArrowDown"
              ? { x: head.x, y: head.y + 1 }
              : direction === "ArrowLeft"
              ? { x: head.x - 1, y: head.y }
              : { x: head.x + 1, y: head.y }
            : direction === "ArrowUp"
            ? { x: head.x, y: head.y - 1 < 0 ? boardSize - 1 : head.y - 1 }
            : direction === "ArrowDown"
            ? { x: head.x, y: head.y + 1 >= boardSize ? 0 : head.y + 1 }
            : direction === "ArrowLeft"
            ? { x: head.x - 1 < 0 ? boardSize - 1 : head.x - 1, y: head.y }
            : { x: head.x + 1 >= boardSize ? 0 : head.x + 1, y: head.y };

        const isHittingWall = !isInBounds(newHead, boardSize);
        return isHittingWall;
      },
      "is not finished flashing": ({ context: { crashflashCount } }) =>
        crashflashCount < 6,
    },
  }
);
