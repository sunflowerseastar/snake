import classNames from "classnames";
import { cxProp } from "../types";

const Square = ({
  cx,
  x,
  y,
  isFood = false,
}: {
  cx?: cxProp;
  x: number;
  y: number;
  isFood?: boolean;
}) => (
  <div
    key={`${x}-${y}`}
    className={classNames({
      ...cx,
      food: isFood,
      snake: !isFood,
      square: true,
    })}
    style={{
      gridRowStart: y + 1,
      gridColumnStart: x + 1,
    }}
  />
);

export default Square;
