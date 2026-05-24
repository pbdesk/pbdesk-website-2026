# KenKen Foundation (Engine, Generator, Library, API) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the framework-free core of KenKen — puzzle data model, seedable RNG, Latin-square + cage generation, a uniqueness-verifying solver, validation, a committed puzzle library, the server-side loader, and the `GET /api/kenken/puzzle` route handler — all behind unit tests.

**Architecture:** Pure TypeScript modules under `src/lib/games/kenken/` with no React/Next dependencies (so they unit-test in isolation under `bun:test`). An offline Bun CLI (`scripts/bb/kenken/generate-kenken.ts`) generates uniquely-solvable puzzles and appends them to committed per-tier JSON libraries. A thin Next route handler wires HTTP requests to a pure `resolvePuzzleRequest` function that reads those libraries.

**Tech Stack:** Bun (runtime + test runner via `bun:test`), TypeScript (strict, `@/*` → `src/*`, `resolveJsonModule` enabled), Next.js 16 route handlers (`Response.json`).

**Scope note:** This is plan 1 of 3 for Phase 1 of the spec (`docs/superpowers/specs/2026-05-23-kenken-design.md`). It delivers the data/logic/API layer (fully testable on its own). Plan 2 = interactive game UI (`/play`, `/daily`); Plan 3 = Brain Boost section pages + Storyblok `kenken_page`. The game UI (plan 2) consumes the API this plan produces.

**Conventions to follow:**
- Test files sit next to source: `foo.ts` → `foo.test.ts`. Import from `"bun:test"`: `import { describe, expect, test } from "bun:test";`.
- Run a single test file: `bun test src/lib/games/kenken/<name>.test.ts`.
- Use the `@/` alias only in app/component code; within `src/lib/games/kenken/` use relative imports (the modules are self-contained).
- After edits run `bun run format` (ultracite) before committing; the pre-commit hook also runs it.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/lib/games/kenken/types.ts` | Data model: `Operation`, `Difficulty`, `Cell`, `Cage`, `KenKenPuzzle`, `KenKenLibrary`, `SCHEMA_VERSION`. |
| `src/lib/games/kenken/rng.ts` | Seedable RNG (`mulberry32`), `randInt`, `shuffle`. |
| `src/lib/games/kenken/latin-square.ts` | Random valid Latin square generation. |
| `src/lib/games/kenken/difficulty.ts` | Tier config (sizes, allowed ops, max cage size), `isDifficulty`, `DIFFICULTIES`. |
| `src/lib/games/kenken/cages.ts` | Contiguous cage partition + per-cage operation/target assignment. |
| `src/lib/games/kenken/solver.ts` | Backtracking solver that counts solutions up to a cap (uniqueness check). |
| `src/lib/games/kenken/validate.ts` | Structural validation of a puzzle / library. |
| `src/lib/games/kenken/generate.ts` | Orchestrates one puzzle: latin square → cages → uniqueness check. |
| `src/lib/games/kenken/puzzles/{easy,intermediate,hard,genius}.json` | Committed puzzle libraries (`KenKenLibrary`). |
| `src/lib/games/kenken/puzzle-loader.ts` | Static JSON imports + pure selectors (`selectById`, `selectRandom`, `findById`, `getLibrary`). |
| `src/lib/games/kenken/resolve.ts` | Pure `resolvePuzzleRequest` mapping params → `{ status, body }`. |
| `scripts/bb/kenken/generate-kenken.ts` | Offline CLI: generate + de-dup + append to a tier library. |
| `src/app/api/kenken/puzzle/route.ts` | `GET` handler wiring request → `resolvePuzzleRequest`. |

---

## Task 1: Data model types

**Files:**
- Create: `src/lib/games/kenken/types.ts`
- Test: `src/lib/games/kenken/types.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { type Cage, type KenKenPuzzle, SCHEMA_VERSION } from "./types";

describe("kenken types", () => {
  test("SCHEMA_VERSION is 1", () => {
    expect(SCHEMA_VERSION).toBe(1);
  });

  test("a puzzle object has the expected shape", () => {
    const cage: Cage = { cells: [[0, 0]], op: "=", target: 1 };
    const puzzle: KenKenPuzzle = {
      id: "k3-easy-00001",
      size: 3,
      difficulty: "easy",
      cages: [cage],
      solution: [
        [1, 2, 3],
        [2, 3, 1],
        [3, 1, 2],
      ],
    };
    expect(puzzle.cages[0].op).toBe("=");
    expect(puzzle.solution.length).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/types.test.ts`
Expected: FAIL — cannot find module `./types`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/types.ts
export type Operation = "+" | "-" | "*" | "/" | "=";

export type Difficulty = "easy" | "intermediate" | "hard" | "genius";

// 0-indexed [row, col]
export type Cell = [row: number, col: number];

export interface Cage {
  cells: Cell[];
  op: Operation;
  target: number;
}

export interface KenKenPuzzle {
  id: string;
  size: number;
  difficulty: Difficulty;
  cages: Cage[];
  solution: number[][];
}

export interface KenKenLibrary {
  schemaVersion: number;
  difficulty: Difficulty;
  puzzles: KenKenPuzzle[];
}

export const SCHEMA_VERSION = 1;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/types.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/types.ts src/lib/games/kenken/types.test.ts
git commit -m "feat(kenken): add puzzle data model types"
```

---

## Task 2: Seedable RNG

**Files:**
- Create: `src/lib/games/kenken/rng.ts`
- Test: `src/lib/games/kenken/rng.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { mulberry32, randInt, shuffle } from "./rng";

describe("rng", () => {
  test("mulberry32 is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  test("mulberry32 produces values in [0, 1)", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test("randInt returns values in [0, maxExclusive)", () => {
    const r = mulberry32(1);
    for (let i = 0; i < 100; i++) {
      const v = randInt(r, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  test("shuffle is a permutation and deterministic for a seed", () => {
    const input = [1, 2, 3, 4, 5];
    const out1 = shuffle(mulberry32(99), input);
    const out2 = shuffle(mulberry32(99), input);
    expect(out1).toEqual(out2);
    expect([...out1].sort((x, y) => x - y)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]); // does not mutate input
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/rng.test.ts`
Expected: FAIL — cannot find module `./rng`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/rng.ts
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: Rng, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive);
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/rng.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/rng.ts src/lib/games/kenken/rng.test.ts
git commit -m "feat(kenken): add seedable RNG helpers"
```

---

## Task 3: Latin square generation

**Files:**
- Create: `src/lib/games/kenken/latin-square.ts`
- Test: `src/lib/games/kenken/latin-square.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { generateLatinSquare } from "./latin-square";
import { mulberry32 } from "./rng";

function isLatinSquare(grid: number[][], size: number): boolean {
  if (grid.length !== size) {
    return false;
  }
  for (let i = 0; i < size; i++) {
    if (grid[i].length !== size) {
      return false;
    }
    const rowSeen = new Set<number>();
    const colSeen = new Set<number>();
    for (let j = 0; j < size; j++) {
      const rv = grid[i][j];
      const cv = grid[j][i];
      if (rv < 1 || rv > size || cv < 1 || cv > size) {
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

describe("generateLatinSquare", () => {
  for (const size of [3, 4, 5, 6, 7, 8, 9]) {
    test(`produces a valid ${size}x${size} Latin square`, () => {
      const grid = generateLatinSquare(size, mulberry32(size * 13 + 1));
      expect(isLatinSquare(grid, size)).toBe(true);
    });
  }

  test("is deterministic for a given seed", () => {
    const a = generateLatinSquare(5, mulberry32(123));
    const b = generateLatinSquare(5, mulberry32(123));
    expect(a).toEqual(b);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/latin-square.test.ts`
Expected: FAIL — cannot find module `./latin-square`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/latin-square.ts
import { type Rng, shuffle } from "./rng";

export function generateLatinSquare(size: number, rng: Rng): number[][] {
  const base: number[][] = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(((i + j) % size) + 1);
    }
    base.push(row);
  }

  const indices = Array.from({ length: size }, (_, i) => i);
  const rowOrder = shuffle(rng, indices);
  const colOrder = shuffle(rng, indices);
  const symbols = shuffle(
    rng,
    Array.from({ length: size }, (_, i) => i + 1)
  );

  const result: number[][] = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      const baseValue = base[rowOrder[i]][colOrder[j]];
      row.push(symbols[baseValue - 1]);
    }
    result.push(row);
  }
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/latin-square.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/latin-square.ts src/lib/games/kenken/latin-square.test.ts
git commit -m "feat(kenken): add Latin square generation"
```

---

## Task 4: Difficulty/tier configuration

**Files:**
- Create: `src/lib/games/kenken/difficulty.ts`
- Test: `src/lib/games/kenken/difficulty.test.ts`

Mapping (from spec §3): Easy = 3×3 all ops + 4×4/5×5 without division; Intermediate = 4×4/5×5 all ops; Hard = 6×6/7×7 all ops; Genius = 8×8/9×9 all ops. Operations listed here are the **multi-cell** ops allowed; `+` and `*` apply to any cage size, `-` and `/` only to 2-cell cages (enforced in Task 5).

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { DIFFICULTIES, isDifficulty, TIERS } from "./difficulty";

describe("difficulty config", () => {
  test("DIFFICULTIES lists all four tiers", () => {
    expect(DIFFICULTIES).toEqual(["easy", "intermediate", "hard", "genius"]);
  });

  test("isDifficulty narrows valid/invalid values", () => {
    expect(isDifficulty("easy")).toBe(true);
    expect(isDifficulty("genius")).toBe(true);
    expect(isDifficulty("medium")).toBe(false);
    expect(isDifficulty(null)).toBe(false);
  });

  test("easy 4x4 and 5x5 variants exclude division", () => {
    const easyBig = TIERS.easy.variants.filter((v) => v.size > 3);
    expect(easyBig.length).toBe(2);
    for (const v of easyBig) {
      expect(v.ops).not.toContain("/");
    }
  });

  test("easy 3x3 includes all four operations", () => {
    const v3 = TIERS.easy.variants.find((v) => v.size === 3);
    expect(v3?.ops).toEqual(["+", "-", "*", "/"]);
  });

  test("intermediate, hard, genius use all four operations", () => {
    for (const tier of ["intermediate", "hard", "genius"] as const) {
      for (const v of TIERS[tier].variants) {
        expect(v.ops).toEqual(["+", "-", "*", "/"]);
      }
    }
  });

  test("tier sizes match the spec", () => {
    expect(TIERS.easy.variants.map((v) => v.size).sort()).toEqual([3, 4, 5]);
    expect(TIERS.intermediate.variants.map((v) => v.size).sort()).toEqual([4, 5]);
    expect(TIERS.hard.variants.map((v) => v.size).sort()).toEqual([6, 7]);
    expect(TIERS.genius.variants.map((v) => v.size).sort()).toEqual([8, 9]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/difficulty.test.ts`
Expected: FAIL — cannot find module `./difficulty`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/difficulty.ts
import type { Difficulty, Operation } from "./types";

export interface TierVariant {
  size: number;
  ops: Operation[]; // multi-cell ops allowed; "-"/"/" restricted to 2-cell cages
}

export interface TierConfig {
  variants: TierVariant[];
  maxCageSize: number;
}

export const DIFFICULTIES: Difficulty[] = [
  "easy",
  "intermediate",
  "hard",
  "genius",
];

const ALL_OPS: Operation[] = ["+", "-", "*", "/"];
const NO_DIVISION: Operation[] = ["+", "-", "*"];

export const TIERS: Record<Difficulty, TierConfig> = {
  easy: {
    variants: [
      { size: 3, ops: ALL_OPS },
      { size: 4, ops: NO_DIVISION },
      { size: 5, ops: NO_DIVISION },
    ],
    maxCageSize: 3,
  },
  intermediate: {
    variants: [
      { size: 4, ops: ALL_OPS },
      { size: 5, ops: ALL_OPS },
    ],
    maxCageSize: 4,
  },
  hard: {
    variants: [
      { size: 6, ops: ALL_OPS },
      { size: 7, ops: ALL_OPS },
    ],
    maxCageSize: 4,
  },
  genius: {
    variants: [
      { size: 8, ops: ALL_OPS },
      { size: 9, ops: ALL_OPS },
    ],
    maxCageSize: 5,
  },
};

export function isDifficulty(value: unknown): value is Difficulty {
  return (
    typeof value === "string" &&
    (DIFFICULTIES as string[]).includes(value)
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/difficulty.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/difficulty.ts src/lib/games/kenken/difficulty.test.ts
git commit -m "feat(kenken): add difficulty/tier configuration"
```

---

## Task 5: Cage partition and operation assignment

**Files:**
- Create: `src/lib/games/kenken/cages.ts`
- Test: `src/lib/games/kenken/cages.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { assignCage, partitionCages } from "./cages";
import { mulberry32 } from "./rng";
import type { Cell } from "./types";

function flat([r, c]: Cell): string {
  return `${r},${c}`;
}

function isContiguous(cells: Cell[]): boolean {
  const set = new Set(cells.map(flat));
  const seen = new Set<string>();
  const stack: Cell[] = [cells[0]];
  while (stack.length > 0) {
    const [r, c] = stack.pop() as Cell;
    const key = `${r},${c}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nKey = `${r + dr},${c + dc}`;
      if (set.has(nKey)) {
        stack.push([r + dr, c + dc]);
      }
    }
  }
  return seen.size === cells.length;
}

describe("partitionCages", () => {
  for (const size of [3, 4, 5, 6, 7, 9]) {
    test(`covers every cell exactly once for ${size}x${size}`, () => {
      const cages = partitionCages(size, 4, mulberry32(size + 5));
      const counts = new Map<string, number>();
      for (const cage of cages) {
        for (const cell of cage) {
          counts.set(flat(cell), (counts.get(flat(cell)) ?? 0) + 1);
        }
      }
      expect(counts.size).toBe(size * size);
      for (const n of counts.values()) {
        expect(n).toBe(1);
      }
    });

    test(`every cage is contiguous and within size bounds for ${size}x${size}`, () => {
      const maxCageSize = 4;
      const cages = partitionCages(size, maxCageSize, mulberry32(size + 5));
      for (const cage of cages) {
        expect(cage.length).toBeGreaterThanOrEqual(1);
        expect(cage.length).toBeLessThanOrEqual(maxCageSize);
        expect(isContiguous(cage)).toBe(true);
      }
    });
  }
});

describe("assignCage", () => {
  const solution = [
    [1, 2, 3],
    [2, 3, 1],
    [3, 1, 2],
  ];

  test("single-cell cage becomes an '=' freebie", () => {
    const cage = assignCage([[0, 0]], solution, ["+", "-", "*", "/"], mulberry32(1));
    expect(cage.op).toBe("=");
    expect(cage.target).toBe(1);
  });

  test("subtraction target is the absolute difference", () => {
    // cells (0,0)=1 and (1,0)=2 -> only allow subtraction
    const cage = assignCage([[0, 0], [1, 0]], solution, ["-"], mulberry32(1));
    expect(cage.op).toBe("-");
    expect(cage.target).toBe(1);
  });

  test("division only chosen when it divides evenly; target is larger/smaller", () => {
    // cells (0,1)=2 and (1,1)=3 do NOT divide evenly -> division must not be picked
    const nonDiv = assignCage([[0, 1], [1, 1]], solution, ["/"], mulberry32(1));
    expect(nonDiv.op).not.toBe("/");
    // cells (0,0)=1 and (1,0)=2 divide evenly -> division allowed, target 2
    const div = assignCage([[0, 0], [1, 0]], solution, ["/"], mulberry32(1));
    expect(div.op).toBe("/");
    expect(div.target).toBe(2);
  });

  test("multi-cell (>=3) cage uses + or * with correct target", () => {
    const cells: Cell[] = [[0, 0], [0, 1], [0, 2]]; // values 1,2,3
    const sumCage = assignCage(cells, solution, ["+"], mulberry32(1));
    expect(sumCage.op).toBe("+");
    expect(sumCage.target).toBe(6);
    const prodCage = assignCage(cells, solution, ["*"], mulberry32(1));
    expect(prodCage.op).toBe("*");
    expect(prodCage.target).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/cages.test.ts`
Expected: FAIL — cannot find module `./cages`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/cages.ts
import { randInt, type Rng } from "./rng";
import type { Cage, Cell, Operation } from "./types";

const NEIGHBORS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function partitionCages(
  size: number,
  maxCageSize: number,
  rng: Rng
): Cell[][] {
  const assigned: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false)
  );
  const inBounds = (r: number, c: number): boolean =>
    r >= 0 && r < size && c >= 0 && c < size;

  const cages: Cell[][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (assigned[r][c]) {
        continue;
      }
      const targetSize = 1 + randInt(rng, maxCageSize); // 1..maxCageSize
      const cage: Cell[] = [[r, c]];
      assigned[r][c] = true;

      while (cage.length < targetSize) {
        const frontier: Cell[] = [];
        for (const [cr, cc] of cage) {
          for (const [dr, dc] of NEIGHBORS) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (inBounds(nr, nc) && !assigned[nr][nc]) {
              frontier.push([nr, nc]);
            }
          }
        }
        if (frontier.length === 0) {
          break;
        }
        const [nr, nc] = frontier[randInt(rng, frontier.length)];
        assigned[nr][nc] = true;
        cage.push([nr, nc]);
      }
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
    let target: number;
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/cages.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/cages.ts src/lib/games/kenken/cages.test.ts
git commit -m "feat(kenken): add cage partition and operation assignment"
```

---

## Task 6: Uniqueness-verifying solver

**Files:**
- Create: `src/lib/games/kenken/solver.ts`
- Test: `src/lib/games/kenken/solver.test.ts`

The solver counts solutions up to a cap (default 2), enough to prove uniqueness. It enforces the Latin-square constraint as it fills cells in row-major order and checks each cage on completion, with partial pruning for `+`/`*`.

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { countSolutions } from "./solver";
import { generateLatinSquare } from "./latin-square";
import { mulberry32 } from "./rng";
import type { Cage, Cell } from "./types";

// All-singletons: every cell is its own "=" cage -> exactly one solution.
function singletonCages(solution: number[][]): Cage[] {
  const cages: Cage[] = [];
  for (let r = 0; r < solution.length; r++) {
    for (let c = 0; c < solution[r].length; c++) {
      cages.push({ cells: [[r, c]], op: "=", target: solution[r][c] });
    }
  }
  return cages;
}

describe("countSolutions", () => {
  test("all-singleton cages yield exactly one solution", () => {
    const solution = generateLatinSquare(4, mulberry32(3));
    expect(countSolutions(4, singletonCages(solution), 2)).toBe(1);
  });

  test("a single all-grid '+' cage is satisfied by many Latin squares (caps at 2)", () => {
    const size = 4;
    const allCells: Cell[] = [];
    let total = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        allCells.push([r, c]);
        total += ((r + c) % size) + 1; // total is the same for any Latin square
      }
    }
    const cages: Cage[] = [{ cells: allCells, op: "+", target: total }];
    expect(countSolutions(size, cages, 2)).toBe(2);
  });

  test("returns 0 when no assignment satisfies the cages", () => {
    // One cell whose '=' target is impossible (out of range) -> no solution.
    const size = 3;
    const cages: Cage[] = singletonCages([
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ]);
    expect(countSolutions(size, cages, 2)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/solver.test.ts`
Expected: FAIL — cannot find module `./solver`.

- [ ] **Step 3: Write the implementation**

```ts
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

      let ok = cagePartialOk(cage, grid);
      if (ok && cageComplete(cage, grid)) {
        ok = cageSatisfied(cage, grid);
      }
      if (ok) {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/solver.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/solver.ts src/lib/games/kenken/solver.test.ts
git commit -m "feat(kenken): add uniqueness-verifying backtracking solver"
```

---

## Task 7: Puzzle/library validation

**Files:**
- Create: `src/lib/games/kenken/validate.ts`
- Test: `src/lib/games/kenken/validate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { SCHEMA_VERSION, type KenKenPuzzle } from "./types";
import { validateLibrary, validatePuzzle } from "./validate";

function validSingletonPuzzle(): KenKenPuzzle {
  const solution = [
    [1, 2, 3],
    [2, 3, 1],
    [3, 1, 2],
  ];
  const cages = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cages.push({ cells: [[r, c]] as [number, number][], op: "=" as const, target: solution[r][c] });
    }
  }
  return { id: "k3-easy-00001", size: 3, difficulty: "easy", cages, solution };
}

describe("validatePuzzle", () => {
  test("a well-formed puzzle returns no errors", () => {
    expect(validatePuzzle(validSingletonPuzzle())).toEqual([]);
  });

  test("flags a cage target that the solution does not satisfy", () => {
    const p = validSingletonPuzzle();
    p.cages[0].target = 9; // (0,0) is 1, not 9
    expect(validatePuzzle(p).length).toBeGreaterThan(0);
  });

  test("flags a solution that is not a Latin square", () => {
    const p = validSingletonPuzzle();
    p.solution[0][0] = 2; // duplicates 2 in row 0
    expect(validatePuzzle(p).length).toBeGreaterThan(0);
  });

  test("flags a cell not covered by exactly one cage", () => {
    const p = validSingletonPuzzle();
    p.cages.pop(); // leave (2,2) uncovered
    expect(validatePuzzle(p).length).toBeGreaterThan(0);
  });

  test("flags a subtraction cage that is not exactly two cells", () => {
    const p = validSingletonPuzzle();
    p.cages = [
      { cells: [[0, 0], [0, 1], [0, 2]], op: "-", target: 1 },
      ...p.cages.filter(
        (cg) => !(cg.cells[0][0] === 0 && cg.cells[0][1] <= 2)
      ),
    ];
    expect(validatePuzzle(p).length).toBeGreaterThan(0);
  });
});

describe("validateLibrary", () => {
  test("valid library returns no errors", () => {
    const lib = {
      schemaVersion: SCHEMA_VERSION,
      difficulty: "easy" as const,
      puzzles: [validSingletonPuzzle()],
    };
    expect(validateLibrary(lib)).toEqual([]);
  });

  test("flags wrong schemaVersion", () => {
    const lib = {
      schemaVersion: 999,
      difficulty: "easy" as const,
      puzzles: [validSingletonPuzzle()],
    };
    expect(validateLibrary(lib).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/validate.test.ts`
Expected: FAIL — cannot find module `./validate`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/validate.ts
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
  for (let i = 0; i < size; i++) {
    if (solution[i].length !== size) {
      return false;
    }
    const rowSeen = new Set<number>();
    const colSeen = new Set<number>();
    for (let j = 0; j < size; j++) {
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

export function validatePuzzle(puzzle: KenKenPuzzle): string[] {
  const errors: string[] = [];
  const { size, cages, solution, id } = puzzle;

  if (!isLatinSquare(solution, size)) {
    errors.push(`${id}: solution is not a valid ${size}x${size} Latin square`);
  }

  const coverage = new Map<string, number>();
  for (const cage of cages) {
    if ((cage.op === "-" || cage.op === "/") && cage.cells.length !== 2) {
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
    if (isLatinSquare(solution, size) && !cageMatchesSolution(cage, solution)) {
      errors.push(
        `${id}: cage ${cage.op}/${cage.target} not satisfied by the solution`
      );
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (coverage.get(`${r},${c}`) !== 1) {
        errors.push(`${id}: cell (${r},${c}) is not covered by exactly one cage`);
      }
    }
  }

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/validate.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/validate.ts src/lib/games/kenken/validate.test.ts
git commit -m "feat(kenken): add puzzle and library validation"
```

---

## Task 8: Puzzle generator orchestration

**Files:**
- Create: `src/lib/games/kenken/generate.ts`
- Test: `src/lib/games/kenken/generate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { generatePuzzleForTier } from "./generate";
import { mulberry32 } from "./rng";
import { countSolutions } from "./solver";
import { validatePuzzle } from "./validate";

describe("generatePuzzleForTier", () => {
  for (const difficulty of ["easy", "intermediate"] as const) {
    test(`produces a uniquely-solvable, valid ${difficulty} puzzle`, () => {
      const puzzle = generatePuzzleForTier(
        difficulty,
        mulberry32(difficulty.length * 7 + 1),
        `${difficulty}-test`
      );
      expect(puzzle).not.toBeNull();
      if (!puzzle) {
        return;
      }
      expect(puzzle.difficulty).toBe(difficulty);
      expect(validatePuzzle(puzzle)).toEqual([]);
      expect(countSolutions(puzzle.size, puzzle.cages, 2)).toBe(1);
    });
  }

  test("assigns the provided id", () => {
    const puzzle = generatePuzzleForTier("easy", mulberry32(2), "my-id");
    expect(puzzle?.id).toBe("my-id");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/generate.test.ts`
Expected: FAIL — cannot find module `./generate`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/generate.ts
import { assignCage, partitionCages } from "./cages";
import { TIERS } from "./difficulty";
import { generateLatinSquare } from "./latin-square";
import { randInt, type Rng } from "./rng";
import { countSolutions } from "./solver";
import type { Cage, Difficulty, KenKenPuzzle, Operation } from "./types";

const DEFAULT_MAX_ATTEMPTS = 400;

export function generatePuzzle(
  size: number,
  difficulty: Difficulty,
  allowedOps: Operation[],
  maxCageSize: number,
  rng: Rng,
  id: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS
): KenKenPuzzle | null {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const solution = generateLatinSquare(size, rng);
    const groups = partitionCages(size, maxCageSize, rng);
    const cages: Cage[] = groups.map((cells) =>
      assignCage(cells, solution, allowedOps, rng)
    );
    if (countSolutions(size, cages, 2) === 1) {
      return { id, size, difficulty, cages, solution };
    }
  }
  return null;
}

export function generatePuzzleForTier(
  difficulty: Difficulty,
  rng: Rng,
  id: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS
): KenKenPuzzle | null {
  const tier = TIERS[difficulty];
  const variant = tier.variants[randInt(rng, tier.variants.length)];
  return generatePuzzle(
    variant.size,
    difficulty,
    variant.ops,
    tier.maxCageSize,
    rng,
    id,
    maxAttempts
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/generate.test.ts`
Expected: PASS (3 tests). Note: `easy`/`intermediate` are fast; `hard`/`genius` are intentionally not generated in the unit test to keep it quick (those are exercised by the offline script in Task 9).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/generate.ts src/lib/games/kenken/generate.test.ts
git commit -m "feat(kenken): add puzzle generator orchestration"
```

---

## Task 9: Offline generator CLI + seed the libraries

**Files:**
- Create: `scripts/bb/kenken/generate-kenken.ts`
- Create: `src/lib/games/kenken/puzzles/easy.json`
- Create: `src/lib/games/kenken/puzzles/intermediate.json`
- Create: `src/lib/games/kenken/puzzles/hard.json`
- Create: `src/lib/games/kenken/puzzles/genius.json`

This task has no unit test (it is an I/O script); its output is validated by Task 7's `validateLibrary` and exercised by Tasks 10–12. Verification is running it and checking the files.

- [ ] **Step 1: Create the four empty library files**

`src/lib/games/kenken/puzzles/easy.json`:

```json
{
  "schemaVersion": 1,
  "difficulty": "easy",
  "puzzles": []
}
```

`src/lib/games/kenken/puzzles/intermediate.json`:

```json
{
  "schemaVersion": 1,
  "difficulty": "intermediate",
  "puzzles": []
}
```

`src/lib/games/kenken/puzzles/hard.json`:

```json
{
  "schemaVersion": 1,
  "difficulty": "hard",
  "puzzles": []
}
```

`src/lib/games/kenken/puzzles/genius.json`:

```json
{
  "schemaVersion": 1,
  "difficulty": "genius",
  "puzzles": []
}
```

- [ ] **Step 2: Write the generator CLI**

```ts
// scripts/bb/kenken/generate-kenken.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDifficulty } from "../../../src/lib/games/kenken/difficulty";
import { generatePuzzleForTier } from "../../../src/lib/games/kenken/generate";
import { mulberry32 } from "../../../src/lib/games/kenken/rng";
import {
  type Difficulty,
  type KenKenLibrary,
  type KenKenPuzzle,
  SCHEMA_VERSION,
} from "../../../src/lib/games/kenken/types";
import { validateLibrary } from "../../../src/lib/games/kenken/validate";

const PUZZLES_DIR = join(
  process.cwd(),
  "src/lib/games/kenken/puzzles"
);

function parseArgs(argv: string[]): {
  difficulty: Difficulty;
  count: number;
  seed: number;
} {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      args.set(a.slice(2), argv[i + 1]);
      i++;
    }
  }
  const difficulty = args.get("difficulty");
  if (!isDifficulty(difficulty)) {
    throw new Error(
      "Usage: --difficulty <easy|intermediate|hard|genius> --count N [--seed S]"
    );
  }
  const count = Number(args.get("count") ?? "10");
  const seed = Number(args.get("seed") ?? String(Date.now() % 2_147_483_647));
  return { difficulty, count, seed };
}

function solutionSignature(puzzle: KenKenPuzzle): string {
  return puzzle.solution.map((row) => row.join("")).join("|");
}

function nextSeq(puzzles: KenKenPuzzle[]): number {
  let max = 0;
  for (const p of puzzles) {
    const tail = Number(p.id.split("-").at(-1));
    if (Number.isFinite(tail) && tail > max) {
      max = tail;
    }
  }
  return max + 1;
}

function main(): void {
  const { difficulty, count, seed } = parseArgs(process.argv.slice(2));
  const filePath = join(PUZZLES_DIR, `${difficulty}.json`);
  const library = JSON.parse(readFileSync(filePath, "utf8")) as KenKenLibrary;
  library.schemaVersion = SCHEMA_VERSION;

  const signatures = new Set(library.puzzles.map(solutionSignature));
  const rng = mulberry32(seed);
  let seq = nextSeq(library.puzzles);
  let added = 0;
  let guard = 0;
  const maxGuard = count * 50;

  while (added < count && guard < maxGuard) {
    guard++;
    const provisionalId = `pending-${seq}`;
    const puzzle = generatePuzzleForTier(difficulty, rng, provisionalId);
    if (!puzzle) {
      continue;
    }
    const sig = solutionSignature(puzzle);
    if (signatures.has(sig)) {
      continue;
    }
    puzzle.id = `k${puzzle.size}-${difficulty}-${String(seq).padStart(5, "0")}`;
    signatures.add(sig);
    library.puzzles.push(puzzle);
    seq++;
    added++;
  }

  const errors = validateLibrary(library);
  if (errors.length > 0) {
    throw new Error(`Generated library is invalid:\n${errors.join("\n")}`);
  }

  writeFileSync(filePath, `${JSON.stringify(library, null, 2)}\n`);
  process.stdout.write(
    `Added ${added} ${difficulty} puzzles (total ${library.puzzles.length}). Seed ${seed}.\n`
  );
}

main();
```

- [ ] **Step 3: Seed each tier (run the script)**

Run (Genius seeded smaller initially per the spec's generation-cost risk):

```bash
bun run scripts/bb/kenken/generate-kenken.ts --difficulty easy --count 50 --seed 1001
bun run scripts/bb/kenken/generate-kenken.ts --difficulty intermediate --count 50 --seed 2002
bun run scripts/bb/kenken/generate-kenken.ts --difficulty hard --count 50 --seed 3003
bun run scripts/bb/kenken/generate-kenken.ts --difficulty genius --count 15 --seed 4004
```

Expected: each prints `Added N <tier> puzzles ...` and exits 0. If `genius` is slow or adds fewer than requested, that is acceptable for launch — re-run later with a different `--seed` to grow the pool.

- [ ] **Step 4: Verify the libraries validate**

Create a throwaway check (or rely on Task 10's loader test which imports them). Quick inline check:

```bash
bun -e "import('./src/lib/games/kenken/validate').then(async (v)=>{for (const d of ['easy','intermediate','hard','genius']){const lib=(await import('./src/lib/games/kenken/puzzles/'+d+'.json')).default;const e=v.validateLibrary(lib);console.log(d, lib.puzzles.length, e.length===0?'OK':e);} })"
```

Expected: each tier prints a count and `OK`.

- [ ] **Step 5: Commit**

```bash
bun run format
git add scripts/bb/kenken/generate-kenken.ts src/lib/games/kenken/puzzles
git commit -m "feat(kenken): add generator CLI and seed puzzle libraries"
```

---

## Task 10: Library loader + pure selectors

**Files:**
- Create: `src/lib/games/kenken/puzzle-loader.ts`
- Test: `src/lib/games/kenken/puzzle-loader.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { mulberry32 } from "./rng";
import {
  findById,
  getLibrary,
  selectById,
  selectRandom,
} from "./puzzle-loader";
import type { KenKenPuzzle } from "./types";

function fixture(id: string): KenKenPuzzle {
  return {
    id,
    size: 3,
    difficulty: "easy",
    cages: [{ cells: [[0, 0]], op: "=", target: 1 }],
    solution: [
      [1, 2, 3],
      [2, 3, 1],
      [3, 1, 2],
    ],
  };
}

describe("selectById", () => {
  test("finds a puzzle by id, or returns null", () => {
    const puzzles = [fixture("a"), fixture("b")];
    expect(selectById(puzzles, "b")?.id).toBe("b");
    expect(selectById(puzzles, "z")).toBeNull();
  });
});

describe("selectRandom", () => {
  test("returns null for an empty pool", () => {
    expect(selectRandom([], [], mulberry32(1))).toBeNull();
  });

  test("prefers a puzzle not in the exclude list", () => {
    const puzzles = [fixture("a"), fixture("b"), fixture("c")];
    const picked = selectRandom(puzzles, ["a", "b"], mulberry32(1));
    expect(picked?.id).toBe("c");
  });

  test("falls back to the full pool when everything is excluded", () => {
    const puzzles = [fixture("a"), fixture("b")];
    const picked = selectRandom(puzzles, ["a", "b"], mulberry32(1));
    expect(["a", "b"]).toContain(picked?.id);
  });
});

describe("library access", () => {
  test("getLibrary returns a populated tier with matching difficulty", () => {
    const lib = getLibrary("easy");
    expect(lib.difficulty).toBe("easy");
    expect(lib.puzzles.length).toBeGreaterThan(0);
  });

  test("findById resolves a real puzzle from the seeded library", () => {
    const sample = getLibrary("easy").puzzles[0];
    expect(findById(sample.id)?.id).toBe(sample.id);
    expect(findById("does-not-exist")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/puzzle-loader.test.ts`
Expected: FAIL — cannot find module `./puzzle-loader`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/puzzle-loader.ts
import easy from "./puzzles/easy.json";
import genius from "./puzzles/genius.json";
import hard from "./puzzles/hard.json";
import intermediate from "./puzzles/intermediate.json";
import { type Rng } from "./rng";
import type { Difficulty, KenKenLibrary, KenKenPuzzle } from "./types";

const LIBRARIES: Record<Difficulty, KenKenLibrary> = {
  easy: easy as KenKenLibrary,
  intermediate: intermediate as KenKenLibrary,
  hard: hard as KenKenLibrary,
  genius: genius as KenKenLibrary,
};

export function selectById(
  puzzles: KenKenPuzzle[],
  id: string
): KenKenPuzzle | null {
  return puzzles.find((p) => p.id === id) ?? null;
}

export function selectRandom(
  puzzles: KenKenPuzzle[],
  exclude: string[],
  rng: Rng = Math.random
): KenKenPuzzle | null {
  if (puzzles.length === 0) {
    return null;
  }
  const excludeSet = new Set(exclude);
  const unseen = puzzles.filter((p) => !excludeSet.has(p.id));
  const pool = unseen.length > 0 ? unseen : puzzles;
  return pool[Math.floor(rng() * pool.length)];
}

export function getLibrary(level: Difficulty): KenKenLibrary {
  return LIBRARIES[level];
}

export function findById(id: string): KenKenPuzzle | null {
  for (const library of Object.values(LIBRARIES)) {
    const found = selectById(library.puzzles, id);
    if (found) {
      return found;
    }
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/puzzle-loader.test.ts`
Expected: PASS (all cases). (Depends on Task 9 having seeded the libraries.)

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/puzzle-loader.ts src/lib/games/kenken/puzzle-loader.test.ts
git commit -m "feat(kenken): add library loader and pure selectors"
```

---

## Task 11: Pure request resolver

**Files:**
- Create: `src/lib/games/kenken/resolve.ts`
- Test: `src/lib/games/kenken/resolve.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { mulberry32 } from "./rng";
import { resolvePuzzleRequest } from "./resolve";
import type { KenKenPuzzle } from "./types";

function fixture(id: string): KenKenPuzzle {
  return {
    id,
    size: 3,
    difficulty: "easy",
    cages: [{ cells: [[0, 0]], op: "=", target: 1 }],
    solution: [
      [1, 2, 3],
      [2, 3, 1],
      [3, 1, 2],
    ],
  };
}

const lookup = {
  byId: (id: string) => (id === "known" ? fixture("known") : null),
  byLevel: (level: string) =>
    level === "easy" ? [fixture("a"), fixture("b"), fixture("c")] : [],
};

describe("resolvePuzzleRequest", () => {
  test("returns 200 with the puzzle for a known id", () => {
    const res = resolvePuzzleRequest(
      { id: "known", level: null, exclude: [] },
      lookup,
      mulberry32(1)
    );
    expect(res.status).toBe(200);
    expect((res.body as KenKenPuzzle).id).toBe("known");
  });

  test("returns 404 for an unknown id", () => {
    const res = resolvePuzzleRequest(
      { id: "nope", level: null, exclude: [] },
      lookup,
      mulberry32(1)
    );
    expect(res.status).toBe(404);
  });

  test("returns 400 for a missing/invalid level when no id", () => {
    expect(
      resolvePuzzleRequest({ id: null, level: null, exclude: [] }, lookup, mulberry32(1)).status
    ).toBe(400);
    expect(
      resolvePuzzleRequest({ id: null, level: "medium", exclude: [] }, lookup, mulberry32(1)).status
    ).toBe(400);
  });

  test("returns 503 when the tier library is empty", () => {
    const res = resolvePuzzleRequest(
      { id: null, level: "genius", exclude: [] },
      lookup,
      mulberry32(1)
    );
    expect(res.status).toBe(503);
  });

  test("returns 200 and avoids excluded ids when possible", () => {
    const res = resolvePuzzleRequest(
      { id: null, level: "easy", exclude: ["a", "b"] },
      lookup,
      mulberry32(1)
    );
    expect(res.status).toBe(200);
    expect((res.body as KenKenPuzzle).id).toBe("c");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/resolve.test.ts`
Expected: FAIL — cannot find module `./resolve`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/resolve.ts
import { isDifficulty } from "./difficulty";
import { selectRandom } from "./puzzle-loader";
import { type Rng } from "./rng";
import type { Difficulty, KenKenPuzzle } from "./types";

export interface PuzzleRequestParams {
  id: string | null;
  level: string | null;
  exclude: string[];
}

export interface PuzzleLookup {
  byId: (id: string) => KenKenPuzzle | null;
  byLevel: (level: Difficulty) => KenKenPuzzle[];
}

export interface ResolvedResponse {
  status: number;
  body: KenKenPuzzle | { error: string };
}

export function resolvePuzzleRequest(
  params: PuzzleRequestParams,
  lookup: PuzzleLookup,
  rng: Rng = Math.random
): ResolvedResponse {
  if (params.id) {
    const puzzle = lookup.byId(params.id);
    return puzzle
      ? { status: 200, body: puzzle }
      : { status: 404, body: { error: "puzzle not found" } };
  }

  if (!isDifficulty(params.level)) {
    return { status: 400, body: { error: "invalid level" } };
  }

  const puzzles = lookup.byLevel(params.level);
  if (puzzles.length === 0) {
    return { status: 503, body: { error: "no puzzles available" } };
  }

  const puzzle = selectRandom(puzzles, params.exclude, rng);
  if (!puzzle) {
    return { status: 503, body: { error: "no puzzles available" } };
  }
  return { status: 200, body: puzzle };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/resolve.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/resolve.ts src/lib/games/kenken/resolve.test.ts
git commit -m "feat(kenken): add pure request resolver"
```

---

## Task 12: Route handler

**Files:**
- Create: `src/app/api/kenken/puzzle/route.ts`

The handler is a thin wiring layer (parse query → call resolver → `Response.json`). It is verified manually + via the dev server; the decision logic itself is already unit-tested in Task 11.

- [ ] **Step 1: Write the implementation**

```ts
// src/app/api/kenken/puzzle/route.ts
import type { NextRequest } from "next/server";
import { findById, getLibrary } from "@/lib/games/kenken/puzzle-loader";
import { resolvePuzzleRequest } from "@/lib/games/kenken/resolve";

// Random selection per request: never cache.
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const level = searchParams.get("level");
  const excludeParam = searchParams.get("exclude") ?? "";
  const exclude = excludeParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const result = resolvePuzzleRequest(
    { id, level, exclude },
    {
      byId: (puzzleId) => findById(puzzleId),
      byLevel: (lvl) => getLibrary(lvl).puzzles,
    }
  );

  return Response.json(result.body, { status: result.status });
}
```

- [ ] **Step 2: Type-check / build**

Run: `bun run build`
Expected: build succeeds (the route compiles; `force-dynamic` is recognized).

- [ ] **Step 3: Manual verification against the dev server**

Run `bun run dev`, then in another terminal:

```bash
curl -k -s "https://localhost:3000/api/kenken/puzzle?level=easy" | head -c 200
curl -k -s -o /dev/null -w "%{http_code}\n" "https://localhost:3000/api/kenken/puzzle?level=medium"   # expect 400
curl -k -s -o /dev/null -w "%{http_code}\n" "https://localhost:3000/api/kenken/puzzle?id=nope"        # expect 404
curl -k -s "https://localhost:3000/api/kenken/puzzle?level=easy" > /tmp/a.json
curl -k -s "https://localhost:3000/api/kenken/puzzle?level=easy" > /tmp/b.json
diff /tmp/a.json /tmp/b.json && echo "SAME (unexpected)" || echo "DIFFERENT (good: not cached)"
```

Expected: `level=easy` returns a JSON puzzle; `level=medium` → `400`; `id=nope` → `404`; two `level=easy` calls usually differ (random, uncached). 503 only occurs if a tier has zero puzzles.

- [ ] **Step 4: Run the full kenken test suite**

Run: `bun test src/lib/games/kenken`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/app/api/kenken/puzzle/route.ts
git commit -m "feat(kenken): add GET /api/kenken/puzzle route handler"
```

---

## Final verification

- [ ] **Run the full test suite:** `bun test` — all pass.
- [ ] **Run the full check (final/pre-merge):** `bun run check` — clean + lint + build + audit pass. (Heavy: reinstalls deps. Skip during iteration; run once at the end.)

---

## Spec coverage check (this plan)

Covers from `2026-05-23-kenken-design.md`: §3 difficulty/operation semantics (Task 4 + cage/solver/validate logic), §4 data model + library wrapper + schemaVersion + static JSON import + de-dup + stable ids (Tasks 1, 9, 10), §5 generator incl. seedable RNG + attempt budget + uniqueness verification (Tasks 2,3,5,6,8,9), §5a route handler incl. params, selection, 400/404/503, force-dynamic (Tasks 11,12), §11 generator/solver/validation/route unit tests (Tasks 2–11).

**Deferred to later plans:** game engine state + UI, status bar, notes, undo/redo, hints, timer, mistake-checking, persistence/localStorage, share URLs, `/play` + `/daily` pages (Plan 2); `/brain-boost` placeholder, `kenken_page` Storyblok type + bloks + fallback, accent, nav/footer, sitemap (Plan 3).
