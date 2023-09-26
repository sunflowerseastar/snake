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
    <Len9Text text={score.toString()} gridWidth={30} />
    <Len9Text
      cx={{ isHighScore, highScore: true }}
      text={highScore.toString()}
      gridWidth={30}
      isRightAligned
    />
  </>
);

export default Score;
