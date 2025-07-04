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
import { useMachine } from "@xstate/react";

import { Context, MyEvents, Setting } from "../types";
import { snakeMachine } from "../machines/snakeMachine";

const getActiveSettingKey = (
  settings: Map<string, Setting>,
  settingsActiveIndex: number,
): string => {
  const keys = Array.from(settings.keys());
  return keys[settingsActiveIndex];
};

type SnakeMachineReactContextType = {
  isMenuOpen: boolean;
  context: Context & {
    activeSetting: Setting;
    activeSettingKey: string;
    boardWidth: number;
    boardHeight: number;
    overlap: string;
    speed: number;
    gamepad: string;
    wall: string;
    theme: string;
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
  // TODO type
  const boardWidth = xstate.context.settings.get("board width")
    ?.settingValue! as number;
  const boardHeight = xstate.context.settings.get("board height")
    ?.settingValue! as number;
  const overlap = xstate.context.settings.get("overlap")
    ?.settingValue as string;
  const speed = xstate.context.settings.get("speed")?.settingValue as number;
  const gamepad = xstate.context.settings.get("gamepad")
    ?.settingValue as string;
  const wall = xstate.context.settings.get("wall")?.settingValue as string;
  const theme = xstate.context.settings.get("theme")?.settingValue as string;

  const { settings, settingsActiveIndex } = xstate.context;
  const activeSettingKey = getActiveSettingKey(settings, settingsActiveIndex);
  const activeSetting = settings.get(activeSettingKey) as Setting;

  return (
    <SnakeMachineReactContext.Provider
      value={{
        context: {
          ...xstate.context,
          activeSetting,
          activeSettingKey,
          boardWidth,
          boardHeight,
          overlap,
          speed,
          gamepad,
          wall,
          theme,
        },
        isMenuOpen: xstate.matches("menu open"),
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
      "useSnakeMachine must be used within a SnakeMachineProvider",
    );
  }
  return reactContext;
}
