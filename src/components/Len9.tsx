import { useEffect, useRef, useState } from "react";
import { len9CharsGrid, block0, block1 } from "../app.css";
import { useTimeout } from "../hooks/useTimeout";
import {
  Transducer,
  cat,
  comp,
  concat,
  distinct,
  filter,
  flatten,
  flatten1,
  flattenWith,
  indexed,
  interleave,
  iterator,
  map,
  mapIndexed,
  padLast,
  padSides,
  partition,
  peek,
  pluck,
  push,
  range,
  repeat,
  slidingWindow,
  step,
  take,
  trace,
  transduce,
  zip,
} from "@thi.ng/transducers";

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

export const lookupLen9Char = (char: string): BinaryLen9Char =>
  char === " " ? [0, 0, 0] : binaryLen9Chars[char.toLowerCase()] || [];

/*
 * "Given a string, return a [[]] of the binary len-9 characters. A space
 * follows every character except the last one and any character before an 's'
 * that won't touch the 's' even if the space isn't there.
 *
 * 'abc': [[010111101] [000] [100111111] [000] [111100111]]
 * 'as': [[010111101] [000] [011010110]
 * 'ts': [[111010010] [011010110]
 */
export const strToBinaryLen9Chars = (str: string): BinaryLen9Char[] => {
  const charArr = Array.from(str);

  return charArr.flatMap((c, i) => {
    const l9c = lookupLen9Char(c);
    const canOmitSpaceBeforeS =
      charArr[i + 1] &&
      charArr[i + 1].toLowerCase() === "s" &&
      l9c[5] === 0 &&
      l9c[8] === 0;
    // const canOmitSpaceBefore2 =
    //   charArr[i + 1] && charArr[i + 1] === "2" && l9c[5] === 0 && l9c[8] === 0;
    // const canOmitSpaceBefore7 =
    //   charArr[i + 1] && charArr[i + 1] === "7" && l9c[2] === 0 && l9c[5] === 0;
    const isLastLetter = i + 1 === charArr.length;
    return isLastLetter || canOmitSpaceBeforeS
      ? [l9c]
      : [l9c, lookupLen9Char(" ")];
  });
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
 * Note that spaces are placed before all len9Chars except 's' in
 * strToBinaryLen9Chars()."
 */
export const len9 = (str: string) =>
  strToBinaryLen9Chars(str).reduce(
    ([topRow, middleRow, bottomRow], len9Char) => {
      const len = len9Char.length;
      const third = len / 3;
      return [
        [...topRow, ...len9Char.slice(0, third)],
        [...middleRow, ...len9Char.slice(third, third * 2)],
        [...bottomRow, ...len9Char.slice(third * 2, len)],
      ];
    },
    [[], [], []] as number[][]
  );

export const padWithZeros = (
  len9: BinaryLen9Char[],
  gridWidth = 0,
  isRightAligned = false
) =>
  gridWidth === 0
    ? len9
    : len9.map((len9CharRow) => {
        const delta = gridWidth - len9CharRow.length;
        return isRightAligned
          ? [...concat(repeat(0, delta), len9CharRow)]
          : [...concat(len9CharRow, repeat(0, delta))];
      });

type Len9TextProps = {
  text: string;
  gridWidth?: number;
  isRightAligned?: boolean;
};

export const Len9Text: React.FC<Len9TextProps> = ({
  text,
  gridWidth = 0,
  isRightAligned = false,
}) => {
  const len9CharsAsThreeRows = len9(text);

  const len9CharsAsThreeRowsPadded = padWithZeros(
    len9CharsAsThreeRows,
    gridWidth,
    isRightAligned
  );

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

const concatArrayPairs = map(([a, b]: [number[], number[]]) => [
  ...concat(a, b),
]);

const sliceSubArrays = (currScrollPosition: number, gridWidth: number) =>
  map((arr: number[]) =>
    arr.slice(currScrollPosition, currScrollPosition + gridWidth)
  );

export const combineAndSliceSubArrays = (
  len9a: number[][],
  len9b: number[][],
  currScrollPosition: number,
  gridWidth: number
) =>
  transduce(
    comp(concatArrayPairs, sliceSubArrays(currScrollPosition, gridWidth)),
    push(),
    zip(len9a, len9b)
  );

type Len9MarqueeProps = {
  textArr: string[];
  gridWidth?: number;
  isRightAligned?: boolean;
};

export const Len9Marquee: React.FC<Len9MarqueeProps> = ({
  textArr,
  gridWidth = 0,
  isRightAligned = false,
}) => {
  const [currScrollPosition, setCurrScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isText1First, setIsText1First] = useState(false);
  const [text1, text2] = textArr;

  console.log("isScrolling", isScrolling);

  /* This ref is used as the interval's internal scroll counter, because
   * otherwise the useEffect itself would be re-run over and over every time
   * that currScrollPosition was bumped. */
  const scrollPositionRef = useRef(0);


  // TODO if there is no text in the array, don't do anything

  // TODO if there is only one text in the array, don't marquee it

  // TODO add an overall position reset every time the text array changes

  useEffect(() => {
    if (isScrolling) {
      let scrollInterval = setInterval(() => {
        if (scrollPositionRef.current < gridWidth) {
          scrollPositionRef.current = scrollPositionRef.current + 1;
          setCurrScrollPosition(scrollPositionRef.current);
        } else {
          // stop scrolling and clean up interval
          setIsScrolling(false);
          clearInterval(scrollInterval);

          // reset scroll positions and swap texts
          setIsText1First((prevIsText1First) => !prevIsText1First);
          scrollPositionRef.current = 0;
          setCurrScrollPosition(0);

          setTimeout(() => {
            // restart animation
            setIsScrolling(true);
          }, 2000);
        }
      }, 50);
    }
  }, [isScrolling]);

  useTimeout(() => {
    console.log("timeout!");
    setIsScrolling(true);
    // start the number count down to scroll the text
  }, 1000);

  const firstMessage: number[][] = padWithZeros(
    len9(isText1First ? text1 : text2),
    gridWidth,
    isRightAligned
  );
  const secondMessage: number[][] = padWithZeros(
    len9(isText1First ? text2 : text1),
    gridWidth,
    isRightAligned
  );

  const len9Chars = combineAndSliceSubArrays(
    firstMessage,
    secondMessage,
    currScrollPosition,
    gridWidth
  );
  // console.log('len9Chars', len9Chars);

  return (
    <div
      className={len9CharsGrid}
      style={{
        gridTemplateColumns: `repeat(${
          gridWidth > 0 ? gridWidth : firstMessage[0].length
        }, 1fr)`,
      }}
    >
      {len9Chars.flat().map((x, i) => (
        <div key={i} className={x === 1 ? block1 : block0}></div>
      ))}
    </div>
  );
};
