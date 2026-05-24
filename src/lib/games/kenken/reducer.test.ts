// src/lib/games/kenken/reducer.test.ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { createInitialState, gameReducer } from "./reducer";
import type { KenKenPuzzle } from "./types";

// 2×2 puzzle, solution [[1,2],[2,1]], four singleton cages.
const puzzle: KenKenPuzzle = {
  id: "k2-test-1",
  size: 2,
  difficulty: "easy",
  cages: [
    { cells: [[0, 0]], op: "=", target: 1 },
    { cells: [[0, 1]], op: "=", target: 2 },
    { cells: [[1, 0]], op: "=", target: 2 },
    { cells: [[1, 1]], op: "=", target: 1 },
  ],
  solution: [
    [1, 2],
    [2, 1],
  ],
};

describe("createInitialState", () => {
  test("starts empty, not paused, playing", () => {
    const s = createInitialState(puzzle);
    expect(s.grid[0][0].value).toBeNull();
    expect(s.paused).toBe(false);
    expect(s.status).toBe("playing");
    expect(s.hintsUsed).toBe(0);
  });
});

describe("gameReducer input", () => {
  test("value mode sets the selected cell's value", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "select", cell: [0, 0] });
    s = gameReducer(s, { type: "input", digit: 1 });
    expect(s.grid[0][0].value).toBe(1);
  });

  test("input with no selection is a no-op", () => {
    const s0 = createInitialState(puzzle);
    const s1 = gameReducer(s0, { type: "input", digit: 1 });
    expect(s1.grid[0][0].value).toBeNull();
  });

  test("ignores digits larger than the grid size", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "select", cell: [0, 0] });
    s = gameReducer(s, { type: "input", digit: 3 }); // size is 2
    expect(s.grid[0][0].value).toBeNull();
  });
});

describe("gameReducer undo/redo", () => {
  test("undo reverts the last grid change; redo reapplies it", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "select", cell: [0, 0] });
    s = gameReducer(s, { type: "input", digit: 1 });
    s = gameReducer(s, { type: "undo" });
    expect(s.grid[0][0].value).toBeNull();
    s = gameReducer(s, { type: "redo" });
    expect(s.grid[0][0].value).toBe(1);
  });

  test("undo with empty history is a no-op", () => {
    const s = createInitialState(puzzle);
    expect(gameReducer(s, { type: "undo" })).toEqual(s);
  });
});

describe("gameReducer hint", () => {
  test("fills the selected cell from the solution and counts the hint", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "select", cell: [0, 1] });
    s = gameReducer(s, { type: "hint" });
    expect(s.grid[0][1].value).toBe(2); // solution[0][1]
    expect(s.hintsUsed).toBe(1);
  });
});

describe("gameReducer win", () => {
  test("status becomes 'won' when the final correct value completes the grid", () => {
    let s = createInitialState(puzzle);
    const fills: [number, number, number][] = [
      [0, 0, 1],
      [0, 1, 2],
      [1, 0, 2],
      [1, 1, 1],
    ];
    for (const [r, c, d] of fills) {
      s = gameReducer(s, { type: "select", cell: [r, c] });
      s = gameReducer(s, { type: "input", digit: d });
    }
    expect(s.status).toBe("won");
  });
});

describe("gameReducer timer + pause", () => {
  test("tick increments elapsed only while playing and not paused", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "tick" });
    expect(s.elapsedSeconds).toBe(1);
    s = gameReducer(s, { type: "setPaused", paused: true });
    s = gameReducer(s, { type: "tick" });
    expect(s.elapsedSeconds).toBe(1); // paused -> no increment
  });
});

describe("gameReducer restore", () => {
  test("restores grid, elapsed, and hint count and recomputes status", () => {
    const s0 = createInitialState(puzzle);
    const grid = s0.grid.map((row) => row.map((cell) => ({ ...cell })));
    grid[0][0].value = 1;
    grid[0][1].value = 2;
    grid[1][0].value = 2;
    grid[1][1].value = 1;
    const s1 = gameReducer(s0, {
      type: "restore",
      grid,
      elapsedSeconds: 99,
      hintsUsed: 3,
    });
    expect(s1.elapsedSeconds).toBe(99);
    expect(s1.hintsUsed).toBe(3);
    expect(s1.status).toBe("won");
  });
});
