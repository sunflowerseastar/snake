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
import { Coordinate, Direction } from "../types";
import {
  isCoordInCoords,
  isInBounds,
  opposite,
  randomCoord,
  randomCoordThatAvoidsCoords,
} from "./utilities";

/*
 * Snake Xstate Machine
 */

const FALLBACK_BOARD_SIZE = 20;
const FALLBACK_INTERVAL_MS = 60; // snake speed

type Setting = {
  incDecs: number[];
  maxSettingValue: number;
  minSettingValue: number;
  settingValue: number;
};

type Context = {
  direction: Direction;
  food: Coordinate;
  highScore: number;
  lastDirectionMoved: Direction | undefined;
  marqueeMessages: string[];
  newHighScore: number;
  settings: Map<string, Setting>;
  settingsActiveIndex: number;
  snake: Coordinate[];
};

interface ArrowKeyEvent {
  type: "arrow key";
  arrowDirection: Direction;
}
interface IncreaseDecreaseEvent {
  type: "increase/decrease";
  settingValueIncDecAmount: number;
  settingValueKey: string;
}
interface CycleEvent {
  type: "cycle through settings";
  cycleDirection: "forward" | "backward";
}

export type MyEvents =
  | ArrowKeyEvent
  | IncreaseDecreaseEvent
  | CycleEvent
  | { type: "spacebar" }
  | { type: "toggle menu" };

const getInitialContext = () => {
  const highScore = localStorage.getItem("highScore")
    ? parseInt(localStorage.getItem("highScore")!)
    : 0;

  const speed = localStorage.getItem("speed")
    ? parseInt(localStorage.getItem("speed")!)
    : FALLBACK_BOARD_SIZE;
  const boardSize = localStorage.getItem("board size")
    ? parseInt(localStorage.getItem("board size")!)
    : FALLBACK_BOARD_SIZE;

  const initialSnake: Coordinate[] = [randomCoord(boardSize)];

  // TODO add clear high score, wall options, other..?
  const initialSettings = new Map();
  initialSettings.set("speed", {
    incDecs: [-100, -10, -1, 1, 10, 100],
    maxSettingValue: 1000 * 60,
    minSettingValue: 25,
    settingValue: speed,
  });
  initialSettings.set("board size", {
    incDecs: [-5, -1, 1, 5],
    maxSettingValue: 40,
    minSettingValue: 3,
    settingValue: boardSize,
  });

  return {
    direction: Direction.ArrowUp,
    food: randomCoordThatAvoidsCoords(initialSnake, boardSize),
    highScore,
    lastDirectionMoved: undefined,
    marqueeMessages: [""],
    newHighScore: highScore,
    settings: initialSettings,
    settingsActiveIndex: 0,
    snake: initialSnake,
  };
};

const getActiveSettingKey = (
  settings: Map<string, Setting>,
  settingsActiveIndex: number
): string => {
  const keys = Array.from(settings.keys());
  return keys[settingsActiveIndex];
};

export const snakeMachine = createMachine(
  {
    types: {} as {
      context: Context;
      events: MyEvents;
    },
    context: getInitialContext(),
    id: "Snake",
    initial: "menu closed",
    states: {
      "menu closed": {
        initial: "ready",
        states: {
          hist: {
            type: "history",
            history: "shallow",
          },
          ready: {
            entry: assign({
              marqueeMessages: ["ready", "^ _ < > move", "spc pause"],
            }),
            on: {
              "arrow key": {
                actions: assign(({ event }) => {
                  const { arrowDirection } = event as ArrowKeyEvent;
                  return {
                    direction: arrowDirection,
                  };
                }),
                target: "#Snake.menu closed.gameplay.unpaused",
              },
              spacebar: {
                target: "#Snake.menu closed.gameplay.unpaused",
              },
            },
          },
          gameover: {
            entry: assign(({ context: { highScore, snake } }) => {
              /*
               * newHighScore & highScore can be different during #Snake.gameover. This
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
                   * When the user presses SPC to go from GamePlayState.gameover to
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
          gameplay: {
            initial: "paused",
            states: {
              unpaused: {
                entry: assign({
                  marqueeMessages: [""],
                }),
                after: [
                  {
                    delay: ({ context: { settings } }) =>
                      settings.get("speed")?.settingValue ||
                      FALLBACK_INTERVAL_MS,
                    guard: "is game over",
                    target: "#Snake.menu closed.gameover",
                  },
                  {
                    delay: ({ context: { settings } }) =>
                      settings.get("speed")?.settingValue ||
                      FALLBACK_INTERVAL_MS,
                    actions: [
                      {
                        type: "move snake",
                      },
                    ],
                    target: ".",
                  },
                ],
                on: {
                  spacebar: {
                    target: "paused",
                  },
                  "arrow key": {
                    guard: "is legal direction change",
                    actions: assign(({ event }) => {
                      const { arrowDirection } = event as ArrowKeyEvent;
                      return {
                        direction: arrowDirection,
                      };
                    }),
                    reenter: true,
                  },
                },
              },
              paused: {
                entry: assign({
                  marqueeMessages: ["paused", "spc unpause"],
                  food: ({ context: { food, settings, snake } }) => {
                    const boardSize = settings.get("board size")?.settingValue!;
                    return food.x >= boardSize || food.y >= boardSize
                      ? randomCoordThatAvoidsCoords(snake, boardSize)
                      : food;
                  },
                }),
                on: {
                  spacebar: {
                    target: "unpaused",
                  },
                  "arrow key": {
                    guard: "is legal direction change",
                    actions: assign(({ event }) => {
                      const { arrowDirection } = event as ArrowKeyEvent;
                      return {
                        direction: arrowDirection,
                      };
                    }),
                    target: "unpaused",
                  },
                },
              },
            },
          },
        },
        on: {
          "toggle menu": {
            target: "#Snake.menu open",
          },
        },
      },
      "menu open": {
        initial: "settings",
        states: {
          settings: {
            on: {
              "increase/decrease": {
                actions: {
                  type: "increase/decrease",
                },
                reenter: true,
              },
              "cycle through settings": {
                actions: {
                  type: "cycle through settings",
                  params: {
                    cycleDirection: "forward",
                  },
                },
                reenter: true,
              },
            },
          },
        },
        on: {
          "toggle menu": {
            target: "#Snake.menu closed.hist",
          },
        },
      },
    },
  },
  {
    actions: {
      "move snake": assign(
        ({ context: { direction, food, settings, snake } }) => {
          const boardSize = settings.get("board size")?.settingValue! as number;

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
      "increase/decrease": assign({
        settings: ({ context: { settings }, event }) => {
          const { settingValueIncDecAmount, settingValueKey } =
            event as IncreaseDecreaseEvent;
          const activeSetting = settings.get(settingValueKey) as Setting;

          const newSettingValue =
            activeSetting.settingValue + settingValueIncDecAmount;

          localStorage.setItem(settingValueKey, newSettingValue.toString());

          return settings.set(settingValueKey, {
            ...activeSetting,
            settingValue: newSettingValue,
          });
        },
      }),
      "cycle through settings": assign({
        settingsActiveIndex: ({
          context: { settings, settingsActiveIndex },
          event,
        }) => {
          const { cycleDirection } = event as CycleEvent;

          return cycleDirection === "forward"
            ? (settingsActiveIndex + 1) % settings.size
            : settingsActiveIndex === 0
            ? settings.size - 1
            : settingsActiveIndex - 1;
        },
      }),
    },
    guards: {
      "is legal direction change": ({
        context: { lastDirectionMoved, snake },
        event,
      }) => {
        const { arrowDirection } = event as ArrowKeyEvent;

        // snake is not going back onto itself
        return !(
          snake.length > 1 &&
          lastDirectionMoved &&
          arrowDirection === opposite(lastDirectionMoved)
        );
      },
      "is game over": ({ context: { direction, settings, snake } }) => {
        const boardSize =
          (settings.get("board size")?.settingValue as number) ||
          FALLBACK_BOARD_SIZE;

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
    delays: { INTERVAL: FALLBACK_INTERVAL_MS },
  }
);

/*
 * React Context and Provider
 */

type SnakeMachineReactContextType = {
  isMenuOpen: boolean;
  context: Context & {
    activeSetting: Setting;
    activeSettingKey: string;
    boardSize: number;
    speed: number;
  };
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

  /*
   * The consuming side should have clean, friendly data.
   * Derived data is set up here.
   */
  const boardSize =
    (xstate.context.settings.get("board size")?.settingValue as number) ||
    FALLBACK_BOARD_SIZE;
  const speed =
    (xstate.context.settings.get("speed")?.settingValue as number) ||
    FALLBACK_BOARD_SIZE;

  const { settings, settingsActiveIndex } = xstate.context;
  const activeSettingKey = getActiveSettingKey(settings, settingsActiveIndex);
  const activeSetting = settings.get(activeSettingKey) as Setting;

  return (
    <SnakeMachineReactContext.Provider
      value={{
        isMenuOpen: xstate.matches("menu open"),
        context: {
          ...xstate.context,
          activeSetting,
          activeSettingKey,
          boardSize,
          speed,
        },
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
