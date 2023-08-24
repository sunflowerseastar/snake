// ## src/styles/GameStyles.ts
import styled from 'styled-components';

// Define a common grid item for snake part and food
const GridItem = styled.div`
  grid-column-start: 1;
  grid-row-start: 1;
`;

export const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  grid-template-rows: repeat(20, 1fr);
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
