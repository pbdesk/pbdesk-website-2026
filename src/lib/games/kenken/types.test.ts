/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { type Cage, type KenKenPuzzle, SCHEMA_VERSION } from "./types";

describe("kenken types", () => {
  test("SCHEMA_VERSION is 1", () => {
    expect(SCHEMA_VERSION).toBe(1);
  });

  test("a puzzle object has the expected shape", () => {
    const cage: Cage = { cells: [[0, 0]], op: "=", target: 1 };
    const puzzle: KenKenPuzzle = {
      id: "k3-easy-00001",
      size: 3,
      difficulty: "easy",
      cages: [cage],
      solution: [
        [1, 2, 3],
        [2, 3, 1],
        [3, 1, 2],
      ],
    };
    expect(puzzle.cages[0].op).toBe("=");
    expect(puzzle.solution.length).toBe(3);
  });
});
