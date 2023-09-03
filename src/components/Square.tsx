import { snake, food } from '../app.css'

const Square = ({
  x,
  y,
  isFood = false,
}: {
  x: number;
  y: number;
  isFood?: boolean;
}) => (
  <div
  key={`${x}-${y}`}
  className={isFood ? food : snake}
    style={{
      gridRowStart: y + 1,
      gridColumnStart: x + 1,
    }}
  />
);

export default Square;
