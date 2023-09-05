import { useEffect } from "react";
import { Direction, useGameReducer } from "./hooks/useGameReducer";
import { useInterval } from "./hooks/useInterval";
import Board from "./components/Board";
import GameAreaContainer from "./components/GameAreaContainer";
import Score from "./components/Score";
import Square from "./components/Square";
import { Len9CharsComponent } from "./components/Len9";
import { scoreRow, statusRow } from "./app.css";

const App = () => {
  const [state, dispatch] = useGameReducer();
  const { boardSize, food, isGameOver, isPaused, snake } = state;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (Object.values(Direction).includes(event.key as Direction)) {
        dispatch({ type: "changeDirection", value: event.key as Direction });
        dispatch({ type: "unpause" });
      } else if (event.key === " ") {
        dispatch({ type: "togglePause" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    if (isGameOver) {
      alert("Game Over!");
      dispatch({ type: "startGame" });
    }
  }, [isGameOver]);

  useInterval(
    () => {
      dispatch({ type: "moveSnake" });
    },
    !isPaused ? 100 : null
  );

  return (
    <GameAreaContainer>
      <div>
        <div className={scoreRow}>
          <Score score={snake.length} />
        </div>
        <Board boardSize={boardSize}>
          <>
            {snake.map(({ x, y }) => (
              <Square key={`${x}-${y}`} x={x} y={y} />
            ))}
            <Square x={food.x} y={food.y} isFood />
          </>
        </Board>
        <div className={statusRow}>
          <Len9CharsComponent
            len9Chars={
              isGameOver ? "arrow keys start" : isPaused ? "isPaused" : ""
            }
            gridWidth={60}
          />
        </div>
      </div>
    </GameAreaContainer>
  );
};

export default App;
