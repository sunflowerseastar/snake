import { useEffect } from "react";
import {
  Direction,
  GamePlayState,
  useGameReducer,
} from "./hooks/useGameReducer";
import { useInterval } from "./hooks/useInterval";
import Board from "./components/Board";
import GameAreaContainer from "./components/GameAreaContainer";
import Score from "./components/Score";
import Square from "./components/Square";
import { Len9Marquee } from "./components/Len9";
import { scoreRow, statusRow } from "./app.css";

const App = () => {
  const [state, dispatch] = useGameReducer();
  const {
    boardSize,
    food,
    gamePlayState,
    highScore,
    isGameOver,
    snake,
    tickSpeedMs,
  } = state;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (Object.values(Direction).includes(event.key as Direction)) {
        dispatch({ type: "pressArrowKey", value: event.key as Direction });
      } else if (event.key === " ") {
        dispatch({ type: "pressSpace" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    if (isGameOver) {
      dispatch({ type: "endGame" });
    }
  }, [isGameOver]);

  useInterval(
    () => {
      dispatch({ type: "moveSnake" });
    },
    gamePlayState === GamePlayState.unpaused ? tickSpeedMs : null
  );

  return (
    <GameAreaContainer>
      <div>
        <div className={scoreRow}>
          <Score highScore={highScore} score={snake.length} />
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
          <Len9Marquee
            key={gamePlayState}
            textArr={
              gamePlayState === GamePlayState.ready
                ? ["ready", "spc ^ _ < >"]
                : gamePlayState === GamePlayState.over
                ? ["game over", "spc reset"]
                : gamePlayState === GamePlayState.paused
                ? ["paused"]
                : [""]
            }
            gridWidth={60}
          />
        </div>
      </div>
    </GameAreaContainer>
  );
};

export default App;
