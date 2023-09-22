interface GameAreaContainerProps {
  children: React.ReactElement;
}

const GameAreaContainer: React.FC<GameAreaContainerProps> = ({ children }) => (
  <div className="game-area-container">
    <div className="game-area-container-inner">{children}</div>
  </div>
);

export default GameAreaContainer;
