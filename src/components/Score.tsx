import { LettersComponent } from "./Len9";

const Score = ({ score }: { score: number }) => (
  <div>
    <LettersComponent
      letters={score.toString()}
      gridWidth={60}
      isRightAligned
    />
  </div>
);

export default Score;
