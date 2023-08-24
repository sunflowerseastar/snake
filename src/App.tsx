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
      } else {
        if (event.key === " ") {
          dispatch({ type: "pause" });
        }
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
    isPaused ? 100 : null
  );

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
