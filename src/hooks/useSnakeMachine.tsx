/*
 * This file contains two things, an Xstate machine and a React context.
 * Starting from the top, most of the file is the Xstate `snakeMachine`. The
 * bottom part of the file is a React provider that holds the Xstate
 * `snakeMachine` in a React context.
 *
 * 'context' means different things for each lib:
 *   - Xstate: it is a machine actor's stored data
 *     - https://stately.ai/docs/xstate-v5/context
 *   - React: it is a hook that provides data to a component sub-tree
 *     - https://react.dev/learn/passing-data-deeply-with-context
 *
 * To disambiguate, all React context naming includes the word "react" (ex.
 * `SnakeMachineReactContext`), while xstate context can just be "context."
 */
import React, {
  ReactNode,
  createContext as createReactContext,
  useContext as useReactContext,
} from "react";
import { assign, createMachine } from "xstate";
import { useMachine } from "@xstate/react";

/*
 * Snake Xstate Machine
 */

const INITIAL_BOARD_SIZE = 20;
const TICK_INTERVAL_MS = 50; // snake speed

// types

export enum Direction {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
}

type Coordinate = { x: number; y: number };
export type Context = {
  boardSize: number;
  direction: Direction;
  food: Coordinate;
  highScore: number;
  lastDirectionMoved: Direction | undefined;
  marqueeMessages: string[];
  newHighScore: number;
  snake: Coordinate[];
  tickSpeedMs: number;
};

interface ArrowKeyEvent {
  type: "arrow key";
  value: Direction;
}

interface SpacebarEvent {
  type: "spacebar";
}

export type MyEvents = ArrowKeyEvent | SpacebarEvent;

// utilities

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

const randomInt = (boardSize: number) => Math.floor(Math.random() * boardSize);

const randomCoord = (boardSize: number) => ({
  x: randomInt(boardSize),
  y: randomInt(boardSize),
});

const randomCoordThatAvoidsCoords = (
  coordsToAvoid: Coordinate[],
  boardSize: number
): Coordinate => {
  const possibleCoord = randomCoord(boardSize);
  return isCoordInCoords(possibleCoord, coordsToAvoid)
    ? randomCoordThatAvoidsCoords(coordsToAvoid, boardSize)
    : possibleCoord;
};

const getInitialContext = () => {
  const initialSnake: Coordinate[] = [randomCoord(INITIAL_BOARD_SIZE)];
  const initialHighScore = localStorage.getItem("highScore")
    ? parseInt(localStorage.getItem("highScore")!)
    : 0;

  return {
    boardSize: INITIAL_BOARD_SIZE,
    direction: Direction.ArrowUp,
    food: randomCoordThatAvoidsCoords(initialSnake, INITIAL_BOARD_SIZE),
    highScore: initialHighScore,
    lastDirectionMoved: undefined,
    marqueeMessages: [""],
    newHighScore: initialHighScore,
    snake: initialSnake,
    tickSpeedMs: 80,
  };
};

export const snakeMachine = createMachine(
  {
    types: {} as {
      context: Context;
      events: MyEvents;
    },
    context: getInitialContext(),
    id: "Snake",
    initial: "ready",
    states: {
      ready: {
        entry: assign({
          marqueeMessages: ["ready", "^ _ < > move", "spc pause"],
        }),
        on: {
          "arrow key": {
            actions: assign(({ event }) => {
              const { value } = event as ArrowKeyEvent;
              return {
                direction: value,
              };
            }),
            target: "#Snake.gameplay.unpaused",
          },
          spacebar: {
            target: "#Snake.gameplay.unpaused",
          },
        },
      },
      gameplay: {
        initial: "unpaused",
        states: {
          unpaused: {
            entry: assign({
              marqueeMessages: [""],
            }),
            after: {
              INTERVAL: [
                {
                  guard: "is game over",
                  target: "#Snake.over",
                },
                {
                  actions: [
                    {
                      type: "move snake",
                    },
                  ],
                  target: ".",
                },
              ],
            },
            on: {
              spacebar: {
                target: "paused",
              },
              "arrow key": {
                guard: "is legal direction change",
                actions: assign(({ event }) => {
                  const { value } = event as ArrowKeyEvent;
                  return {
                    direction: value,
                  };
                }),
                reenter: true,
              },
            },
          },
          paused: {
            entry: assign({
              marqueeMessages: ["paused", "spc unpause"],
            }),
            on: {
              spacebar: {
                target: "unpaused",
              },
              "arrow key": {
                guard: "is legal direction change",
                actions: assign(({ event }) => {
                  const { value } = event as ArrowKeyEvent;
                  return {
                    direction: value,
                  };
                }),
                target: "unpaused",
              },
            },
          },
        },
      },
      over: {
        entry: assign(({ context: { highScore, snake } }) => {
          /*
           * newHighScore & highScore can be different during #Snake.over. This
           * way the UI can know if a newHighScore was just achieved.
           */
          const newHighScore = Math.max(snake.length, highScore);
          localStorage.setItem("highScore", newHighScore.toString());

          return {
            marqueeMessages:
              newHighScore > highScore
                ? ["game over", `new high: ${newHighScore}`, "spc reset"]
                : ["game over", "spc reset", `high score: ${newHighScore}`],
            newHighScore,
          };
        }),
        on: {
          spacebar: {
            actions: assign(({ context: { newHighScore } }) => ({
              ...getInitialContext(),
              /*
               * When the user presses SPC to go from GamePlayState.over to
               * GamePlayState.ready, the newHighScore is copied into the
               * highScore (which makes these undistinguishable again for the
               * UI).
               */
              highScore: newHighScore,
            })),
            target: "ready",
          },
        },
      },
    },
  },
  {
    actions: {
      "move snake": assign(
        ({ context: { snake, direction, boardSize, food } }) => {
          const head = snake[0];

          const newHead =
            direction === "ArrowUp"
              ? { x: head.x, y: head.y - 1 }
              : direction === "ArrowDown"
              ? { x: head.x, y: head.y + 1 }
              : direction === "ArrowLeft"
              ? { x: head.x - 1, y: head.y }
              : { x: head.x + 1, y: head.y };

          const isEatingFood = newHead.x === food.x && newHead.y === food.y;

          const newSnake = isEatingFood
            ? [newHead, ...snake]
            : [newHead, ...snake.slice(0, -1)];

          const newFood = isEatingFood
            ? randomCoordThatAvoidsCoords(newSnake, boardSize)
            : food;

          return {
            food: newFood,
            lastDirectionMoved: direction,
            snake: newSnake,
          };
        }
      ),
    },
    guards: {
      "is legal direction change": ({
        context: { lastDirectionMoved, snake },
        event,
      }) => {
        const { value } = event as ArrowKeyEvent;

        // snake is not going back onto itself
        return !(
          snake.length > 1 &&
          lastDirectionMoved &&
          value === opposite(lastDirectionMoved)
        );
      },
      "is game over": ({ context: { snake, direction, boardSize } }) => {
        const head = snake[0];

        const newHead =
          direction === "ArrowUp"
            ? { x: head.x, y: head.y - 1 }
            : direction === "ArrowDown"
            ? { x: head.x, y: head.y + 1 }
            : direction === "ArrowLeft"
            ? { x: head.x - 1, y: head.y }
            : { x: head.x + 1, y: head.y };

        const isHittingWall = !isInBounds(newHead, boardSize);
        const isHittingSelf = isCoordInCoords(newHead, snake);
        return isHittingWall || isHittingSelf;
      },
    },
    delays: { INTERVAL: TICK_INTERVAL_MS },
  }
);

/*
 * Context and Provider
 */

type SnakeMachineReactContextType = {
  context: Context;
  send: (event: MyEvents) => void;
};
const SnakeMachineReactContext = createReactContext<
  SnakeMachineReactContextType | undefined
>(undefined);

interface SnakeMachineProviderProps {
  children: ReactNode;
}
export const SnakeMachineProvider: React.FC<SnakeMachineProviderProps> = ({
  children,
}) => {
  const [xstate, send] = useMachine(snakeMachine);
  return (
    <SnakeMachineReactContext.Provider
      value={{
        context: xstate.context,
        send,
      }}
    >
      {children}
    </SnakeMachineReactContext.Provider>
  );
};

export function useSnakeMachine() {
  const reactContext = useReactContext(SnakeMachineReactContext);
  if (reactContext === undefined) {
    throw new Error(
      "useSnakeMachine must be used within a SnakeMachineProvider"
    );
  }
  return reactContext;
}
