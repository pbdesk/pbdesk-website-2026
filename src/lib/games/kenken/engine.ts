import type { CellState, CellValue, GameGrid } from "./runtime-types";
import type { Cage, Cell } from "./types";

export function createEmptyGrid(size: number): GameGrid {
  return Array.from({ length: size }, () =>
    Array.from(
      { length: size },
      (): CellState => ({
        value: null,
        notes: [],
      })
    )
  );
}

export function cloneGrid(grid: GameGrid): GameGrid {
  return grid.map((row) =>
    row.map((cell) => ({ value: cell.value, notes: [...cell.notes] }))
  );
}

export function toggleCellNote(
  grid: GameGrid,
  [r, c]: Cell,
  digit: number
): GameGrid {
  const next = cloneGrid(grid);
  const notes = next[r][c].notes;
  const idx = notes.indexOf(digit);
  if (idx >= 0) {
    notes.splice(idx, 1);
  } else {
    notes.push(digit);
    notes.sort((a, b) => a - b);
  }
  return next;
}

function cageContaining(cages: Cage[], r: number, c: number): Cage | undefined {
  return cages.find((cage) =>
    cage.cells.some(([cr, cc]) => cr === r && cc === c)
  );
}

export function setCellValue(
  grid: GameGrid,
  [r, c]: Cell,
  value: CellValue,
  cages: Cage[]
): GameGrid {
  const next = cloneGrid(grid);
  next[r][c] = { value, notes: [] };
  if (value === null) {
    return next;
  }

  const removeNote = (rr: number, cc: number): void => {
    const notes = next[rr][cc].notes;
    const idx = notes.indexOf(value);
    if (idx >= 0) {
      notes.splice(idx, 1);
    }
  };

  const size = grid.length;
  for (let i = 0; i < size; i++) {
    if (i !== c) {
      removeNote(r, i); // same row
    }
    if (i !== r) {
      removeNote(i, c); // same column
    }
  }
  const cage = cageContaining(cages, r, c);
  if (cage) {
    for (const [cr, cc] of cage.cells) {
      if (!(cr === r && cc === c)) {
        removeNote(cr, cc);
      }
    }
  }
  return next;
}

export function clearCell(grid: GameGrid, [r, c]: Cell): GameGrid {
  const next = cloneGrid(grid);
  next[r][c] = { value: null, notes: [] };
  return next;
}
