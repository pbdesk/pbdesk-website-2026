/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { generateLatinSquare } from "./latin-square";
import { mulberry32 } from "./rng";
import { countSolutions } from "./solver";
import type { Cage, Cell } from "./types";

// All-singletons: every cell is its own "=" cage -> exactly one solution.
function singletonCages(solution: number[][]): Cage[] {
  const cages: Cage[] = [];
  for (let r = 0; r < solution.length; r += 1) {
    for (let c = 0; c < solution[r].length; c += 1) {
      cages.push({ cells: [[r, c]], op: "=", target: solution[r][c] });
    }
  }
  return cages;
}

describe("countSolutions", () => {
  test("all-singleton cages yield exactly one solution", () => {
    const solution = generateLatinSquare(4, mulberry32(3));
    expect(countSolutions(4, singletonCages(solution), 2)).toBe(1);
  });

  test("a single all-grid '+' cage is satisfied by many Latin squares (caps at 2)", () => {
    const size = 4;
    const allCells: Cell[] = [];
    let total = 0;
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        allCells.push([r, c]);
        total += ((r + c) % size) + 1; // total is the same for any Latin square
      }
    }
    const cages: Cage[] = [{ cells: allCells, op: "+", target: total }];
    expect(countSolutions(size, cages, 2)).toBe(2);
  });

  test("returns 0 when no assignment satisfies the cages", () => {
    // One cell whose '=' target is impossible (out of range) -> no solution.
    const size = 3;
    const cages: Cage[] = singletonCages([
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ]);
    expect(countSolutions(size, cages, 2)).toBe(0);
  });
});
