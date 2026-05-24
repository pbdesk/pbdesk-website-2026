import type { CellState, CellValue, GameGrid } from "./runtime-types";
import type { Cage, Cell, Operation } from "./types";

export function createEmptyGrid(size: number): GameGrid {
  return Array.from({ length: size }, () =>
    Array.from(
      { length: size },
      (): CellState => ({
        given: false,
        value: null,
        notes: [],
      })
    )
  );
}

export function cloneGrid(grid: GameGrid): GameGrid {
  return grid.map((row) =>
    row.map((cell) => ({
      given: cell.given ?? false,
      value: cell.value,
      notes: [...cell.notes],
    }))
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
  next[r][c] = { given: next[r][c].given, value, notes: [] };
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
  next[r][c] = { given: false, value: null, notes: [] };
  return next;
}

function key(r: number, c: number): string {
  return `${r},${c}`;
}

export function rowColConflicts(grid: GameGrid): Set<string> {
  const size = grid.length;
  const conflicts = new Set<string>();

  const scan = (cells: Cell[]): void => {
    const seen = new Map<number, Cell[]>();
    for (const [r, c] of cells) {
      const v = grid[r][c].value;
      if (v === null) {
        continue;
      }
      const list = seen.get(v) ?? [];
      list.push([r, c]);
      seen.set(v, list);
    }
    for (const list of seen.values()) {
      if (list.length > 1) {
        for (const [r, c] of list) {
          conflicts.add(key(r, c));
        }
      }
    }
  };

  for (let i = 0; i < size; i++) {
    scan(Array.from({ length: size }, (_, j): Cell => [i, j])); // row i
    scan(Array.from({ length: size }, (_, j): Cell => [j, i])); // col i
  }
  return conflicts;
}

function cageSatisfied(op: Operation, target: number, vals: number[]): boolean {
  switch (op) {
    case "=":
      return vals.length === 1 && vals[0] === target;
    case "+":
      return vals.reduce((s, v) => s + v, 0) === target;
    case "*":
      return vals.reduce((p, v) => p * v, 1) === target;
    case "-":
      return vals.length === 2 && Math.abs(vals[0] - vals[1]) === target;
    case "/": {
      if (vals.length !== 2) {
        return false;
      }
      const hi = Math.max(vals[0], vals[1]);
      const lo = Math.min(vals[0], vals[1]);
      return lo !== 0 && hi % lo === 0 && hi / lo === target;
    }
    default:
      return false;
  }
}

export function cageConflicts(grid: GameGrid, cages: Cage[]): Set<string> {
  const conflicts = new Set<string>();
  for (const cage of cages) {
    const vals: number[] = [];
    let full = true;
    for (const [r, c] of cage.cells) {
      const v = grid[r][c].value;
      if (v === null) {
        full = false;
        break;
      }
      vals.push(v);
    }
    if (full && !cageSatisfied(cage.op, cage.target, vals)) {
      for (const [r, c] of cage.cells) {
        conflicts.add(key(r, c));
      }
    }
  }
  return conflicts;
}

function isLatinValid(grid: GameGrid, size: number): boolean {
  for (let i = 0; i < size; i++) {
    const rowSeen = new Set<number>();
    const colSeen = new Set<number>();
    for (let j = 0; j < size; j++) {
      const rv = grid[i][j].value;
      const cv = grid[j][i].value;
      if (rv === null || cv === null) {
        return false;
      }
      rowSeen.add(rv);
      colSeen.add(cv);
    }
    if (rowSeen.size !== size || colSeen.size !== size) {
      return false;
    }
  }
  return true;
}

export function isSolved(grid: GameGrid, size: number, cages: Cage[]): boolean {
  if (!isLatinValid(grid, size)) {
    return false;
  }
  return cageConflicts(grid, cages).size === 0;
}

export function mistakeCells(grid: GameGrid, solution: number[][]): Cell[] {
  const mistakes: Cell[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const v = grid[r][c].value;
      if (v !== null && v !== solution[r][c]) {
        mistakes.push([r, c]);
      }
    }
  }
  return mistakes;
}
