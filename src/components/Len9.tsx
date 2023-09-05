import { len9CharsGrid, block0, block1 } from "../app.css";

type BinaryLen9Char = number[];

const binaryLen9Chars: Record<string, BinaryLen9Char> = {
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

export const lookupLen9Char = (l: string): BinaryLen9Char => {
  return l === " " ? [0, 0, 0] : binaryLen9Chars[l.toLowerCase()] || [];
};

export const strToBinaryLen9Chars = (str: string): BinaryLen9Char[] => {
  const acc: BinaryLen9Char[] = [];
  const len9Chars = Array.from(str);

  for (let i = 0; i < len9Chars.length; i++) {
    const l = len9Chars[i];
    const nextLen9Char = len9Chars[i + 1];
    const isNextLen9CharS = nextLen9Char === "s" || nextLen9Char === "S";
    const binaryL = lookupLen9Char(l);
    const canLigature = isNextLen9CharS && binaryL[5] === 0 && binaryL[8] === 0;

    if (canLigature || i + 1 >= len9Chars.length) {
      acc.push(binaryL);
    } else {
      acc.push(binaryL, lookupLen9Char(" "));
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
 * Note that spaces are placed before all len9Chars except 's' in strToBinaryLen9Chars()."
 */
export const len9 = (str: string): number[][] =>
  strToBinaryLen9Chars(str).reduce(
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

type Len9CharsComponentProps = {
  len9Chars: string;
  gridWidth?: number;
  isRightAligned?: boolean;
};

export const Len9CharsComponent: React.FC<Len9CharsComponentProps> = ({
  len9Chars,
  gridWidth = 0,
  isRightAligned = false,
}) => {
  const len9CharsAsThreeRows = len9(len9Chars);

  // TODO extract this as helper (fill with zeros) and add test
  const len9CharsAsThreeRowsPadded =
    gridWidth === 0
      ? len9CharsAsThreeRows
      : len9CharsAsThreeRows.map((len9CharRow) => {
          const delta = gridWidth - len9CharsAsThreeRows[0].length;
          const fillZeros = Array.from({ length: delta }, () => 0);
          return isRightAligned
            ? [...fillZeros, ...len9CharRow]
            : [...len9CharRow, ...fillZeros];
        });

  return (
    <div
      className={len9CharsGrid}
      style={{
        gridTemplateColumns: `repeat(${
          gridWidth > 0 ? gridWidth : len9CharsAsThreeRowsPadded[0].length
        }, 1fr)`,
      }}
    >
      {len9CharsAsThreeRowsPadded.flat().map((x, i) => (
        <div key={i} className={x === 1 ? block1 : block0}></div>
      ))}
    </div>
  );
};
