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
  generateInitialBoardHeight,
  generateInitialBoardWidth,
  getNewHeadPosition,
  getNewHeadPositionWithWrap,
  isCoordInCoords,
  isInBounds,
  isLegalDirectionChange,
  randomCoord,
  randomCoordThatAvoidsCoords,
} from "../utilities";
import { CRASHFLASH_INTERVAL_MS, FALLBACK_INTERVAL_MS } from "../constants";

const getInitialContext = () => {
  console.log("getInitialContext()");
  const gamepad = localStorage.getItem("gamepad") || "responsive";
  const boardWidth = localStorage.getItem("board width")
    ? parseInt(localStorage.getItem("board width")!)
    : generateInitialBoardWidth();
  const boardHeight = localStorage.getItem("board height")
    ? parseInt(localStorage.getItem("board height")!)
    : generateInitialBoardHeight(gamepad);
  const highScore = localStorage.getItem("highScore")
    ? parseInt(localStorage.getItem("highScore")!)
    : 0;
  const overlap = localStorage.getItem("overlap") || "crash";
  const speed = localStorage.getItem("speed")
    ? parseInt(localStorage.getItem("speed")!)
    : FALLBACK_INTERVAL_MS;
  const wall = localStorage.getItem("wall") || "crash";
  const theme = localStorage.getItem("theme") || "dark";

  const initialSnake: Coordinate[] = [randomCoord(boardWidth, boardHeight)];

  /*
   * These Settings are an ordered map since the user can cycle ("navigate"
   * forward and backward) through them in a fixed order, but each setting has
   * its own key/val pairs.
   *
   * The trade-off: getting the value is a bit annoying (ex.
   * `settings.get("wall")?.settingValue!`), but it it simplifies cycling
   * through them, and event keying/lookup/updating.
   */
  const initialSettings = new Map();
  initialSettings.set("speed", {
    type: "numeric",
    incDecs: [-100, -10, -1, 1, 10, 100],
    maxSettingValue: 1000 * 60,
    minSettingValue: 25,
    settingValue: speed,
  });
  initialSettings.set("board width", {
    type: "numeric",
    incDecs: [-5, -1, 1, 5],
    maxSettingValue: 40,
    minSettingValue: 3,
    settingValue: boardWidth,
  });
  initialSettings.set("board height", {
    type: "numeric",
    incDecs: [-5, -1, 1, 5],
    maxSettingValue: 40,
    minSettingValue: 3,
    settingValue: boardHeight,
  });
  initialSettings.set("wall", {
    type: "enum",
    settingOptions: ["crash", "wrap"],
    settingValue: wall,
  });
  initialSettings.set("overlap", {
    type: "enum",
    settingOptions: ["crash", "thru"],
    settingValue: overlap,
  });
  initialSettings.set("gamepad", {
    type: "enum",
    settingOptions: ["responsive", "off", "on"],
    settingValue: gamepad,
  });
  initialSettings.set("theme", {
    type: "enum",
    settingOptions: ["light", "dark"],
    settingValue: theme,
  });

  return {
    crashflashCount: 0,
    direction: Direction.ArrowUp,
    food: randomCoordThatAvoidsCoords(initialSnake, boardWidth, boardHeight),
    highScore,
    lastDirectionMoved: undefined,
    marqueeMessages: { desktop: [""], gamepad: [""] },
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
              crashflashCount: 0,
              marqueeMessages: {
                desktop: ["ready", "^ _ < > move", "spc pause"],
                gamepad: ["ready", "^ _ < > move", "tap board to pause"],
              },
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
                    ? {
                        desktop: [
                          "game over",
                          `new high: ${newHighScore}`,
                          "spc reset",
                        ],
                        gamepad: [
                          "game over",
                          `new high: ${newHighScore}`,
                          "tap board to reset",
                        ],
                      }
                    : {
                        desktop: [
                          "game over",
                          "spc reset",
                          `high score: ${newHighScore}`,
                        ],
                        gamepad: [
                          "game over",
                          "tap board to reset",
                          `high score: ${newHighScore}`,
                        ],
                      },
                newHighScore,
              };
            }),
            after: {
              [CRASHFLASH_INTERVAL_MS]: {
                // is not finished flashing
                guard: ({ context: { crashflashCount } }) =>
                  crashflashCount < 6,
                actions: assign({
                  crashflashCount: ({ context: { crashflashCount } }) =>
                    crashflashCount + 1,
                }),
                target: "gameover",
                reenter: true,
              },
            },
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
                  marqueeMessages: { desktop: [""], gamepad: [""] },
                }),
                after: {
                  DELAY: [
                    {
                      guard: "is game over",
                      target: "#Snake.menu closed.gameover",
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
                  marqueeMessages: {
                    desktop: ["paused", "spc unpause"],
                    gamepad: ["paused", "spc unpause"],
                  },
                  food: ({ context: { food, settings, snake } }) => {
                    const boardWidth = settings.get("board width")
                      ?.settingValue! as number;
                    const boardHeight = settings.get("board height")
                      ?.settingValue! as number;
                    return food.x >= boardWidth || food.y >= boardHeight
                      ? randomCoordThatAvoidsCoords(
                          snake,
                          boardWidth,
                          boardHeight,
                        )
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
          const boardWidth = settings.get("board width")
            ?.settingValue! as number;
          const boardHeight = settings.get("board height")
            ?.settingValue! as number;

          const wall = settings.get("wall")?.settingValue! as string;

          const newHead =
            wall === "crash"
              ? getNewHeadPosition(snake[0], direction)
              : getNewHeadPositionWithWrap(
                  snake[0],
                  direction,
                  boardWidth,
                  boardHeight,
                );

          const isEatingFood = newHead.x === food.x && newHead.y === food.y;

          const newSnake = isEatingFood
            ? [newHead, ...snake]
            : [newHead, ...snake.slice(0, -1)];

          const newFood = isEatingFood
            ? randomCoordThatAvoidsCoords(newSnake, boardWidth, boardHeight)
            : food;

          return {
            food: newFood,
            lastDirectionMoved: direction,
            snake: newSnake,
          };
        },
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
        return isLegalDirectionChange(
          arrowDirection,
          lastDirectionMoved,
          snake,
        );
      },
      "is game over": ({ context: { direction, settings, snake } }) => {
        const boardWidth = settings.get("board width")?.settingValue! as number;
        const boardHeight = settings.get("board height")
          ?.settingValue! as number;
        const overlap = settings.get("overlap")?.settingValue as string;
        const wall = settings.get("wall")?.settingValue as string;

        if (overlap === "thru" && wall === "wrap") {
          return false;
        }

        const head = snake[0];

        const newHead =
          wall === "crash"
            ? getNewHeadPosition(head, direction)
            : getNewHeadPositionWithWrap(
                head,
                direction,
                boardWidth,
                boardHeight,
              );

        const isHittingWall = !isInBounds(newHead, boardWidth, boardHeight);
        const isHittingSelf = isCoordInCoords(newHead, snake);
        return (
          (isHittingSelf && overlap === "crash") ||
          (isHittingWall && wall === "crash")
        );
      },
    },
    delays: { DELAY: FALLBACK_INTERVAL_MS },
  },
).provide({
  delays: {
    // DELAY: 1000, // or expression
    // DELAY: ({ context: { speed } }) => speed,
    // TODO use this one
    // DELAY: ({ context: { settings } }) => {
    //   const speed = settings.get("speed")?.settingValue as string;
    //   return speed ? parseInt(speed) : FALLBACK_INTERVAL_MS;
    // },
    DELAY: ({ context: { settings } }: { context: Context }) =>
      parseInt(settings.get("speed")?.settingValue as string) ||
      FALLBACK_INTERVAL_MS,
    // DELAY: ({ context: { settings } }) => settings.get("speed")?.settingValue ?? FALLBACK_INTERVAL_MS,
    // DELAY: () => FALLBACK_INTERVAL_MS,
  },
});
