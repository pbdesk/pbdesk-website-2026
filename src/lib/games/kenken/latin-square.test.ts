/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { generateLatinSquare } from "./latin-square";
import { mulberry32 } from "./rng";

function isLatinSquare(grid: number[][], size: number): boolean {
  if (grid.length !== size) {
    return false;
  }
  for (let i = 0; i < size; i += 1) {
    if (grid[i].length !== size) {
      return false;
    }
    const rowSeen = new Set<number>();
    const colSeen = new Set<number>();
    for (let j = 0; j < size; j += 1) {
      const rv = grid[i][j];
      const cv = grid[j][i];
      if (rv < 1 || rv > size || cv < 1 || cv > size) {
        return false;
      }
      rowSeen.add(rv);
      colSeen.add(cv);
    }
    if (rowSeen.size !== size || colSeen.size !== size) {
      return false;
    }
  }
  return true;
}

describe("generateLatinSquare", () => {
  for (const size of [3, 4, 5, 6, 7, 8, 9]) {
    test(`produces a valid ${size}x${size} Latin square`, () => {
      const grid = generateLatinSquare(size, mulberry32(size * 13 + 1));
      expect(isLatinSquare(grid, size)).toBe(true);
    });
  }

  test("is deterministic for a given seed", () => {
    const a = generateLatinSquare(5, mulberry32(123));
    const b = generateLatinSquare(5, mulberry32(123));
    expect(a).toEqual(b);
  });
});
