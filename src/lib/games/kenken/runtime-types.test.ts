/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import type {
  CellState,
  GameGrid,
  GameState,
  InputMode,
} from "./runtime-types";
import { INITIAL_INPUT_MODE } from "./runtime-types";

describe("runtime types", () => {
  test("INITIAL_INPUT_MODE is 'value'", () => {
    const mode: InputMode = INITIAL_INPUT_MODE;
    expect(mode).toBe("value");
  });

  test("a cell state and grid have the expected shape", () => {
    const cell: CellState = { value: null, notes: [] };
    const grid: GameGrid = [[cell, { value: 3, notes: [1, 2] }]];
    expect(grid[0][1].value).toBe(3);
    expect(grid[0][1].notes).toEqual([1, 2]);
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
      grid: [] as GameGrid,
      selected: null,
      mode: "note",
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
