import { useEffect } from "react";
import { assign, createMachine } from "xstate";
import { useMachine } from "@xstate/react";

import Board from "./Board";
import Square from "./Square";
import { Coordinate, Direction } from "../types";
import { useSnakeMachine } from "../hooks/useSnakeMachine";

type MiniContext = {
  boardSize: number;
  direction: Direction;
  snake: Coordinate[];
  speed: number;
};
interface UpdateSpeedEvent {
  type: "update speed";
  newSpeed: number;
}

export const miniSnakeMachine = createMachine(
  {
    types: {} as {
      context: MiniContext;
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

const AutoPlaySnakeBoard: React.FC = () => {
  const {
    context: { boardSize, speed },
  } = useSnakeMachine();

  const [xstate, send] = useMachine(miniSnakeMachine, {
    input: {
      boardSize,
      speed,
    },
  });
  const {
    context: { snake },
  } = xstate;

  useEffect(() => {
    send({
      type: "update speed",
      newSpeed: speed,
    });
  }, [speed]);

  return (
    <Board boardSize={boardSize}>
      <>
        {snake.map(({ x, y }) => (
          <Square key={`${x}-${y}`} x={x} y={y} />
        ))}
      </>
    </Board>
  );
};

export default AutoPlaySnakeBoard;
