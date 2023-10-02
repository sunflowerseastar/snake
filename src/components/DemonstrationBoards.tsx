import { useEffect } from "react";
import { useMachine } from "@xstate/react";

import Board from "./Board";
import Square from "./Square";
import { settingSpeedMachine } from "../machines/settingSpeedMachine";
import { settingWallMachine } from "../machines/settingWallMachine";
import { useSnakeMachine } from "../hooks/useSnakeMachine";

/*
 * When the user updates settings, the Xstate context values are adjusted in the
 * snakeMachine (which is provided via useSnakeMachine() context). Those
 * settings are then provided to the demonstration boards as the Xstate
 * machine's context initial values ("input").
 */
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

export const WallDemonstrationBoard: React.FC = () => {
  const {
    context: { boardSize, wall },
  } = useSnakeMachine();

  const [xstate, send] = useMachine(settingWallMachine, {
    input: {
      boardSize,
      wall,
    },
  });
  const {
    context: { crashflashCount, snake },
  } = xstate;

  useEffect(() => {
    send({
      type: "update wall",
      newWall: wall,
    });
  }, [wall]);

  return (
    <Board boardSize={boardSize}>
      <>
        {snake.map(({ x, y }, i) => (
          <Square
            cx={{ flash: i === 0 && crashflashCount % 2 !== 0 }}
            key={`${x}-${y}`}
            x={x}
            y={y}
          />
        ))}
      </>
    </Board>
  );
};
