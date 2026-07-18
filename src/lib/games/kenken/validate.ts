import type { Cage, Cell, KenKenLibrary, KenKenPuzzle } from "./types";
import { SCHEMA_VERSION } from "./types";

const NEIGHBORS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function isLatinSquare(solution: number[][], size: number): boolean {
  if (solution.length !== size) {
    return false;
  }
  for (let i = 0; i < size; i += 1) {
    if (solution[i].length !== size) {
      return false;
    }
    const rowSeen = new Set<number>();
    const colSeen = new Set<number>();
    for (let j = 0; j < size; j += 1) {
      const rv = solution[i][j];
      const cv = solution[j][i];
      if (!Number.isInteger(rv) || rv < 1 || rv > size) {
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

function isContiguous(cells: Cell[]): boolean {
  const set = new Set(cells.map(([r, c]) => `${r},${c}`));
  const seen = new Set<string>();
  const stack: Cell[] = [cells[0]];
  while (stack.length > 0) {
    const [r, c] = stack.pop() as Cell;
    const key = `${r},${c}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    for (const [dr, dc] of NEIGHBORS) {
      if (set.has(`${r + dr},${c + dc}`)) {
        stack.push([r + dr, c + dc]);
      }
    }
  }
  return seen.size === cells.length;
}

function cageMatchesSolution(cage: Cage, solution: number[][]): boolean {
  const vals = cage.cells.map(([r, c]) => solution[r][c]);
  switch (cage.op) {
    case "=":
      return vals.length === 1 && vals[0] === cage.target;
    case "+":
      return vals.reduce((s, v) => s + v, 0) === cage.target;
    case "*":
      return vals.reduce((p, v) => p * v, 1) === cage.target;
    case "-": {
      if (vals.length !== 2) {
        return false;
      }
      return Math.abs(vals[0] - vals[1]) === cage.target;
    }
    case "/": {
      if (vals.length !== 2) {
        return false;
      }
      const hi = Math.max(vals[0], vals[1]);
      const lo = Math.min(vals[0], vals[1]);
      return lo !== 0 && hi % lo === 0 && hi / lo === cage.target;
    }
    default:
      return false;
  }
}

function validateCage(
  cage: Cage,
  id: string,
  size: number,
  solution: number[][],
  validLS: boolean,
  coverage: Map<string, number>
): string[] {
  const errors: string[] = [];
  const needsTwoCells = cage.op === "-" || cage.op === "/";
  if (needsTwoCells && cage.cells.length !== 2) {
    errors.push(`${id}: ${cage.op} cage must have exactly 2 cells`);
  }
  if (cage.op === "=" && cage.cells.length !== 1) {
    errors.push(`${id}: '=' cage must have exactly 1 cell`);
  }
  if (cage.cells.length > 1 && !isContiguous(cage.cells)) {
    errors.push(`${id}: cage is not contiguous`);
  }
  for (const [r, c] of cage.cells) {
    if (r < 0 || r >= size || c < 0 || c >= size) {
      errors.push(`${id}: cage cell (${r},${c}) is out of bounds`);
      continue;
    }
    const key = `${r},${c}`;
    coverage.set(key, (coverage.get(key) ?? 0) + 1);
  }
  if (validLS && !cageMatchesSolution(cage, solution)) {
    errors.push(
      `${id}: cage ${cage.op}/${cage.target} not satisfied by the solution`
    );
  }
  return errors;
}

function validateCoverage(
  id: string,
  size: number,
  coverage: Map<string, number>
): string[] {
  const errors: string[] = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (coverage.get(`${r},${c}`) !== 1) {
        errors.push(
          `${id}: cell (${r},${c}) is not covered by exactly one cage`
        );
      }
    }
  }
  return errors;
}

export function validatePuzzle(puzzle: KenKenPuzzle): string[] {
  const errors: string[] = [];
  const { size, cages, solution, id } = puzzle;

  const validLS = isLatinSquare(solution, size);
  if (!validLS) {
    errors.push(`${id}: solution is not a valid ${size}x${size} Latin square`);
  }

  const coverage = new Map<string, number>();
  for (const cage of cages) {
    errors.push(...validateCage(cage, id, size, solution, validLS, coverage));
  }
  errors.push(...validateCoverage(id, size, coverage));

  return errors;
}

export function validateLibrary(library: KenKenLibrary): string[] {
  const errors: string[] = [];
  if (library.schemaVersion !== SCHEMA_VERSION) {
    errors.push(
      `library schemaVersion ${library.schemaVersion} !== ${SCHEMA_VERSION}`
    );
  }
  for (const puzzle of library.puzzles) {
    if (puzzle.difficulty !== library.difficulty) {
      errors.push(`${puzzle.id}: difficulty does not match library tier`);
    }
    errors.push(...validatePuzzle(puzzle));
  }
  return errors;
}
