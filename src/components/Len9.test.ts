import { expect, test } from "vitest";
import { len9, lookupLetter, strToBinaryLetters } from "./Len9";

test("len-9", () => {
  expect(lookupLetter("a")).toEqual([0, 1, 0, 1, 1, 1, 1, 0, 1]);
  expect(strToBinaryLetters("a")).toEqual([[0, 1, 0, 1, 1, 1, 1, 0, 1]]);
  expect(strToBinaryLetters("aa")).toEqual([
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
    [0, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
  ]);
  expect(strToBinaryLetters("ts")).toEqual([
    [1, 1, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 0, 1, 0, 1, 1, 0],
  ]);
  expect(strToBinaryLetters("fs")).toEqual([
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
