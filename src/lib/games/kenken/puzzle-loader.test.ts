/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import {
  findById,
  getLibrary,
  selectById,
  selectRandom,
} from "./puzzle-loader";
import { mulberry32 } from "./rng";
import type { KenKenPuzzle } from "./types";

function fixture(id: string): KenKenPuzzle {
  return {
    id,
    size: 3,
    difficulty: "easy",
    cages: [{ cells: [[0, 0]], op: "=", target: 1 }],
    solution: [
      [1, 2, 3],
      [2, 3, 1],
      [3, 1, 2],
    ],
  };
}

describe("selectById", () => {
  test("finds a puzzle by id, or returns null", () => {
    const puzzles = [fixture("a"), fixture("b")];
    expect(selectById(puzzles, "b")?.id).toBe("b");
    expect(selectById(puzzles, "z")).toBeNull();
  });
});

describe("selectRandom", () => {
  test("returns null for an empty pool", () => {
    expect(selectRandom([], [], mulberry32(1))).toBeNull();
  });

  test("prefers a puzzle not in the exclude list", () => {
    const puzzles = [fixture("a"), fixture("b"), fixture("c")];
    const picked = selectRandom(puzzles, ["a", "b"], mulberry32(1));
    expect(picked?.id).toBe("c");
  });

  test("falls back to the full pool when everything is excluded", () => {
    const puzzles = [fixture("a"), fixture("b")];
    const picked = selectRandom(puzzles, ["a", "b"], mulberry32(1));
    expect(["a", "b"]).toContain(picked?.id);
  });
});

describe("library access", () => {
  test("getLibrary returns a populated tier with matching difficulty", () => {
    const lib = getLibrary("easy");
    expect(lib.difficulty).toBe("easy");
    expect(lib.puzzles.length).toBeGreaterThan(0);
  });

  test("findById resolves a real puzzle from the seeded library", () => {
    const sample = getLibrary("easy").puzzles[0];
    expect(findById(sample.id)?.id).toBe(sample.id);
    expect(findById("does-not-exist")).toBeNull();
  });
});
