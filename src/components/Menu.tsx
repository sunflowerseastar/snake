import classNames from "classnames";

import {
  SpeedDemonstrationBoard,
  WallDemonstrationBoard,
} from "./DemonstrationBoards";
import { BgBoard } from "./Board";
import { Len9Text } from "./Len9";
import { useSnakeMachine } from "../hooks/useSnakeMachine";

const UpdateSettingButton = ({
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

const NavigateButton = ({
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

export const Menu = () => {
  const {
    context: { activeSetting, activeSettingKey },
    isMenuOpen,
    send,
  } = useSnakeMachine();

  const { type: settingType, settingValue } = activeSetting;

  // TODO implement menu-board for wall
  return (
    <>
      {isMenuOpen ? (
        <div
          className={classNames({
            // isMenuOpen,
            menu: true,
            "main-content-container": true,
          })}
        >
          <div className="main-content-container-inner">
            <div className="content-top-row">
              <NavigateButton
                onClick={() =>
                  send({
                    type: "cycle through settings",
                    cycleDirection: "backward",
                  })
                }
                text="<"
              />
              <div>
                <Len9Text
                  cx={{ "active-setting": true }}
                  text={`${activeSettingKey}: `}
                />
                <Len9Text
                  cx={{ "active-setting-value": true }}
                  text={`${settingValue}`}
                />
              </div>
              <NavigateButton
                onClick={() =>
                  send({
                    type: "cycle through settings",
                    cycleDirection: "forward",
                  })
                }
                text=">"
              />
            </div>
            <div className="content-middle-row">
              {activeSettingKey === "board size" && (
                <BgBoard boardSize={settingValue as number} />
              )}
              {activeSettingKey === "speed" && <SpeedDemonstrationBoard />}
              {activeSettingKey === "wall" && <WallDemonstrationBoard />}
            </div>
            <div className="content-bottom-row">
              {settingType === "numeric"
                ? activeSetting.incDecs.map((n) => {
                    const wouldGoBeyondMinOrMax =
                      n > 0
                        ? (settingValue as number) + n >
                          activeSetting.maxSettingValue
                        : (settingValue as number) + n <
                          activeSetting.minSettingValue;
                    return (
                      <UpdateSettingButton
                        key={n}
                        text={`${n > 0 ? "+" : ""}${n}`}
                        onClick={() =>
                          !wouldGoBeyondMinOrMax &&
                          send({
                            type: "increase/decrease",
                            settingValueKey: activeSettingKey,
                            settingValueIncDecAmount: n,
                          })
                        }
                      />
                    );
                  })
                : activeSetting.settingOptions.map((option) => (
                    <UpdateSettingButton
                      key={option}
                      isActive={option === settingValue}
                      onClick={() =>
                        send({
                          type: "choose enum",
                          settingValueKey: activeSettingKey,
                          chosenOption: option,
                        })
                      }
                      text={option}
                    />
                  ))}
            </div>
          </div>
        </div>
      ) : null}

      <button
        className="button-toggle-menu"
        onClick={() => send({ type: "toggle menu" })}
      >
        <Len9Text
          cx={{ "toggle-icon": true, isMenuOpen }}
          gridWidth={3}
          text={isMenuOpen ? "x" : "+"}
        />
      </button>
    </>
  );
};

export default Menu;
