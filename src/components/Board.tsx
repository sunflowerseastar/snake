interface BgBoardProps {
  boardSize: number;
}
interface BoardProps {
  boardSize: number;
  children: React.ReactElement;
}

export const BgBoard: React.FC<BgBoardProps> = ({ boardSize }) => (
  <div
    className="bg-board"
    style={{
      gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
      gridTemplateRows: `repeat(${boardSize}, 1fr)`,
    }}
  >
    {Array.from({ length: boardSize * boardSize }, (_, i) => {
      const isBoardSizeOdd = boardSize % 2;
      const isEvenRow = Math.floor(i / boardSize) % 2;
      const isEveryOtherSquare = i % 2;
      const isDark = isBoardSizeOdd
        ? !isEveryOtherSquare
        : (isEvenRow && isEveryOtherSquare) ||
          (!isEvenRow && !isEveryOtherSquare);
      return <div key={i} className={isDark ? "bg-square-dark" : ""} />;
    })}
  </div>
);

const Board: React.FC<BoardProps> = ({ boardSize, children }) => (
  <div className="content-middle-row board-container">
    <BgBoard boardSize={boardSize} />
    <div
      className="board"
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
