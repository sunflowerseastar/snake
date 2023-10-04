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
import {
  isCoordInCoords,
  isInBounds,
  opposite,
  randomCoord,
  randomCoordThatAvoidsCoords,
} from "../utilities";
import { snakeMachine } from "../machines/snakeMachine";

const getActiveSettingKey = (
  settings: Map<string, Setting>,
  settingsActiveIndex: number
): string => {
  const keys = Array.from(settings.keys());
  return keys[settingsActiveIndex];
};

type SnakeMachineReactContextType = {
  isMenuOpen: boolean;
  context: Context & {
    activeSetting: Setting;
    activeSettingKey: string;
    boardSize: number;
    overlap: string;
    speed: number;
    touch: string;
    wall: string;
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
  const boardSize = xstate.context.settings.get("board size")
    ?.settingValue as number;
  const overlap = xstate.context.settings.get("overlap")
    ?.settingValue as string;
  const speed = xstate.context.settings.get("speed")?.settingValue as number;
  const touch = xstate.context.settings.get("touch")?.settingValue as string;
  const wall = xstate.context.settings.get("wall")?.settingValue as string;

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
          boardSize,
          overlap,
          speed,
          touch,
          wall,
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
      "useSnakeMachine must be used within a SnakeMachineProvider"
    );
  }
  return reactContext;
}
