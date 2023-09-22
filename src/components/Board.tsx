interface BoardProps {
  boardSize: number;
  children: React.ReactElement;
}

const Board: React.FC<BoardProps> = ({ boardSize, children }) => (
  <div className="board-container">
    <div
      className="bg-board"
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
                ? "bg-square-dark"
                : "bg-square-light"
            }
          />
        );
      })}
    </div>
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
