import { assign, createMachine } from "xstate";
import {
  ArrowKeyPressEvent,
  Context,
  Coordinate,
  Direction,
  MyEvents,
  Setting,
  SettingCycleEvent,
  SettingsChooseEnumEvent,
  SettingsIncreaseDecreaseEvent,
} from "../types";
import {
  isCoordInCoords,
  isInBounds,
  opposite,
  randomCoord,
  randomCoordThatAvoidsCoords,
} from "../utilities";
import { FALLBACK_BOARD_SIZE, FALLBACK_INTERVAL_MS } from "../constants";

const getInitialContext = () => {
  const highScore = localStorage.getItem("highScore")
    ? parseInt(localStorage.getItem("highScore")!)
    : 0;

  const wall = localStorage.getItem("wall") || "crash";
  const speed = localStorage.getItem("speed")
    ? parseInt(localStorage.getItem("speed")!)
    : FALLBACK_BOARD_SIZE;
  const boardSize = localStorage.getItem("board size")
    ? parseInt(localStorage.getItem("board size")!)
    : FALLBACK_BOARD_SIZE;

  const initialSnake: Coordinate[] = [randomCoord(boardSize)];

  /*
   * These Settings are an ordered map since the user can cycle ("navigate"
   * forward and backward) through them in a fixed order, but each setting has
   * its own key/val pairs.
   *
   * This wrinkles initial value extraction, ex.
   * `settings.get("wall")?.settingValue!`, but simplifies
   * cycling and event keying/lookup/updating.
   */
  const initialSettings = new Map();
  initialSettings.set("wall", {
    type: "enum",
    // TODO type
    settingOptions: ["crash", "wrap"],
    settingValue: wall,
  });
  initialSettings.set("speed", {
    type: "numeric",
    incDecs: [-100, -10, -1, 1, 10, 100],
    maxSettingValue: 1000 * 60,
    minSettingValue: 25,
    settingValue: speed,
  });
  initialSettings.set("board size", {
    type: "numeric",
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
                  const { arrowDirection } = event as ArrowKeyPressEvent;
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
                      const { arrowDirection } = event as ArrowKeyPressEvent;
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
                    const boardSize = settings.get("board size")
                      ?.settingValue! as number;
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
                      const { arrowDirection } = event as ArrowKeyPressEvent;
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
              "choose enum": {
                actions: {
                  type: "choose enum",
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
          const wallSetting = settings.get("wall")?.settingValue! as string;

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
            event as SettingsIncreaseDecreaseEvent;
          const activeSetting = settings.get(settingValueKey) as Setting;

          const newSettingValue =
            (activeSetting.settingValue as number) + settingValueIncDecAmount;

          localStorage.setItem(settingValueKey, newSettingValue.toString());

          return settings.set(settingValueKey, {
            ...activeSetting,
            settingValue: newSettingValue,
          });
        },
      }),
      "choose enum": assign({
        settings: ({ context: { settings }, event }) => {
          const { chosenOption, settingValueKey } =
            event as SettingsChooseEnumEvent;
          const activeSetting = settings.get(settingValueKey) as Setting;

          localStorage.setItem(settingValueKey, chosenOption);

          return settings.set(settingValueKey, {
            ...activeSetting,
            settingValue: chosenOption,
          });
        },
      }),
      "cycle through settings": assign({
        settingsActiveIndex: ({
          context: { settings, settingsActiveIndex },
          event,
        }) => {
          const { cycleDirection } = event as SettingCycleEvent;

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
        const { arrowDirection } = event as ArrowKeyPressEvent;

        // snake is not going back onto itself
        return !(
          snake.length > 1 &&
          lastDirectionMoved &&
          arrowDirection === opposite(lastDirectionMoved)
        );
      },
      "is game over": ({ context: { direction, settings, snake } }) => {
        // TODO type
        const boardSize =
          (settings.get("board size")?.settingValue as number) ||
          FALLBACK_BOARD_SIZE;
        const wallSetting = settings.get("wall")?.settingValue! as string;

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
        const isHittingSelf = isCoordInCoords(newHead, snake);
        return isHittingSelf || (isHittingWall && wallSetting === "crash");
      },
    },
    delays: { INTERVAL: FALLBACK_INTERVAL_MS },
  }
);