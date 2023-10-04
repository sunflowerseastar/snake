import { useEffect } from "react";

import Board from "./components/Board";

import Menu from "./components/Menu";
import Score from "./components/Score";
import Square from "./components/Square";
import { Direction } from "./types";
import { Len9Marquee } from "./components/Len9";
import { useSnakeMachine } from "./hooks/useSnakeMachine";

const App = () => {
  const {
    context: {
      boardSize,
      crashflashCount,
      food,
      highScore,
      marqueeMessages,
      newHighScore,
      overlap,
      snake,
    },
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
      <div className="gameplay main-content-container">
        <div className="main-content-container-inner">
          <div className="content-top-row">
            <Score
              highScore={Math.max(newHighScore, highScore)}
              isHighScore={newHighScore > highScore}
              score={snake.length}
            />
          </div>
          <Board boardSize={boardSize}>
            <>
              {snake.map(({ x, y }, i) => (
                <Square
                  cx={{ flash: i === 0 && crashflashCount % 2 !== 0 }}
                  key={overlap ? `${x}-${y}-${i}` : `${x}-${y}`}
                  x={x}
                  y={y}
                />
              ))}
              <Square x={food.x} y={food.y} isFood />
            </>
          </Board>
          <div className="content-bottom-row status-row">
            <Len9Marquee
              key={marqueeMessages.join("")}
              marqueeMessages={marqueeMessages}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
