import classNames from "classnames";

import {
  OverlapDemonstrationBoard,
  SpeedDemonstrationBoard,
  WallDemonstrationBoard,
} from "./DemonstrationBoards";
import { Len9Text } from "./Len9";

export const UpdateSettingButton = ({
  isActive = false,
  onClick,
  text,
}: {
  isActive?: boolean;
  onClick: React.MouseEventHandler;
  text: string;
}) => (
  <button
    className={classNames({ "button-update-setting": true, isActive })}
    onClick={onClick}
  >
    <Len9Text isSmall={true} text={text} />
  </button>
);

export const NavigateButton = ({
  onClick,
  text,
}: {
  onClick: React.MouseEventHandler;
  text: string;
}) => (
  <button className="button-navigate" onClick={onClick}>
    <Len9Text text={text} />
  </button>
);
