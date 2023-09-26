import { expect, test } from "vitest";

import {
  Direction,
  isCoordInCoords,
  isInBounds,
  opposite,
} from "./useGameReducer";

test("square xy coordinate is in/not-in the board boundary", () => {
  expect(isInBounds({ x: 0, y: 0 }, 20)).toEqual(true);
  expect(isInBounds({ x: 5, y: 0 }, 5)).toEqual(false);
});
test("a coordinate is/is-not contained in an array of coordinates", () => {
  expect(
    isCoordInCoords({ x: 0, y: 0 }, [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ])
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
