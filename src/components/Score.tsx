import { Len9CharsComponent } from "./Len9";

const Score = ({ score }: { score: number }) => (
  <div>
    <Len9CharsComponent
      len9Chars={score.toString()}
      gridWidth={60}
      isRightAligned
    />
  </div>
);

export default Score;
