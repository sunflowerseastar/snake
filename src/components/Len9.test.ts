import { expect, test } from "vitest";
import { len9, lookupLen9Char, strToBinaryLen9Chars } from "./Len9";

test("len-9", () => {
  expect(lookupLen9Char("a")).toEqual([0, 1, 0, 1, 1, 1, 1, 0, 1]);
  expect(strToBinaryLen9Chars("a")).toEqual([[0, 1, 0, 1, 1, 1, 1, 0, 1]]);
  expect(strToBinaryLen9Chars("aa")).toEqual([
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
    [0, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
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
});
