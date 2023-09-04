import { lettersGrid, block0, block1 } from "../app.css";
// console.log('letters', letters);

type BinaryLetter = number[];

// TODO rename 'letters' to 'characters'

const binaryLetters: Record<string, BinaryLetter> = {
  a: [0, 1, 0, 1, 1, 1, 1, 0, 1],
  b: [1, 0, 0, 1, 1, 1, 1, 1, 1],
  c: [1, 1, 1, 1, 0, 0, 1, 1, 1],
  d: [0, 0, 1, 1, 1, 1, 1, 1, 1],
  e: [1, 1, 1, 1, 1, 0, 1, 1, 1],
  f: [1, 1, 1, 1, 1, 0, 1, 0, 0],
  g: [1, 1, 0, 1, 0, 1, 1, 1, 1],
  h: [1, 0, 1, 1, 1, 1, 1, 0, 1],
  i: [1, 1, 1, 0, 1, 0, 1, 1, 1],
  j: [0, 0, 1, 1, 0, 1, 1, 1, 1],
  k: [1, 0, 1, 1, 1, 0, 1, 0, 1],
  l: [1, 0, 0, 1, 0, 0, 1, 1, 1],
  m: [1, 1, 1, 1, 1, 1, 1, 0, 1],
  n: [0, 0, 1, 1, 1, 1, 1, 0, 0],
  o: [1, 1, 1, 1, 0, 1, 1, 1, 1],
  p: [1, 1, 1, 1, 1, 1, 1, 0, 0],
  q: [1, 1, 0, 1, 1, 0, 0, 0, 1],
  r: [1, 1, 0, 1, 1, 0, 1, 0, 1],
  s: [0, 1, 1, 0, 1, 0, 1, 1, 0],
  t: [1, 1, 1, 0, 1, 0, 0, 1, 0],
  u: [1, 0, 1, 1, 0, 1, 1, 1, 1],
  v: [1, 0, 1, 1, 0, 1, 0, 1, 0],
  w: [1, 0, 1, 1, 1, 1, 1, 1, 1],
  x: [1, 0, 1, 0, 1, 0, 1, 0, 1],
  y: [1, 0, 1, 1, 1, 1, 0, 1, 0],
  z: [1, 1, 0, 0, 1, 0, 0, 1, 1],
  "-": [0, 0, 0, 1, 1, 1, 0, 0, 0],
  "1": [1, 1, 0, 0, 1, 0, 1, 1, 1],
  "2": [1, 1, 0, 0, 1, 0, 0, 1, 1],
  "3": [1, 1, 1, 0, 1, 1, 1, 1, 1],
  "4": [1, 0, 1, 1, 1, 1, 0, 0, 1],
  "5": [0, 1, 1, 0, 1, 0, 1, 1, 0],
  "6": [1, 0, 0, 1, 1, 1, 1, 1, 1],
  "7": [1, 1, 1, 0, 0, 1, 0, 0, 1],
  "8": [0, 1, 1, 1, 1, 1, 1, 1, 1],
  "9": [1, 1, 1, 1, 1, 1, 0, 0, 1],
  "0": [1, 1, 1, 1, 0, 1, 1, 1, 1],
};

export const lookupLetter = (l: string): BinaryLetter => {
  return l === " " ? [0, 0, 0] : binaryLetters[l.toLowerCase()] || [];
};

export const strToBinaryLetters = (str: string): BinaryLetter[] => {
  const acc: BinaryLetter[] = [];
  const letters = Array.from(str);

  for (let i = 0; i < letters.length; i++) {
    const l = letters[i];
    const nextLetter = letters[i + 1];
    const isNextLetterS = nextLetter === "s" || nextLetter === "S";
    const binaryL = lookupLetter(l);
    const canLigature = isNextLetterS && binaryL[5] === 0 && binaryL[8] === 0;

    if (canLigature || i + 1 >= letters.length) {
      acc.push(binaryL);
    } else {
      acc.push(binaryL, lookupLetter(" "));
    }
  }

  return acc;
};

/*
 * "Given a string, return a 3xn grid of them spelled as len-9. Ex. 'Abc':
 *
 * before:
 * [[010111101] [000] [100111111] [000] [111100111]]
 *
 * after:
 * [[010 0 100 0 111]
 *  [111 0 111 0 100]
 *  [101 0 111 0 111]]
 *
 * Note that spaces are placed before all letters except 's' in strToBinaryLetters()."
 */
export const len9 = (str: string): number[][] =>
  strToBinaryLetters(str).reduce(
    ([topRow, middleRow, bottomRow], l) => {
      const len = l.length;
      const third = len / 3;
      return [
        [...topRow, ...l.slice(0, third)],
        [...middleRow, ...l.slice(third, third * 2)],
        [...bottomRow, ...l.slice(third * 2, len)],
      ];
    },
    [[], [], []]
  );

type LettersComponentProps = {
  letters: string;
  gridWidth: number;
  isRightAligned: boolean;
};

export const LettersComponent: React.FC<LettersComponentProps> = ({
  letters,
  gridWidth = 0,
  isRightAligned = false,
}) => {
  const lettersAsThreeRows = len9(letters);

  // TODO extract this as helper (fill with zeros) and add test
  const lettersAsThreeRowsPadded =
    gridWidth === 0
      ? lettersAsThreeRows
      : lettersAsThreeRows.map((letterRow) => {
          const delta = gridWidth - lettersAsThreeRows[0].length;
          const fillZeros = Array.from({ length: delta }, () => 0);
          return isRightAligned
            ? [...fillZeros, ...letterRow]
            : [...letterRow, ...fillZeros];
        });

  return (
    <div
      className={lettersGrid}
      style={{
        gridTemplateColumns: `repeat(${
          gridWidth > 0 ? gridWidth : lettersAsThreeRowsPadded[0].length
        }, 1fr)`,
      }}
    >
      {lettersAsThreeRowsPadded.flat().map((x, i) => (
        <div key={i} className={x === 1 ? block1 : block0}></div>
      ))}
    </div>
  );
};
