interface BgBoardProps {
  boardWidth: number;
  boardHeight: number;
}
interface BoardProps {
  boardWidth: number;
  boardHeight: number;
  children: React.ReactElement;
}

export const BgBoard: React.FC<BgBoardProps> = ({
  boardWidth,
  boardHeight,
}) => (
  <div
    className="bg-board"
    style={{
      gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
      gridTemplateRows: `repeat(${boardHeight}, 1fr)`,
      aspectRatio: `${boardWidth} / ${boardHeight}`,
    }}
  >
    {Array.from({ length: boardWidth * boardHeight }, (_, i) => {
      const isBoardSizeOdd = boardWidth % 2;
      const isEvenRow = Math.floor(i / boardWidth) % 2;
      const isEveryOtherSquare = i % 2;
      const isDark = isBoardSizeOdd
        ? !isEveryOtherSquare
        : (isEvenRow && isEveryOtherSquare) ||
          (!isEvenRow && !isEveryOtherSquare);
      return <div key={i} className={isDark ? "bg-square-dark" : ""} />;
    })}
  </div>
);

const Board: React.FC<BoardProps> = ({ boardWidth, boardHeight, children }) => (
  <div className="content-middle-row board-container">
    <BgBoard boardWidth={boardWidth} boardHeight={boardHeight} />
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
        gridTemplateRows: `repeat(${boardHeight}, 1fr)`,
        aspectRatio: `${boardWidth} / ${boardHeight}`,
      }}
    >
      {children}
    </div>
  </div>
);

export default Board;
