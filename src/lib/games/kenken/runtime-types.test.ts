/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import type { CellState, GameGrid, GameState } from "./runtime-types";

describe("runtime types", () => {
  test("a cell state and grid have the expected shape", () => {
    const cell: CellState = { given: false, value: null };
    const grid: GameGrid = [[cell, { given: false, value: 3 }]];
    expect(grid[0][1].value).toBe(3);
  });

  test("a game state object compiles with all fields", () => {
    const state = {
      puzzle: {
        id: "k3-easy-00001",
        size: 3,
        difficulty: "easy",
        cages: [],
        solution: [],
      },
      freebies: [],
      grid: [] as GameGrid,
      selected: null,
      undoStack: [],
      redoStack: [],
      hintsUsed: 2,
      revealedMistakes: [],
      ruleCheckOn: true,
      elapsedSeconds: 42,
      paused: false,
      status: "playing",
    } satisfies GameState;
    expect(state.hintsUsed).toBe(2);
    expect(state.status).toBe("playing");
  });
});
