/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { generatePuzzleForTier } from "./generate";
import { mulberry32 } from "./rng";
import { countSolutions } from "./solver";
import { validatePuzzle } from "./validate";

describe("generatePuzzleForTier", () => {
  for (const difficulty of ["easy", "intermediate"] as const) {
    test(`produces a uniquely-solvable, valid ${difficulty} puzzle`, () => {
      const puzzle = generatePuzzleForTier(
        difficulty,
        mulberry32(difficulty.length * 7 + 1),
        `${difficulty}-test`
      );
      expect(puzzle).not.toBeNull();
      if (!puzzle) {
        return;
      }
      expect(puzzle.difficulty).toBe(difficulty);
      expect(validatePuzzle(puzzle)).toEqual([]);
      expect(countSolutions(puzzle.size, puzzle.cages, 2)).toBe(1);
    });
  }

  test("assigns the provided id", () => {
    const puzzle = generatePuzzleForTier("easy", mulberry32(2), "my-id");
    expect(puzzle?.id).toBe("my-id");
  });
});
