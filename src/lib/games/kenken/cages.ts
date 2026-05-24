import { type Rng, randInt } from "./rng";
import type { Cage, Cell, Operation } from "./types";

const NEIGHBORS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function buildFrontier(
  cage: Cell[],
  assigned: boolean[][],
  size: number
): Cell[] {
  const frontier: Cell[] = [];
  for (const [cr, cc] of cage) {
    for (const [dr, dc] of NEIGHBORS) {
      const nr = cr + dr;
      const nc = cc + dc;
      const inBounds = nr >= 0 && nr < size && nc >= 0 && nc < size;
      if (inBounds && !assigned[nr][nc]) {
        frontier.push([nr, nc]);
      }
    }
  }
  return frontier;
}

function growCage(
  cage: Cell[],
  assigned: boolean[][],
  size: number,
  targetSize: number,
  rng: Rng
): void {
  while (cage.length < targetSize) {
    const frontier = buildFrontier(cage, assigned, size);
    if (frontier.length === 0) {
      break;
    }
    const [nr, nc] = frontier[randInt(rng, frontier.length)];
    assigned[nr][nc] = true;
    cage.push([nr, nc]);
  }
}

export function partitionCages(
  size: number,
  maxCageSize: number,
  rng: Rng
): Cell[][] {
  const assigned: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false)
  );

  const cages: Cell[][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (assigned[r][c]) {
        continue;
      }
      const targetSize = 1 + randInt(rng, maxCageSize); // 1..maxCageSize
      const cage: Cell[] = [[r, c]];
      assigned[r][c] = true;
      growCage(cage, assigned, size, targetSize, rng);
      cages.push(cage);
    }
  }
  return cages;
}

export function assignCage(
  cells: Cell[],
  solution: number[][],
  allowedOps: Operation[],
  rng: Rng
): Cage {
  const values = cells.map(([r, c]) => solution[r][c]);

  if (cells.length === 1) {
    return { cells, op: "=", target: values[0] };
  }

  if (cells.length === 2) {
    const [a, b] = values;
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    const candidates: Operation[] = [];
    for (const op of allowedOps) {
      if (op === "+" || op === "*" || op === "-") {
        candidates.push(op);
      } else if (op === "/" && hi % lo === 0) {
        candidates.push("/");
      }
    }
    const op = candidates[randInt(rng, candidates.length)];
    let target = 0;
    if (op === "+") {
      target = a + b;
    } else if (op === "*") {
      target = a * b;
    } else if (op === "-") {
      target = hi - lo;
    } else {
      target = hi / lo;
    }
    return { cells, op, target };
  }

  // size >= 3: only + or * are well-defined for arbitrary cage size
  const multiOps = allowedOps.filter((o) => o === "+" || o === "*");
  const op = multiOps[randInt(rng, multiOps.length)];
  const target =
    op === "+"
      ? values.reduce((s, v) => s + v, 0)
      : values.reduce((p, v) => p * v, 1);
  return { cells, op, target };
}
