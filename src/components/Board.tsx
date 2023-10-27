interface BgBoardProps {
  boardHeight: number;
  boardWidth: number;
}
interface BoardProps {
  boardHeight: number;
  boardWidth: number;
  children: React.ReactElement;
  onClick?: React.MouseEventHandler;
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

const Board: React.FC<BoardProps> = ({
  boardHeight,
  boardWidth,
  children,
  onClick,
}) => (
  <div className="content-middle-row board-container" onClick={onClick}>
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
