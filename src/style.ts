// ## src/styles/GameStyles.ts
import styled from "styled-components";

// Define a common grid item for snake part and food
const GridItem = styled.div`
  grid-column-start: 1;
  grid-row-start: 1;
`;

type GameBoardProps = {
  boardSize: number;
};
export const GameBoard = styled.div<GameBoardProps>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.boardSize}, 1fr);
  grid-template-rows: repeat(${(props) => props.boardSize}, 1fr);
  gap: 1px;
  width: 400px;
  height: 400px;
  background-color: #000;
`;

export const SnakeSquare = styled(GridItem)`
  background-color: #0f0;
`;

export const Food = styled(GridItem)`
  background-color: #f00;
`;
