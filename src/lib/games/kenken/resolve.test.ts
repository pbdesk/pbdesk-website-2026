/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { resolvePuzzleRequest } from "./resolve";
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

const lookup = {
  byId: (id: string) => (id === "known" ? fixture("known") : null),
  byLevel: (level: string) =>
    level === "easy" ? [fixture("a"), fixture("b"), fixture("c")] : [],
};

describe("resolvePuzzleRequest", () => {
  test("returns 200 with the puzzle for a known id", () => {
    const res = resolvePuzzleRequest(
      { id: "known", level: null, exclude: [] },
      lookup,
      mulberry32(1)
    );
    expect(res.status).toBe(200);
    expect((res.body as KenKenPuzzle).id).toBe("known");
  });

  test("returns 404 for an unknown id", () => {
    const res = resolvePuzzleRequest(
      { id: "nope", level: null, exclude: [] },
      lookup,
      mulberry32(1)
    );
    expect(res.status).toBe(404);
  });

  test("returns 400 for a missing/invalid level when no id", () => {
    expect(
      resolvePuzzleRequest(
        { id: null, level: null, exclude: [] },
        lookup,
        mulberry32(1)
      ).status
    ).toBe(400);
    expect(
      resolvePuzzleRequest(
        { id: null, level: "medium", exclude: [] },
        lookup,
        mulberry32(1)
      ).status
    ).toBe(400);
  });

  test("returns 503 when the tier library is empty", () => {
    const res = resolvePuzzleRequest(
      { id: null, level: "genius", exclude: [] },
      lookup,
      mulberry32(1)
    );
    expect(res.status).toBe(503);
  });

  test("returns 200 and avoids excluded ids when possible", () => {
    const res = resolvePuzzleRequest(
      { id: null, level: "easy", exclude: ["a", "b"] },
      lookup,
      mulberry32(1)
    );
    expect(res.status).toBe(200);
    expect((res.body as KenKenPuzzle).id).toBe("c");
  });
});
