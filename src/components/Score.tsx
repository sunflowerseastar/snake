import { Len9Text } from "./Len9";

const Score = ({
  highScore,
  isHighScore = false,
  score,
}: {
  highScore: number;
  isHighScore: boolean;
  score: number;
}) => (
  <>
    <Len9Text text={score.toString()} />
    <Len9Text
      cx={["high-score", { isHighScore }]}
      text={highScore.toString()}
      isRightAligned
    />
  </>
);

export default Score;
