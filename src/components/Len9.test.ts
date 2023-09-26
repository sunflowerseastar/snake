import { expect, test } from "vitest";
import {
  combineArrays,
  convertToLen9AndAddPadding,
  len9,
  lookupLen9Char,
  strToBinaryLen9Chars,
} from "./Len9";

const len9a = [
  [1, 2, 0],
  [3, 4, 0],
];

const len9b = [
  [5, 6, 0],
  [7, 8, 0],
];

const len9c = [
  [9, 9, 0],
  [9, 8, 0],
];

test("len-9", () => {
  expect(lookupLen9Char("a")).toEqual([0, 1, 0, 1, 1, 1, 1, 0, 1]);
  expect(strToBinaryLen9Chars("a")).toEqual([[0, 1, 0, 1, 1, 1, 1, 0, 1]]);
  expect(strToBinaryLen9Chars("aa")).toEqual([
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
    [0, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
  ]);
  expect(strToBinaryLen9Chars("as")).toEqual([
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
    [0, 0, 0],
    [0, 1, 1, 0, 1, 0, 1, 1, 0],
  ]);
  expect(strToBinaryLen9Chars("ts")).toEqual([
    [1, 1, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 0, 1, 0, 1, 1, 0],
  ]);
  expect(strToBinaryLen9Chars("fs")).toEqual([
    [1, 1, 1, 1, 1, 0, 1, 0, 0],
    [0, 1, 1, 0, 1, 0, 1, 1, 0],
  ]);
  expect(len9("a")).toEqual([
    [0, 1, 0],
    [1, 1, 1],
    [1, 0, 1],
  ]);
  expect(len9("abc")).toEqual([
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  ]);
  expect(convertToLen9AndAddPadding(["a"], 3)).toEqual([
    [
      [0, 1, 0],
      [1, 1, 1],
      [1, 0, 1],
    ],
  ]);
  expect(convertToLen9AndAddPadding(["a"], 5)).toEqual([
    [
      [0, 1, 0, 0, 0],
      [1, 1, 1, 0, 0],
      [1, 0, 1, 0, 0],
    ],
  ]);
  expect(convertToLen9AndAddPadding(["a"], 5, true)).toEqual([
    [
      [0, 0, 0, 1, 0],
      [0, 0, 1, 1, 1],
      [0, 0, 1, 0, 1],
    ],
  ]);
  expect(combineArrays(len9a, len9b)).toEqual([
    [1, 2, 0, 5, 6, 0],
    [3, 4, 0, 7, 8, 0],
  ]);
});
