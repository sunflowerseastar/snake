import { useEffect } from "react";
import { useMachine } from "@xstate/react";

import Board from "./Board";
import Square from "./Square";
import { settingOverlapMachine } from "../machines/settingOverlapMachine";
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
    context: { boardWidth, boardHeight, speed },
  } = useSnakeMachine();

  const [xstate, send] = useMachine(settingSpeedMachine, {
    input: {
      boardWidth,
      boardHeight,
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
    <Board boardWidth={boardWidth} boardHeight={boardHeight}>
      <>
        {snake.map(({ x, y }) => (
          <Square key={`${x}-${y}`} x={x} y={y} />
        ))}
      </>
    </Board>
  );
};

export const OverlapDemonstrationBoard: React.FC = () => {
  const {
    context: { boardWidth, boardHeight, overlap, wall },
  } = useSnakeMachine();

  const [xstate, send] = useMachine(settingOverlapMachine, {
    input: {
      boardWidth,
      boardHeight,
      overlap,
    },
  });
  const {
    context: { crashflashCount, snake },
  } = xstate;

  useEffect(() => {
    send({
      type: "update overlap",
      newOverlap: overlap,
    });
  }, [overlap]);

  return (
    <Board boardWidth={boardWidth} boardHeight={boardHeight}>
      <>
        {snake.map(({ x, y }, i) => (
          <Square
            cx={[{ flash: i === 0 && crashflashCount % 2 !== 0 }]}
            key={`${x}-${y}-${i}`}
            x={x}
            y={y}
          />
        ))}
      </>
    </Board>
  );
};

export const WallDemonstrationBoard: React.FC = () => {
  const {
    context: { boardWidth, boardHeight, wall },
  } = useSnakeMachine();

  const [xstate, send] = useMachine(settingWallMachine, {
    input: {
      boardWidth,
      boardHeight,
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
    <Board boardWidth={boardWidth} boardHeight={boardHeight}>
      <>
        {snake.map(({ x, y }, i) => (
          <Square
            cx={[{ flash: i === 0 && crashflashCount % 2 !== 0 }]}
            key={`${x}-${y}-${i}`}
            x={x}
            y={y}
          />
        ))}
      </>
    </Board>
  );
};
