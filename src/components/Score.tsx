import { Len9Text } from "./Len9";

const Score = ({ highScore, score }: { highScore: number; score: number }) => (
  <div>
    <Len9Text text={highScore.toString()} gridWidth={60} />
    <Len9Text text={score.toString()} gridWidth={60} isRightAligned />
  </div>
);

export default Score;
