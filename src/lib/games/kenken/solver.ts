// src/lib/games/kenken/solver.ts
import type { Cage, Operation } from "./types";

interface CompiledCage {
  cells: number[]; // flat indices r*size + c
  op: Operation;
  target: number;
}

function cageComplete(cage: CompiledCage, grid: Int32Array): boolean {
  return cage.cells.every((ci) => grid[ci] !== 0);
}

function cageSatisfied(cage: CompiledCage, grid: Int32Array): boolean {
  const vals = cage.cells.map((ci) => grid[ci]);
  switch (cage.op) {
    case "=":
      return vals[0] === cage.target;
    case "+":
      return vals.reduce((s, v) => s + v, 0) === cage.target;
    case "*":
      return vals.reduce((p, v) => p * v, 1) === cage.target;
    case "-": {
      const hi = Math.max(vals[0], vals[1]);
      const lo = Math.min(vals[0], vals[1]);
      return hi - lo === cage.target;
    }
    case "/": {
      const hi = Math.max(vals[0], vals[1]);
      const lo = Math.min(vals[0], vals[1]);
      return lo !== 0 && hi % lo === 0 && hi / lo === cage.target;
    }
    default:
      return false;
  }
}

// Partial prune for additive/multiplicative cages while still being filled.
function cagePartialOk(cage: CompiledCage, grid: Int32Array): boolean {
  if (cage.op !== "+" && cage.op !== "*") {
    return true;
  }
  let filledCount = 0;
  let sum = 0;
  let product = 1;
  for (const ci of cage.cells) {
    const v = grid[ci];
    if (v !== 0) {
      filledCount++;
      sum += v;
      product *= v;
    }
  }
  if (filledCount === cage.cells.length) {
    return true; // completeness handled elsewhere
  }
  if (cage.op === "+") {
    // remaining cells contribute at least 1 each; sum must still fit
    return sum + (cage.cells.length - filledCount) <= cage.target;
  }
  // "*": running product must divide the target
  return cage.target % product === 0;
}

function checkCage(cage: CompiledCage, grid: Int32Array): boolean {
  const partial = cagePartialOk(cage, grid);
  if (!partial) {
    return false;
  }
  if (cageComplete(cage, grid)) {
    return cageSatisfied(cage, grid);
  }
  return true;
}

export function countSolutions(size: number, cages: Cage[], cap = 2): number {
  const cellCage = new Int32Array(size * size).fill(-1);
  const compiled: CompiledCage[] = cages.map((cage, idx) => {
    const cells = cage.cells.map(([r, c]) => r * size + c);
    for (const ci of cells) {
      cellCage[ci] = idx;
    }
    return { cells, op: cage.op, target: cage.target };
  });

  const grid = new Int32Array(size * size).fill(0);
  const rowUsed: Uint8Array[] = Array.from(
    { length: size },
    () => new Uint8Array(size + 1)
  );
  const colUsed: Uint8Array[] = Array.from(
    { length: size },
    () => new Uint8Array(size + 1)
  );

  let count = 0;

  const dfs = (pos: number): void => {
    if (count >= cap) {
      return;
    }
    if (pos === size * size) {
      count++;
      return;
    }
    const r = Math.floor(pos / size);
    const c = pos % size;
    const cage = compiled[cellCage[pos]];

    for (let v = 1; v <= size; v++) {
      if (rowUsed[r][v] === 1 || colUsed[c][v] === 1) {
        continue;
      }
      grid[pos] = v;
      rowUsed[r][v] = 1;
      colUsed[c][v] = 1;

      if (checkCage(cage, grid)) {
        dfs(pos + 1);
      }

      grid[pos] = 0;
      rowUsed[r][v] = 0;
      colUsed[c][v] = 0;
      if (count >= cap) {
        return;
      }
    }
  };

  dfs(0);
  return count;
}
