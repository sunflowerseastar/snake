export enum Direction {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
}

export type Coordinate = { x: number; y: number };

type SettingEnum = {
  type: "enum";
  settingOptions: string[];
  settingValue: number | string;
};
type SettingNumeric = {
  type: "numeric";
  incDecs: number[];
  maxSettingValue: number;
  minSettingValue: number;
  settingValue: number | string;
};
export type Setting = SettingEnum | SettingNumeric;

export type Context = {
  crashflashCount: number;
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

export interface ArrowKeyPressEvent {
  type: "arrow key";
  arrowDirection: Direction;
}
export interface SettingsIncreaseDecreaseEvent {
  type: "increase/decrease";
  settingValueIncDecAmount: number;
  settingValueKey: string;
}
export interface SettingsChooseEnumEvent {
  type: "choose enum";
  chosenOption: string;
  settingValueKey: string;
}
export interface SettingCycleEvent {
  type: "cycle through settings";
  cycleDirection: "forward" | "backward";
}

export type MyEvents =
  | ArrowKeyPressEvent
  | SettingsIncreaseDecreaseEvent
  | SettingsChooseEnumEvent
  | SettingCycleEvent
  | { type: "spacebar" }
  | { type: "toggle menu" };
