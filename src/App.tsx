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
        <div className="score-row">
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
        <div className="status-row">
          <Len9Marquee
            key={gamePlayState}
            marqueeMessages={
              gamePlayState === GamePlayState.ready
                ? ["ready", "move: ^ _ < >", "spc: pause"]
                : gamePlayState === GamePlayState.over
                ? ["game over", "spc: reset"]
                : gamePlayState === GamePlayState.paused
                ? ["paused", "spc: unpause"]
                : [""]
            }
          />
        </div>
      </div>
    </GameAreaContainer>
  );
};

export default App;
