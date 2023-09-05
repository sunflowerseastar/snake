import { board } from "../app.css";

interface BoardProps {
  boardSize: number;
  children: React.ReactElement;
}

const Board: React.FC<BoardProps> = ({ boardSize, children }) => (
  <div
    className={board}
    style={{
      gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
      gridTemplateRows: `repeat(${boardSize}, 1fr)`,
    }}
  >
    {children}
  </div>
);

export default Board;
