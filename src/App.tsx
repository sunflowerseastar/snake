import React, { useEffect } from "react";
import { Direction, useGameReducer } from "./hooks/useGameReducer";
import { useInterval } from "./hooks/useInterval";
import { GameBoard, SnakeSquare, Food } from "./style";

const App: React.FC = () => {
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

  // TODO style cleanup (put in middle of viewport, soften colors)

  // TODO add some sort of scoring

  return (
    <GameBoard boardSize={boardSize}>
      {snake.map((snakeSquare, i) => (
        <SnakeSquare
          key={i}
          style={{
            gridRowStart: snakeSquare.y + 1,
            gridColumnStart: snakeSquare.x + 1,
          }}
        />
      ))}
      <Food style={{ gridRowStart: food.y + 1, gridColumnStart: food.x + 1 }} />
    </GameBoard>
  );
};

export default App;
