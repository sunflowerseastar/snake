import { useEffect } from "react";
import classNames from "classnames";

import Board from "./components/Board";

import Menu from "./components/Menu";
import Square from "./components/Square";
import { Direction } from "./types";
import { Len9Marquee } from "./components/Len9";
import { Len9Text } from "./components/Len9";
import { UpdateSettingButton } from "./components/Buttons";
import { useSnakeMachine } from "./hooks/useSnakeMachine";
import { getQueryParam } from "./utilities";

const App = () => {
  const {
    context: {
      boardHeight,
      boardWidth,
      crashflashCount,
      food,
      highScore,
      marqueeMessages,
      newHighScore,
      overlap,
      snake,
      gamepad,
      theme,
    },
    isMenuOpen,
    send,
  } = useSnakeMachine();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (Object.values(Direction).includes(event.key as Direction)) {
        send({ type: "arrow key", arrowDirection: event.key as Direction });
      } else if (event.key === "h") {
        send({ type: "arrow key", arrowDirection: Direction.ArrowLeft });
      } else if (event.key === "j") {
        send({ type: "arrow key", arrowDirection: Direction.ArrowDown });
      } else if (event.key === "k") {
        send({ type: "arrow key", arrowDirection: Direction.ArrowUp });
      } else if (event.key === "l") {
        send({ type: "arrow key", arrowDirection: Direction.ArrowRight });
      } else if (event.key === "m") {
        send({ type: "toggle menu" });
      } else if (event.key === " ") {
        send({ type: "spacebar" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [send]);

  // Handle query params
  useEffect(() => {
    const themeQueryParam = getQueryParam("theme");
    // Query param overrides theme setting temporarily (no localStorage update)
    const effectiveTheme =
      themeQueryParam === "light" || themeQueryParam === "dark"
        ? themeQueryParam
        : theme;

    const htmlElement = document.documentElement;
    if (effectiveTheme === "dark") {
      htmlElement.classList.add("dark-theme");
    } else {
      htmlElement.classList.remove("dark-theme");
    }
  }, [theme]);

  return (
    <>
      <Menu />
      <div className={`main-content-container gamepad-${gamepad}`}>
        <div className="main-content-container-inner">
          <div className="content-top-row">
            <Len9Text text={snake.length.toString()} />
            <Len9Text
              cx={["high-score", { isHighScore: newHighScore > highScore }]}
              text={Math.max(newHighScore, highScore).toString()}
              isRightAligned
            />
            <UpdateSettingButton
              onClick={() => send({ type: "toggle menu" })}
              text={isMenuOpen ? "x" : "+"}
            />
          </div>

          <Board
            boardWidth={boardWidth}
            boardHeight={boardHeight}
            onClick={() => send({ type: "spacebar" })}
          >
            <>
              {snake.map(({ x, y }, i) => (
                <Square
                  cx={[{ flash: i === 0 && crashflashCount % 2 !== 0 }]}
                  key={overlap ? `${x}-${y}-${i}` : `${x}-${y}`}
                  x={x}
                  y={y}
                />
              ))}
              <Square x={food.x} y={food.y} isFood />
            </>
          </Board>

          <div
            className={`content-bottom-row marquee-messages-row gamepad-${gamepad}`}
          >
            <Len9Marquee
              cx={["marquee-gamepad"]}
              key={marqueeMessages.gamepad.join("")}
              marqueeMessages={marqueeMessages.gamepad}
            />
            <Len9Marquee
              cx={["marquee-desktop"]}
              key={["desktop", ...marqueeMessages.desktop].join("")}
              marqueeMessages={marqueeMessages.desktop}
            />
          </div>
        </div>
      </div>

      <div className={`gamepad-controls-container gamepad-${gamepad}`}>
        <div className={classNames("hit-area-container", `gamepad-${gamepad}`)}>
          <div className="hit-area-row">
            <button
              onClick={() =>
                send({ type: "arrow key", arrowDirection: Direction.ArrowUp })
              }
              className="hit-area-up"
            />
            <button
              onClick={() =>
                send({
                  type: "arrow key",
                  arrowDirection: Direction.ArrowRight,
                })
              }
              className="hit-area-right"
            />
          </div>
          <div className="hit-area-row">
            <button
              onClick={() =>
                send({ type: "arrow key", arrowDirection: Direction.ArrowLeft })
              }
              className="hit-area-left"
            />
            <button
              onClick={() =>
                send({ type: "arrow key", arrowDirection: Direction.ArrowDown })
              }
              className="hit-area-down"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
