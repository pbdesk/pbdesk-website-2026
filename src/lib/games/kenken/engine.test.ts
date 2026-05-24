/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import {
  cageConflicts,
  clearCell,
  cloneGrid,
  createEmptyGrid,
  isSolved,
  mistakeCells,
  rowColConflicts,
  setCellValue,
  toggleCellNote,
} from "./engine";
import type { GameGrid } from "./runtime-types";
import type { Cage } from "./types";

describe("createEmptyGrid", () => {
  test("builds a size×size grid of empty cells", () => {
    const grid = createEmptyGrid(3);
    expect(grid.length).toBe(3);
    expect(grid[0].length).toBe(3);
    expect(grid[1][2]).toEqual({ given: false, value: null, notes: [] });
  });
});

describe("cloneGrid", () => {
  test("produces a deep copy (mutating the clone does not touch the original)", () => {
    const grid = createEmptyGrid(2);
    const copy = cloneGrid(grid);
    copy[0][0].value = 5;
    copy[0][0].notes.push(1);
    expect(grid[0][0].value).toBeNull();
    expect(grid[0][0].notes).toEqual([]);
  });
});

describe("toggleCellNote", () => {
  test("adds a note (kept ascending) then removes it on repeat", () => {
    let grid = createEmptyGrid(3);
    grid = toggleCellNote(grid, [0, 0], 3);
    grid = toggleCellNote(grid, [0, 0], 1);
    expect(grid[0][0].notes).toEqual([1, 3]);
    grid = toggleCellNote(grid, [0, 0], 3);
    expect(grid[0][0].notes).toEqual([1]);
  });

  test("returns a new grid and does not mutate the input", () => {
    const grid = createEmptyGrid(2);
    const next = toggleCellNote(grid, [0, 0], 2);
    expect(grid[0][0].notes).toEqual([]);
    expect(next[0][0].notes).toEqual([2]);
  });
});

describe("setCellValue", () => {
  const cages: Cage[] = [
    {
      cells: [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      op: "+",
      target: 6,
    },
    {
      cells: [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      op: "+",
      target: 6,
    },
    {
      cells: [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      op: "+",
      target: 6,
    },
  ];

  test("sets a value and clears the cell's own notes", () => {
    let grid = createEmptyGrid(3);
    grid = toggleCellNote(grid, [0, 0], 2);
    grid = setCellValue(grid, [0, 0], 2, cages);
    expect(grid[0][0]).toEqual({ given: false, value: 2, notes: [] });
  });

  test("auto-clears the committed digit from notes in same row, col, and cage", () => {
    let grid = createEmptyGrid(3);
    grid = toggleCellNote(grid, [0, 1], 2); // same row + same cage
    grid = toggleCellNote(grid, [1, 0], 2); // same column
    grid = toggleCellNote(grid, [2, 2], 2); // unrelated cell — must keep
    grid = setCellValue(grid, [0, 0], 2, cages);
    expect(grid[0][1].notes).toEqual([]); // cleared (row + cage)
    expect(grid[1][0].notes).toEqual([]); // cleared (column)
    expect(grid[2][2].notes).toEqual([2]); // untouched
  });

  test("does not mutate the input grid", () => {
    const grid = createEmptyGrid(3);
    const next = setCellValue(grid, [0, 0], 1, cages);
    expect(grid[0][0].value).toBeNull();
    expect(next[0][0].value).toBe(1);
  });
});

describe("clearCell", () => {
  test("resets a cell's value and notes", () => {
    let grid = createEmptyGrid(3);
    grid = setCellValue(grid, [0, 0], 1, []);
    grid = clearCell(grid, [0, 0]);
    expect(grid[0][0]).toEqual({ given: false, value: null, notes: [] });
  });
});

function gridFromValues(values: (number | null)[][]): GameGrid {
  return values.map((row) =>
    row.map((value) => ({ value, notes: [] as number[] }))
  );
}

describe("rowColConflicts", () => {
  test("flags duplicate digits in a row and a column", () => {
    const grid = gridFromValues([
      [1, 1, 3],
      [1, 2, 3],
      [3, 1, 2],
    ]);
    const conflicts = rowColConflicts(grid);
    expect(conflicts.has("0,0")).toBe(true);
    expect(conflicts.has("0,1")).toBe(true);
    expect(conflicts.has("1,0")).toBe(true);
    expect(conflicts.has("2,2")).toBe(false);
  });

  test("empty cells never conflict", () => {
    const grid = gridFromValues([
      [null, null],
      [null, null],
    ]);
    expect(rowColConflicts(grid).size).toBe(0);
  });
});

describe("cageConflicts", () => {
  const cages: Cage[] = [
    {
      cells: [
        [0, 0],
        [0, 1],
      ],
      op: "+",
      target: 3,
    },
    {
      cells: [
        [1, 0],
        [1, 1],
      ],
      op: "-",
      target: 1,
    },
  ];

  test("flags a fully-filled cage that violates its target", () => {
    const grid = gridFromValues([
      [2, 2],
      [1, 2],
    ]);
    const conflicts = cageConflicts(grid, cages);
    expect(conflicts.has("0,0")).toBe(true);
    expect(conflicts.has("0,1")).toBe(true);
    expect(conflicts.has("1,0")).toBe(false);
  });

  test("a partially-filled cage is never flagged", () => {
    const grid = gridFromValues([
      [2, null],
      [null, null],
    ]);
    expect(cageConflicts(grid, cages).size).toBe(0);
  });
});

describe("isSolved", () => {
  const cages: Cage[] = [
    {
      cells: [
        [0, 0],
        [0, 1],
      ],
      op: "+",
      target: 3,
    },
    {
      cells: [
        [1, 0],
        [1, 1],
      ],
      op: "+",
      target: 3,
    },
  ];

  test("true when grid is full, Latin-valid, and all cages satisfied", () => {
    const grid = gridFromValues([
      [1, 2],
      [2, 1],
    ]);
    expect(isSolved(grid, 2, cages)).toBe(true);
  });

  test("false when a cell is empty", () => {
    const grid = gridFromValues([
      [1, 2],
      [2, null],
    ]);
    expect(isSolved(grid, 2, cages)).toBe(false);
  });

  test("false when a Latin constraint is violated", () => {
    const grid = gridFromValues([
      [1, 1],
      [2, 2],
    ]);
    expect(isSolved(grid, 2, cages)).toBe(false);
  });
});

describe("mistakeCells", () => {
  test("flags filled cells that differ from the solution", () => {
    const solution = [
      [1, 2],
      [2, 1],
    ];
    const grid = gridFromValues([
      [1, 3],
      [null, 1],
    ]);
    const mistakes = mistakeCells(grid, solution);
    expect(mistakes).toContainEqual([0, 1]);
    expect(mistakes).not.toContainEqual([1, 0]);
    expect(mistakes).not.toContainEqual([0, 0]);
  });
});
