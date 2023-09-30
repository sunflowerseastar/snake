import { useEffect } from "react";
import { useMachine } from "@xstate/react";

import Board from "./Board";
import Square from "./Square";
import { settingSpeedMachine } from "../machines/settingSpeedMachine";
import { useSnakeMachine } from "../hooks/useSnakeMachine";

export const SpeedDemonstrationBoard: React.FC = () => {
  const {
    context: { boardSize, speed },
  } = useSnakeMachine();

  const [xstate, send] = useMachine(settingSpeedMachine, {
    input: {
      boardSize,
      speed,
    },
  });
  const {
    context: { snake },
  } = xstate;

  useEffect(() => {
    send({
      type: "update speed",
      newSpeed: speed,
    });
  }, [speed]);

  return (
    <Board boardSize={boardSize}>
      <>
        {snake.map(({ x, y }) => (
          <Square key={`${x}-${y}`} x={x} y={y} />
        ))}
      </>
    </Board>
  );
};
