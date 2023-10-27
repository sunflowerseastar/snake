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
      touch,
    },
    isMenuOpen,
    send,
  } = useSnakeMachine();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (Object.values(Direction).includes(event.key as Direction)) {
        send({ type: "arrow key", arrowDirection: event.key as Direction });
      } else if (event.key === " ") {
        send({ type: "spacebar" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [send]);

  return (
    <>
      <Menu />
      <div className={`main-content-container touch-${touch}`}>
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
            className={`content-bottom-row marquee-messages-row touch-${touch}`}
          >
            <Len9Marquee
              cx={["marquee-touch"]}
              key={marqueeMessages.touch.join("")}
              marqueeMessages={marqueeMessages.touch}
            />
            <Len9Marquee
              cx={["marquee-desktop"]}
              key={["desktop", ...marqueeMessages.desktop].join("")}
              marqueeMessages={marqueeMessages.desktop}
            />
          </div>
        </div>
      </div>

      <div className={`touch-controls-container touch-${touch}`}>
        <div className={classNames("hit-area-container", `touch-${touch}`)}>
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
