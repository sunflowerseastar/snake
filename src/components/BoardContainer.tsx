import { boardContainer, boardContainerInner } from "../app.css";

interface BoardContainerProps {
  children: React.ReactElement;
}

const BoardContainer: React.FC<BoardContainerProps> = ({ children }) => (
  <div className={boardContainer}>
    <div className={boardContainerInner}>{children}</div>
  </div>
);

export default BoardContainer;
