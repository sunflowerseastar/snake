import { Len9Text } from "./Len9";

const Score = ({ highScore, score }: { highScore: number; score: number }) => (
  <>
    <Len9Text text={highScore.toString()} gridWidth={30} />
    <Len9Text text={score.toString()} gridWidth={30} isRightAligned />
  </>
);

export default Score;
