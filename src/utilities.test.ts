import { expect, test } from "vitest";
import {
  generateInitialBoardHeight,
  generateInitialBoardWidth,
  isCoordInCoords,
  isInBounds,
  isLegalDirectionChange,
  opposite,
} from "./utilities";
import { Direction } from "./types";

test("square xy coordinate is in/not-in the board boundary", () => {
  expect(isInBounds({ x: 0, y: 0 }, 20, 20)).toEqual(true);
  expect(isInBounds({ x: 5, y: 0 }, 5, 5)).toEqual(false);
});
test("a coordinate is/is-not contained in an array of coordinates", () => {
  expect(
    isCoordInCoords({ x: 0, y: 0 }, [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ]),
  ).toEqual(true);
  expect(isCoordInCoords({ x: 0, y: 0 }, [{ x: 1, y: 0 }])).toEqual(false);
  expect(isCoordInCoords({ x: 0, y: 0 }, [])).toEqual(false);
});
test("opposite directions", () => {
  expect(opposite(Direction.ArrowUp)).toEqual(Direction.ArrowDown);
  expect(opposite(Direction.ArrowDown)).toEqual(Direction.ArrowUp);
  expect(opposite(Direction.ArrowLeft)).toEqual(Direction.ArrowRight);
  expect(opposite(Direction.ArrowRight)).toEqual(Direction.ArrowLeft);
});
test("legal direction changes", () => {
  expect(
    isLegalDirectionChange(Direction.ArrowLeft, Direction.ArrowRight, [
      {
        x: 2,
        y: 1,
      },
      { x: 1, y: 1 },
    ]),
  ).toEqual(false);
  expect(
    isLegalDirectionChange(Direction.ArrowUp, Direction.ArrowRight, [
      {
        x: 2,
        y: 1,
      },
      { x: 1, y: 1 },
    ]),
  ).toEqual(true);
});
test("board size generation", () => {
  expect(generateInitialBoardHeight("responsive", 415)).toEqual(8);
  expect(generateInitialBoardHeight("off", 415)).toEqual(8);
  expect(generateInitialBoardHeight("responsive", 1015)).toEqual(19);
  expect(generateInitialBoardHeight("on", 1015)).toEqual(15);
  expect(generateInitialBoardWidth(639)).toEqual(13);
  expect(generateInitialBoardWidth(1100)).toEqual(22);
});
