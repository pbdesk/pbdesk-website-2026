/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { type Cage, type KenKenPuzzle, SCHEMA_VERSION } from "./types";
import { validateLibrary, validatePuzzle } from "./validate";

function validSingletonPuzzle(): KenKenPuzzle {
  const solution = [
    [1, 2, 3],
    [2, 3, 1],
    [3, 1, 2],
  ];
  const cages: Cage[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cages.push({
        cells: [[r, c]] as [number, number][],
        op: "=" as const,
        target: solution[r][c],
      });
    }
  }
  return { id: "k3-easy-00001", size: 3, difficulty: "easy", cages, solution };
}

describe("validatePuzzle", () => {
  test("a well-formed puzzle returns no errors", () => {
    expect(validatePuzzle(validSingletonPuzzle())).toEqual([]);
  });

  test("flags a cage target that the solution does not satisfy", () => {
    const p = validSingletonPuzzle();
    p.cages[0].target = 9; // (0,0) is 1, not 9
    expect(validatePuzzle(p).length).toBeGreaterThan(0);
  });

  test("flags a solution that is not a Latin square", () => {
    const p = validSingletonPuzzle();
    p.solution[0][0] = 2; // duplicates 2 in row 0
    expect(validatePuzzle(p).length).toBeGreaterThan(0);
  });

  test("flags a cell not covered by exactly one cage", () => {
    const p = validSingletonPuzzle();
    p.cages.pop(); // leave (2,2) uncovered
    expect(validatePuzzle(p).length).toBeGreaterThan(0);
  });

  test("flags a subtraction cage that is not exactly two cells", () => {
    const p = validSingletonPuzzle();
    p.cages = [
      {
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
        ],
        op: "-",
        target: 1,
      },
      ...p.cages.filter((cg) => !(cg.cells[0][0] === 0 && cg.cells[0][1] <= 2)),
    ];
    expect(validatePuzzle(p).length).toBeGreaterThan(0);
  });
});

describe("validateLibrary", () => {
  test("valid library returns no errors", () => {
    const lib = {
      schemaVersion: SCHEMA_VERSION,
      difficulty: "easy" as const,
      puzzles: [validSingletonPuzzle()],
    };
    expect(validateLibrary(lib)).toEqual([]);
  });

  test("flags wrong schemaVersion", () => {
    const lib = {
      schemaVersion: 999,
      difficulty: "easy" as const,
      puzzles: [validSingletonPuzzle()],
    };
    expect(validateLibrary(lib).length).toBeGreaterThan(0);
  });
});
