import { assign, createMachine } from "xstate";
import { Coordinate, Direction } from "../types";
import { getNewHeadPositionWithWrap } from "../utilities";

type MiniSpeedContext = {
  boardWidth: number;
  boardHeight: number;
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
        boardWidth: number;
        boardHeight: number;
        speed: number;
      };
    }) => {
      const y = Math.ceil((input.boardHeight - 1) / 2);
      const startX = Math.floor(y / 2);
      const snake = Array.from({ length: y }, (_, i) => ({
        x: startX + i,
        y,
      }));
      return {
        boardWidth: input.boardWidth,
        boardHeight: input.boardHeight,
        direction: Direction.ArrowLeft,
        snake,
        speed: input.speed,
      };
    },
    id: "MiniSnake",
    initial: "unpaused",
    states: {
      unpaused: {
        after: {
          DELAY: {
            actions: [
              {
                type: "move snake",
              },
            ],
            target: ".",
            reenter: true,
          },
          // delay: ({ context: { speed } }) => speed,
          // delay: ({ context }) => {
          //   return context.speed;
          // },
          // actions: [
          //   {
          //     type: "move snake",
          //   },
          // ],
          // target: ".",
        },
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
      "move snake": assign({
        snake: ({ context: { boardWidth, boardHeight, direction, snake } }) => [
          getNewHeadPositionWithWrap(
            snake[0],
            direction,
            boardWidth,
            boardHeight,
          ),
          ...snake.slice(0, -1),
        ],
      }),
    },
  },
).provide({
  delays: {
    // DELAY: 1000, // or expression
    DELAY: ({ context: { speed } }) => speed,
  },
});
