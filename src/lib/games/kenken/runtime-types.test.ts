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
      elapsedSeconds: 42,
      freebies: [],
      grid: [] as GameGrid,
      hintsUsed: 2,
      paused: false,
      puzzle: {
        cages: [],
        difficulty: "easy",
        id: "k3-easy-00001",
        size: 3,
        solution: [],
      },
      redoStack: [],
      revealedMistakes: [],
      ruleCheckOn: true,
      selected: null,
      status: "playing",
      undoStack: [],
    } satisfies GameState;
    expect(state.hintsUsed).toBe(2);
    expect(state.status).toBe("playing");
  });
});
