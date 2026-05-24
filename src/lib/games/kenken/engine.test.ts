/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import {
  clearCell,
  cloneGrid,
  createEmptyGrid,
  setCellValue,
  toggleCellNote,
} from "./engine";
import type { Cage } from "./types";

describe("createEmptyGrid", () => {
  test("builds a size×size grid of empty cells", () => {
    const grid = createEmptyGrid(3);
    expect(grid.length).toBe(3);
    expect(grid[0].length).toBe(3);
    expect(grid[1][2]).toEqual({ value: null, notes: [] });
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
    expect(grid[0][0]).toEqual({ value: 2, notes: [] });
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
    expect(grid[0][0]).toEqual({ value: null, notes: [] });
  });
});
