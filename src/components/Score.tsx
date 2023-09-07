import { Len9CharsComponent } from "./Len9";

const Score = ({ score }: { score: number }) => (
  <div>
    <Len9CharsComponent
      text={score.toString()}
      gridWidth={60}
      isRightAligned
    />
  </div>
);

export default Score;
