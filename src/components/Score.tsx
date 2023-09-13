import { Len9Text } from "./Len9";

import { useContext } from 'react';
import { GameContext } from '../App';

const Score = ({ score }: { score: number }) => {
  const { state } = useContext(GameContext);

  return (
    <div>
      <Len9Text
        text={score.toString()}
        gridWidth={60}
        isRightAligned
      />
      <Len9Text
        text={state.highScore.toString()}
        gridWidth={60}
        isLeftAligned
      />
    </div>
  );
};

export default Score;
