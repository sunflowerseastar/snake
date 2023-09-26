import { useEffect } from "react";

import Board from "./components/Board";

import GameAreaContainer from "./components/GameAreaContainer";
import Score from "./components/Score";
import Square from "./components/Square";
import { Direction, useSnakeMachine } from "./hooks/useSnakeMachine";
import { Len9Marquee } from "./components/Len9";

const App = () => {
  const {
    context: {
      boardSize,
      food,
      highScore,
      marqueeMessages,
      newHighScore,
      snake,
    },
    send,
  } = useSnakeMachine();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (Object.values(Direction).includes(event.key as Direction)) {
        send({ type: "arrow key", value: event.key as Direction });
      } else if (event.key === " ") {
        send({ type: "spacebar" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [send]);

  return (
    <>
      <GameAreaContainer>
        <div>
          <div className="score-row">
            <Score
              highScore={Math.max(newHighScore, highScore)}
              isHighScore={newHighScore > highScore}
              score={snake.length}
            />
          </div>
          <Board boardSize={boardSize}>
            <>
              {snake.map(({ x, y }) => (
                <Square key={`${x}-${y}`} x={x} y={y} />
              ))}
              <Square x={food.x} y={food.y} isFood />
            </>
          </Board>
          <div className="status-row">
            <Len9Marquee
              key={marqueeMessages.join("")}
              marqueeMessages={marqueeMessages}
            />
          </div>
        </div>
      </GameAreaContainer>
    </>
  );
};

export default App;
