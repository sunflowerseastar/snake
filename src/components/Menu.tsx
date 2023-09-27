import classNames from "classnames";

import AutoPlaySnakeBoard from "./AutoPlaySnakeBoard";
import { BgBoard } from "./Board";
import { Len9Text } from "./Len9";
import { useSnakeMachine } from "../hooks/useSnakeMachine";

const IncDecButton = ({
  onClick,
  text,
}: {
  onClick: React.MouseEventHandler;
  text: string;
}) => (
  <button className="button-inc-dec" onClick={onClick}>
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

  const { incDecs, maxSettingValue, minSettingValue, settingValue } =
    activeSetting;

  // TODO implement menu-board for speed
  return (
    <>
      <div
        className={classNames({
          isMenuOpen,
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
              <BgBoard boardSize={settingValue} />
            )}
            {activeSettingKey === "speed" && <AutoPlaySnakeBoard />}
          </div>
          <div className="content-bottom-row">
            {incDecs.map((n) => {
              const wouldGoBeyondMinOrMax =
                n > 0
                  ? settingValue + n > maxSettingValue
                  : settingValue + n < minSettingValue;
              return (
                <IncDecButton
                  key={n}
                  text={`${n > 0 ? "+" : ""}${n}`}
                  onClick={() => {
                    !wouldGoBeyondMinOrMax &&
                      send({
                        type: "increase/decrease",
                        settingValueKey: activeSettingKey,
                        settingValueIncDecAmount: n,
                      });
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

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
