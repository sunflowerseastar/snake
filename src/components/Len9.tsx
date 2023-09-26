import { useEffect, useMemo, useRef, useState } from "react";
import { useTimeout } from "../hooks/useTimeout";
import {
  comp,
  concat,
  iterator,
  map,
  push,
  repeat,
  transduce,
  zip,
} from "@thi.ng/transducers";

const SCROLL_DELAY_MS = 3000;
const SCROLL_SPEED_MS = 60;

const binaryLen9Chars: Record<string, number[]> = {
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
  "^": [0, 1, 0, 1, 1, 1, 0, 0, 0],
  _: [0, 0, 0, 1, 1, 1, 0, 1, 0],
  ":": [0, 1, 0, 0, 0, 0, 0, 1, 0],
  "<": [0, 1, 1, 1, 0, 1],
  ">": [1, 0, 1, 1, 1, 0],
  ".": [0, 0, 0, 0, 0, 0, 0, 1, 0],
  "/": [0, 0, 1, 0, 1, 0, 1, 0, 0],
};

export const lookupLen9Char = (char: string): number[] =>
  char === " " ? [0, 0, 0] : binaryLen9Chars[char.toLowerCase()] || [];

/*
 * "Given a string, return a [[]] of the binary len-9 characters. A space
 * follows every character except the last one and any character before an 's'
 * that won't touch the 's' even if the space isn't there.
 *
 * 'abc': [[010111101] [000] [100111111] [000] [111100111]]
 * 'as':  [[010111101] [000] [011010110]
 * 'ts':  [[111010010] [011010110]
 */
export const strToBinaryLen9Chars = (str: string): number[][] => {
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

const padWithZeros =
  (gridWidth: number, isRightAligned: boolean = false) =>
  (len9: number[][]) =>
    len9.map((len9CharRow: number[]) =>
      isRightAligned
        ? [...concat(repeat(0, gridWidth - len9CharRow.length), len9CharRow)]
        : [...concat(len9CharRow, repeat(0, gridWidth - len9CharRow.length))]
    );

export const convertToLen9AndAddPadding = (
  marqueeMessages: string[],
  gridWidth: number = 0,
  isRightAligned: boolean = false
): number[][][] =>
  transduce(
    comp(map(len9), map(padWithZeros(gridWidth, isRightAligned))),
    push(),
    marqueeMessages
  );

type Len9DisplayComponentProps = {
  len9: number[][];
  gridWidth?: number;
};

const Len9DisplayComponent: React.FC<Len9DisplayComponentProps> = ({
  len9,
  gridWidth = 0,
}) => (
  <div
    className="len-9-chars-grid"
    style={{
      gridTemplateColumns: `repeat(${
        gridWidth > 0 ? gridWidth : len9.length / 3
      }, 1fr)`,
    }}
  >
    {len9.flat().map((x, i) => (
      <div key={i} className={x === 1 ? "block block1" : "block block0"}></div>
    ))}
  </div>
);

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
  /*
   * 'text' is array-ified (`[text]`) and then subsequently flattened so that the
   * convertToLen9AndAddPadding() utility function can be shared with Len9Marquee's
   * `marqueeMessages`.
   */
  const len9CharsReadyForDisplay: number[][] = convertToLen9AndAddPadding(
    [text],
    gridWidth,
    isRightAligned
  ).flat();

  return (
    <Len9DisplayComponent
      len9={len9CharsReadyForDisplay}
      gridWidth={gridWidth}
    />
  );
};

// Utility functions for Len9Marquee

/*
 * in (with 'A' and 'B' instead of `1` for illustration):
 *
 * [[- A - -]
 *  [A A A -]
 *  [A - A -]]
 *
 * [[B - - -]
 *  [B B B -]
 *  [B B B -]]
 *
 * ...:
 *
 * [[[- A - -] [B - - -]]
 *  [[A A A -] [B B B -]]
 *  [[A - A -] [B B B -]]]
 *
 * out:
 *
 * [[- A - - B - - -]
 *  [A A A - B B B -]
 *  [A - A - B B B -]]
 */
export const combineArrays = (
  len9a: number[][],
  len9b: number[][]
): Iterable<number[]> =>
  transduce(
    map((arrs: [number[], number[]]) => [...concat(...arrs)]),
    push(),
    zip(len9a, len9b)
  );

/*
 * in (with 'A' and 'B' instead of `1` for illustration):
 *
 * [[- A - - B - - -]
 *  [A A A - B B B -]
 *  [A - A - B B B -]]
 *     ^-----^ (currScrollPosition 1, gridWidth 3)
 *
 * ...:
 *
 * [[A - - B]
 *  [A A - B]
 *  [- A - B]]
 *
 * out:
 *
 * [[A - - B A A - B - A - B]]
 */
const sliceSubArraysAndCat = (currScrollPosition: number, gridWidth: number) =>
  map((arr: number[]) =>
    arr.slice(currScrollPosition, currScrollPosition + gridWidth)
  );

type Len9MarqueeProps = {
  marqueeMessages: string[];
  gridWidth?: number;
};

export const Len9Marquee: React.FC<Len9MarqueeProps> = ({
  marqueeMessages,
  gridWidth = 60,
}) => {
  const [currScrollPosition, setCurrScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const isUsingMarqueeEffect = marqueeMessages.length > 1;

  /* This ref is used as the interval's internal scroll counter, because
   * otherwise the useEffect itself would be re-run over and over every time
   * that currScrollPosition was bumped. */
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (isUsingMarqueeEffect && isScrolling && marqueeMessages.length > 0) {
      let scrollInterval = setInterval(() => {
        if (scrollPositionRef.current < gridWidth) {
          scrollPositionRef.current = scrollPositionRef.current + 1;
          setCurrScrollPosition(scrollPositionRef.current);
        } else {
          // stop scrolling and clean up interval
          setIsScrolling(false);
          clearInterval(scrollInterval);

          /*
           * bump 'active text index'.
           *
           * Ex. start at 0, it'll scroll from marqueeMessages[0] to marqueeMessages[1]:
           *
           * ['ready', 'set', 'start']
           *  ---0--->>--1--
           *
           * ...then active text index bumps to 1, so it scrolls the next two:
           *
           * ['ready', 'set', 'start']
           *           --1-->>---2---
           */
          setActiveTextIndex((prevActiveTextIndex) => prevActiveTextIndex + 1);

          // reset scroll positions
          scrollPositionRef.current = 0;
          setCurrScrollPosition(0);

          setTimeout(() => {
            // restart animation
            setIsScrolling(true);
          }, SCROLL_DELAY_MS);
        }
      }, SCROLL_SPEED_MS);
    }
  }, [isScrolling]);

  useTimeout(() => {
    // this only happens once, to kick off the first scrolling after a delay
    isUsingMarqueeEffect && setIsScrolling(true);
  }, SCROLL_DELAY_MS);

  const len9sPadded = useMemo(
    () => convertToLen9AndAddPadding(marqueeMessages, gridWidth),
    [marqueeMessages, gridWidth]
  );

  /*
   * The activeTextIndex is used to choose which 2 elements from the
   * marqueeMessages' array to combine (see comment in useEffect, above).
   * combineArrays() essentially zips and concats the two messages'
   * top/middle/bottom sub-arrays. See diagram in the comment at the
   * combineArrays function.
   */
  const len9CharsCombined = useMemo(
    () =>
      combineArrays(
        len9sPadded[activeTextIndex % marqueeMessages.length],
        len9sPadded[(activeTextIndex + 1) % marqueeMessages.length]
      ),
    [len9sPadded, activeTextIndex, marqueeMessages]
  );

  const len9SlicedCharsReadyForDisplay = [
    ...iterator(
      sliceSubArraysAndCat(currScrollPosition, gridWidth),
      len9CharsCombined
    ),
  ];

  return (
    <Len9DisplayComponent
      len9={len9SlicedCharsReadyForDisplay}
      gridWidth={gridWidth}
    />
  );
};
