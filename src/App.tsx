import { useEffect } from "react";
import { Direction, useGameReducer } from "./hooks/useGameReducer";
import { useInterval } from "./hooks/useInterval";
import Board from "./components/Board";
import BoardContainer from "./components/BoardContainer";
import Square from "./components/Square";

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

  // TODO add some sort of scoring

  return (
    <BoardContainer>
      <Board boardSize={boardSize}>
        <>
          {snake.map((snakeSquare) => (
            <Square
              key={`${snakeSquare.x}-${snakeSquare.y}`}
              x={snakeSquare.x}
              y={snakeSquare.y}
            />
          ))}
          <Square x={food.x} y={food.y} isFood />
        </>
      </Board>
    </BoardContainer>
  );
};

export default App;
