import { gameAreaContainer, gameAreaContainerInner } from "../app.css";

interface GameAreaContainerProps {
  children: React.ReactElement;
}

const GameAreaContainer: React.FC<GameAreaContainerProps> = ({ children }) => (
  <div className={gameAreaContainer}>
    <div className={gameAreaContainerInner}>{children}</div>
  </div>
);

export default GameAreaContainer;
