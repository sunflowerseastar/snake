import { assign, createMachine } from "xstate";
import { Coordinate, Direction } from "../types";

type MiniSpeedContext = {
  boardSize: number;
  direction: Direction;
  snake: Coordinate[];
  speed: number;
};
interface UpdateSpeedEvent {
  type: "update speed";
  newSpeed: number;
}

export const settingSpeedMachine = createMachine(
  {
    types: {} as {
      context: MiniSpeedContext;
      events: UpdateSpeedEvent;
    },
    context: ({
      input,
    }: {
      input: {
        boardSize: number;
        speed: number;
      };
    }) => {
      const y = Math.ceil((input.boardSize - 1) / 2);
      const startX = Math.floor(y / 2);
      const snake = Array.from({ length: y }, (_, i) => ({
        x: startX + i,
        y,
      }));
      return {
        boardSize: input.boardSize,
        direction: Direction.ArrowLeft,
        snake,
        speed: input.speed,
      };
    },
    id: "MiniSnake",
    initial: "unpaused",
    states: {
      unpaused: {
        after: [
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
          "update speed": {
            actions: assign({
              speed: ({ event }) => {
                const { newSpeed } = event as UpdateSpeedEvent;
                return newSpeed;
              },
            }),
            reenter: true,
          },
        },
      },
    },
  },
  {
    actions: {
      "move snake": assign(
        ({ context: { boardSize, direction, snake, speed } }) => {
          const head = snake[0];

          const newHeadWithWallWrapping =
            direction === "ArrowUp"
              ? { x: head.x, y: head.y - 1 < 0 ? boardSize - 1 : head.y - 1 }
              : direction === "ArrowDown"
              ? { x: head.x, y: head.y + 1 >= boardSize ? 0 : head.y + 1 }
              : direction === "ArrowLeft"
              ? { x: head.x - 1 < 0 ? boardSize - 1 : head.x - 1, y: head.y }
              : { x: head.x + 1 >= boardSize ? 0 : head.x + 1, y: head.y };

          return {
            snake: [newHeadWithWallWrapping, ...snake.slice(0, -1)],
          };
        }
      ),
    },
  }
);
