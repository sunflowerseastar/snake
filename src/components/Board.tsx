import {
  bgBoard,
  bgSquareDark,
  bgSquareLight,
  board,
  boardContainer,
} from "../app.css";

interface BoardProps {
  boardSize: number;
  children: React.ReactElement;
}

const Board: React.FC<BoardProps> = ({ boardSize, children }) => (
  <div className={boardContainer}>
    <div
      className={bgBoard}
      style={{
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gridTemplateRows: `repeat(${boardSize}, 1fr)`,
      }}
    >
      {Array.from({ length: boardSize * boardSize }, () => 0).map((_, i) => {
        const isEvenRow = Math.floor(i / boardSize) % 2;
        const isEvenColumn = i % 2;
        return (
          <div
            key={i}
            className={
              (isEvenRow && isEvenColumn) || (!isEvenRow && !isEvenColumn)
                ? bgSquareDark
                : bgSquareLight
            }
          />
        );
      })}
    </div>
    <div
      className={board}
      style={{
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gridTemplateRows: `repeat(${boardSize}, 1fr)`,
      }}
    >
      {children}
    </div>
  </div>
);

export default Board;
