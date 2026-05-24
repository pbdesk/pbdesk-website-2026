# KenKen Game UI (Engine, State, Persistence, Interactive Play) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the playable KenKen game — a pure, unit-tested game engine (state, moves, conflicts, win, hints, auto-clear notes), localStorage persistence, a client puzzle-fetch helper, and the full interactive React UI (grid with dynamic cage borders, cell status bar, number pad, keyboard input, controls, timer with pause, how-to-play overlay, win celebration, level picker) mounted by the `/brain-boost/kenken/play` and `/brain-boost/kenken/daily` pages.

**Architecture:** All game logic lives in framework-free modules under `src/lib/games/kenken/` (pure functions + a pure reducer) so it unit-tests under `bun:test` with no rendering. The React UI lives under `src/components/games/kenken/`: a single client container (`KenKenGame`) owns state via `useReducer(gameReducer)` and wires the engine, persistence, timer, and fetch helper to presentational child components. The `/play` and `/daily` routes are thin server shells (metadata + JSON-LD) that mount the client container. The game consumes the `GET /api/kenken/puzzle` route handler shipped in Plan 1.

**Tech Stack:** Bun (`bun:test`), TypeScript (strict, `@/*` → `src/*`), React 19 (function components, `ref` as prop, `useReducer`, hooks at top level), Next.js 16 App Router (server shells + `"use client"` container), Tailwind CSS 4 with the project's `var(--...)` theme tokens.

**Scope note:** This is plan 2 of 3 for the KenKen build (`docs/superpowers/specs/2026-05-23-kenken-design.md`). Plan 1 (done) delivered the data model, generator, library, and API. Plan 3 delivers the `/brain-boost` placeholder, the `kenken_page` Storyblok content page, nav/footer entries, and the sitemap addition. **This plan creates `src/components/brain-boost/accent.ts`** (the standalone Sunset Pulse constant) because the game UI consumes it; Plan 3 reuses the same file.

**Conventions to follow:**
- Test files sit next to source: `foo.ts` → `foo.test.ts`. Import from `"bun:test"`.
- Run a single test file: `bun test src/lib/games/kenken/<name>.test.ts`.
- Within `src/lib/games/kenken/` use **relative** imports (self-contained). In `src/components/**` and `src/app/**` use the `@/` alias.
- Styling: prefer the project's CSS variables (`var(--fg-primary)`, `var(--bg-subtle)`, `var(--border-subtle)`, etc.) and the `wrapper` utility class, mirroring existing components (`about-hero.tsx`, `disclaimer/page.tsx`). The Brain Boost accent comes from `BRAIN_BOOST_ACCENT` (Task 1), not the pillar tokens.
- Use Next.js `<Image>` for any raster images; semantic HTML + ARIA per project standards.
- After edits run `bun run format` (ultracite) before committing; the pre-commit hook also runs it.
- React components in this project are **not** unit-tested (there is no jsdom/RTL setup). Component tasks are verified by `bun run build` + manual dev-server checks. **Logic modules are fully TDD'd.**

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/components/brain-boost/accent.ts` | Standalone Sunset Pulse accent constant (`BRAIN_BOOST_ACCENT`). |
| `src/lib/games/kenken/runtime-types.ts` | Runtime state types: `CellState`, `GameGrid`, `GameState`, `GameAction`, `InputMode`, `GameStatus`, `BorderWeight`, `CellBorders`. |
| `src/lib/games/kenken/display.ts` | `operationSymbol`, `cageLabel`, `cageLabelCell` (UI-facing formatting of cages/operators). |
| `src/lib/games/kenken/cage-borders.ts` | `buildCellCageMap`, `computeCageBorders` (per-cell thick/thin border calc; handles L-shaped cages). |
| `src/lib/games/kenken/engine.ts` | Pure grid ops: `createEmptyGrid`, `cloneGrid`, `setCellValue` (with auto-clear notes), `toggleCellNote`, `clearCell`, `rowColConflicts`, `cageConflicts`, `isSolved`, `mistakeCells`. |
| `src/lib/games/kenken/reducer.ts` | `createInitialState`, pure `gameReducer(state, action)` driving selection, input, undo/redo, hints, reveal, timer, pause. |
| `src/lib/games/kenken/storage.ts` | Namespaced+versioned localStorage helpers (`bb:kenken:v1:*`): progress save/load/clear, daily, served-ids, last level, how-to-seen. Pure over an injectable `Storage`. |
| `src/lib/games/kenken/puzzle-client.ts` | Client fetch helpers: `fetchPuzzleByLevel`, `fetchPuzzleById`, `resolveDailyPuzzle` (over injectable `fetch` + `Storage`). |
| `src/components/games/kenken/level-picker.tsx` | Tier selection screen. |
| `src/components/games/kenken/cell.tsx` | One grid cell (value, notes, cage label, borders, highlight/conflict state). |
| `src/components/games/kenken/grid.tsx` | The N×N board: lays out cells, applies fit-to-width scaling, owns keyboard handling. |
| `src/components/games/kenken/cell-status-bar.tsx` | Strip above the keypad: selected cell's cage goal/operator, value, notes. |
| `src/components/games/kenken/number-pad.tsx` | On-screen digits 1..N + notes toggle + erase. |
| `src/components/games/kenken/game-controls.tsx` | Undo/redo, rule-check toggle, reveal-mistakes, hint (+count), pause/resume. |
| `src/components/games/kenken/timer.tsx` | Timer display + `useGameTimer` hook (interval tick, auto-pause on tab hidden). |
| `src/components/games/kenken/how-to-play-overlay.tsx` | First-time dismissible rules overlay. |
| `src/components/games/kenken/win-overlay.tsx` | Win celebration: solve time + share + new-game/change-level. |
| `src/components/games/kenken/kenken-game.tsx` | Client container: owns `useReducer`, wires persistence/timer/fetch, renders children. |
| `src/app/(site)/brain-boost/kenken/play/page.tsx` | Server shell for free play (metadata, JSON-LD, mounts `KenKenGame`). |
| `src/app/(site)/brain-boost/kenken/daily/page.tsx` | Server shell for the per-device sticky daily Intermediate puzzle. |

> **Note on `src/app/(site)/brain-boost/`:** the `brain-boost` folder and its `page.tsx` placeholder are created in **Plan 3**. This plan creates the `kenken/play/` and `kenken/daily/` subroutes. Next.js does not require an intermediate `page.tsx` for a route segment to resolve a deeper page, so `/brain-boost/kenken/play` works even before Plan 3 adds `/brain-boost`. Tasks here only create the `play/` and `daily/` page files.

---

## Task 1: Brain Boost accent constant + runtime state types

**Files:**
- Create: `src/components/brain-boost/accent.ts`
- Create: `src/lib/games/kenken/runtime-types.ts`
- Test: `src/lib/games/kenken/runtime-types.test.ts`

- [ ] **Step 1: Write the accent constant**

```ts
// src/components/brain-boost/accent.ts
// Standalone "Sunset Pulse" accent for the Brain Boost section. Brain Boost
// does NOT reuse pillarAccents / PillarKey — this constant is scoped here.
export const BRAIN_BOOST_ACCENT = {
  primary: "#f97316", // sunset orange
  secondary: "#ec4899", // rose
  gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
} as const;
```

- [ ] **Step 2: Write the failing test for runtime types**

```ts
// src/lib/games/kenken/runtime-types.test.ts
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/runtime-types.test.ts`
Expected: FAIL — cannot find module `./runtime-types`.

- [ ] **Step 4: Write the implementation**

```ts
// src/lib/games/kenken/runtime-types.ts
import type { Cell, Difficulty, KenKenPuzzle } from "./types";

export type CellValue = number | null;

export interface CellState {
  value: CellValue;
  notes: number[]; // candidate digits, ascending; empty when none
}

export type GameGrid = CellState[][]; // size × size

export type InputMode = "value" | "note";
export type GameStatus = "playing" | "won";

export const INITIAL_INPUT_MODE: InputMode = "value";

export interface GameState {
  puzzle: KenKenPuzzle;
  grid: GameGrid;
  selected: Cell | null;
  mode: InputMode;
  undoStack: GameGrid[];
  redoStack: GameGrid[];
  hintsUsed: number;
  /** Cells flagged by the last "reveal mistakes" action; cleared on next edit. */
  revealedMistakes: Cell[];
  /** When true, the UI highlights row/col duplicates + cage violations live. */
  ruleCheckOn: boolean;
  elapsedSeconds: number;
  paused: boolean;
  status: GameStatus;
}

export type BorderWeight = "thick" | "thin";

export interface CellBorders {
  top: BorderWeight;
  right: BorderWeight;
  bottom: BorderWeight;
  left: BorderWeight;
}

export type GameAction =
  | { type: "select"; cell: Cell }
  | { type: "move"; dRow: number; dCol: number }
  | { type: "input"; digit: number }
  | { type: "clear" }
  | { type: "setMode"; mode: InputMode }
  | { type: "toggleMode" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "hint" }
  | { type: "revealMistakes" }
  | { type: "toggleRuleCheck" }
  | { type: "tick" }
  | { type: "setPaused"; paused: boolean }
  | { type: "restore"; grid: GameGrid; elapsedSeconds: number; hintsUsed: number };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/runtime-types.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
bun run format
git add src/components/brain-boost/accent.ts src/lib/games/kenken/runtime-types.ts src/lib/games/kenken/runtime-types.test.ts
git commit -m "feat(kenken): add Brain Boost accent + runtime state types"
```

---

## Task 2: Display helpers (operators, cage labels)

**Files:**
- Create: `src/lib/games/kenken/display.ts`
- Test: `src/lib/games/kenken/display.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/games/kenken/display.test.ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { cageLabel, cageLabelCell, operationSymbol } from "./display";
import type { Cage } from "./types";

describe("operationSymbol", () => {
  test("maps ASCII operators to display glyphs", () => {
    expect(operationSymbol("+")).toBe("+");
    expect(operationSymbol("-")).toBe("−"); // minus sign −
    expect(operationSymbol("*")).toBe("×"); // times ×
    expect(operationSymbol("/")).toBe("÷"); // division ÷
  });

  test("single-cell '=' has no operator glyph", () => {
    expect(operationSymbol("=")).toBe("");
  });
});

describe("cageLabel", () => {
  test("multi-cell cage shows target + operator", () => {
    const cage: Cage = { cells: [[0, 0], [0, 1]], op: "*", target: 12 };
    expect(cageLabel(cage)).toBe("12×");
  });

  test("single-cell cage shows just the number", () => {
    const cage: Cage = { cells: [[0, 0]], op: "=", target: 3 };
    expect(cageLabel(cage)).toBe("3");
  });
});

describe("cageLabelCell", () => {
  test("returns the top-left-most cell (min row, then min col)", () => {
    const cage: Cage = {
      cells: [[1, 2], [0, 2], [0, 1]],
      op: "+",
      target: 6,
    };
    expect(cageLabelCell(cage)).toEqual([0, 1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/display.test.ts`
Expected: FAIL — cannot find module `./display`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/display.ts
import type { Cage, Cell, Operation } from "./types";

const OPERATOR_GLYPHS: Record<Operation, string> = {
  "+": "+",
  "-": "−", // −
  "*": "×", // ×
  "/": "÷", // ÷
  "=": "",
};

export function operationSymbol(op: Operation): string {
  return OPERATOR_GLYPHS[op];
}

export function cageLabel(cage: Cage): string {
  if (cage.op === "=") {
    return String(cage.target);
  }
  return `${cage.target}${operationSymbol(cage.op)}`;
}

/** The cell that displays the cage's label: smallest row, then smallest col. */
export function cageLabelCell(cage: Cage): Cell {
  let best = cage.cells[0];
  for (const [r, c] of cage.cells) {
    const [br, bc] = best;
    if (r < br || (r === br && c < bc)) {
      best = [r, c];
    }
  }
  return best;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/display.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/display.ts src/lib/games/kenken/display.test.ts
git commit -m "feat(kenken): add display helpers for operators and cage labels"
```

---

## Task 3: Cage border computation

**Files:**
- Create: `src/lib/games/kenken/cage-borders.ts`
- Test: `src/lib/games/kenken/cage-borders.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/games/kenken/cage-borders.test.ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { buildCellCageMap, computeCageBorders } from "./cage-borders";
import type { Cage } from "./types";

// 3×3 layout:
//  cage A: (0,0)(0,1)  cage B: (0,2)(1,2)  cage C: (1,0)(1,1)(2,0)(2,1)(2,2)... 
// Use a simple, fully-covering partition:
//  A = [[0,0],[0,1]]  (op +)
//  B = [[0,2]]        (op =)
//  C = [[1,0],[2,0]]  (op -)
//  D = [[1,1],[1,2],[2,1],[2,2]] (op *)
const cages: Cage[] = [
  { cells: [[0, 0], [0, 1]], op: "+", target: 3 },
  { cells: [[0, 2]], op: "=", target: 2 },
  { cells: [[1, 0], [2, 0]], op: "-", target: 1 },
  { cells: [[1, 1], [1, 2], [2, 1], [2, 2]], op: "*", target: 24 },
];

describe("buildCellCageMap", () => {
  test("maps each cell to its cage index", () => {
    const map = buildCellCageMap(3, cages);
    expect(map[0][0]).toBe(0);
    expect(map[0][1]).toBe(0);
    expect(map[0][2]).toBe(1);
    expect(map[1][0]).toBe(2);
    expect(map[2][2]).toBe(3);
  });
});

describe("computeCageBorders", () => {
  const borders = computeCageBorders(3, cages);

  test("grid boundary edges are always thick", () => {
    expect(borders[0][0].top).toBe("thick"); // top row boundary
    expect(borders[0][0].left).toBe("thick"); // left col boundary
    expect(borders[2][2].bottom).toBe("thick");
    expect(borders[2][2].right).toBe("thick");
  });

  test("edge between two cells in the SAME cage is thin", () => {
    // (0,0) and (0,1) are both cage A — their shared edge is thin
    expect(borders[0][0].right).toBe("thin");
    expect(borders[0][1].left).toBe("thin");
  });

  test("edge between cells in DIFFERENT cages is thick", () => {
    // (0,1) cage A vs (0,2) cage B
    expect(borders[0][1].right).toBe("thick");
    expect(borders[0][2].left).toBe("thick");
    // (1,1) cage D vs (1,0) cage C
    expect(borders[1][1].left).toBe("thick");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/cage-borders.test.ts`
Expected: FAIL — cannot find module `./cage-borders`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/cage-borders.ts
import type { CellBorders } from "./runtime-types";
import type { Cage } from "./types";

/** map[r][c] = index of the cage that owns cell (r,c). */
export function buildCellCageMap(size: number, cages: Cage[]): number[][] {
  const map: number[][] = Array.from({ length: size }, () =>
    new Array<number>(size).fill(-1)
  );
  for (let i = 0; i < cages.length; i++) {
    for (const [r, c] of cages[i].cells) {
      map[r][c] = i;
    }
  }
  return map;
}

/**
 * For each cell, an edge is "thick" when the neighbour across it belongs to a
 * different cage or lies outside the grid; otherwise "thin". This reproduces
 * KenKen cage outlines for arbitrary (incl. L-shaped) cage shapes.
 */
export function computeCageBorders(
  size: number,
  cages: Cage[]
): CellBorders[][] {
  const map = buildCellCageMap(size, cages);
  const sameCage = (r1: number, c1: number, r2: number, c2: number): boolean => {
    if (r2 < 0 || r2 >= size || c2 < 0 || c2 >= size) {
      return false;
    }
    return map[r1][c1] === map[r2][c2];
  };

  const result: CellBorders[][] = [];
  for (let r = 0; r < size; r++) {
    const row: CellBorders[] = [];
    for (let c = 0; c < size; c++) {
      row.push({
        top: sameCage(r, c, r - 1, c) ? "thin" : "thick",
        right: sameCage(r, c, r, c + 1) ? "thin" : "thick",
        bottom: sameCage(r, c, r + 1, c) ? "thin" : "thick",
        left: sameCage(r, c, r, c - 1) ? "thin" : "thick",
      });
    }
    result.push(row);
  }
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/cage-borders.test.ts`
Expected: PASS (5 assertions across 3 tests).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/cage-borders.ts src/lib/games/kenken/cage-borders.test.ts
git commit -m "feat(kenken): add dynamic cage border computation"
```

---

## Task 4: Engine — grid ops + auto-clear notes

**Files:**
- Create: `src/lib/games/kenken/engine.ts`
- Test: `src/lib/games/kenken/engine.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/games/kenken/engine.test.ts
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
    { cells: [[0, 0], [0, 1], [0, 2]], op: "+", target: 6 },
    { cells: [[1, 0], [1, 1], [1, 2]], op: "+", target: 6 },
    { cells: [[2, 0], [2, 1], [2, 2]], op: "+", target: 6 },
  ];

  test("sets a value and clears the cell's own notes", () => {
    let grid = createEmptyGrid(3);
    grid = toggleCellNote(grid, [0, 0], 2);
    grid = setCellValue(grid, [0, 0], 2, cages);
    expect(grid[0][0]).toEqual({ value: 2, notes: [] });
  });

  test("auto-clears the committed digit from notes in same row, col, and cage", () => {
    let grid = createEmptyGrid(3);
    // seed notes containing digit 2 around (0,0)
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/engine.test.ts`
Expected: FAIL — cannot find module `./engine`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/engine.ts
import type { CellState, CellValue, GameGrid } from "./runtime-types";
import type { Cage, Cell } from "./types";

export function createEmptyGrid(size: number): GameGrid {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, (): CellState => ({ value: null, notes: [] }))
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/engine.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/engine.ts src/lib/games/kenken/engine.test.ts
git commit -m "feat(kenken): add engine grid ops with auto-clear notes"
```

---

## Task 5: Engine — conflicts, win detection, mistakes

**Files:**
- Modify: `src/lib/games/kenken/engine.ts` (append functions)
- Modify: `src/lib/games/kenken/engine.test.ts` (append tests)

These functions take the **filled grid** and the puzzle's cages/solution. Conflicts return a `Set<string>` of `"r,c"` keys so the UI can highlight cells. Cage-conflict logic reuses the same satisfied/violated semantics as the solver/validator (sum/product for `+`/`*`; absolute difference for `-`; integer quotient for `/`).

- [ ] **Step 1: Append the failing tests**

```ts
// append to src/lib/games/kenken/engine.test.ts
import { cageConflicts, isSolved, mistakeCells, rowColConflicts } from "./engine";
import type { GameGrid } from "./runtime-types";

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
    // row 0 has two 1s -> (0,0),(0,1); column 0 has 1,1,3 -> (0,0),(1,0)
    expect(conflicts.has("0,0")).toBe(true);
    expect(conflicts.has("0,1")).toBe(true);
    expect(conflicts.has("1,0")).toBe(true);
    // (2,2)=2 is unique in its row and column
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
    { cells: [[0, 0], [0, 1]], op: "+", target: 3 }, // needs sum 3
    { cells: [[1, 0], [1, 1]], op: "-", target: 1 }, // needs |a-b| = 1
  ];

  test("flags a fully-filled cage that violates its target", () => {
    const grid = gridFromValues([
      [2, 2], // sum 4 != 3 -> conflict
      [1, 2], // |1-2| = 1 -> ok
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
    { cells: [[0, 0], [0, 1]], op: "+", target: 3 },
    { cells: [[1, 0], [1, 1]], op: "+", target: 3 },
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
      [1, 3], // (0,1) wrong
      [null, 1], // (1,0) empty -> not a mistake
    ]);
    const mistakes = mistakeCells(grid, solution);
    expect(mistakes).toContainEqual([0, 1]);
    expect(mistakes).not.toContainEqual([1, 0]);
    expect(mistakes).not.toContainEqual([0, 0]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/engine.test.ts`
Expected: FAIL — `cageConflicts`/`isSolved`/`mistakeCells`/`rowColConflicts` are not exported.

- [ ] **Step 3: Append the implementation to `engine.ts`**

```ts
// append to src/lib/games/kenken/engine.ts
import type { Operation } from "./types";

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

export function isSolved(
  grid: GameGrid,
  size: number,
  cages: Cage[]
): boolean {
  if (!isLatinValid(grid, size)) {
    return false;
  }
  return cageConflicts(grid, cages).size === 0;
}

export function mistakeCells(
  grid: GameGrid,
  solution: number[][]
): Cell[] {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/engine.test.ts`
Expected: PASS (all cases, original + appended).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/engine.ts src/lib/games/kenken/engine.test.ts
git commit -m "feat(kenken): add conflict, win, and mistake detection"
```

---

## Task 6: Pure game reducer

**Files:**
- Create: `src/lib/games/kenken/reducer.ts`
- Test: `src/lib/games/kenken/reducer.test.ts`

The reducer is the single source of truth for state transitions, so the React container stays thin. Selection, input (value/note by mode), clear, undo/redo (snapshot stacks), hint (reveal selected or first-empty cell from `solution`, increment count, push undo), reveal-mistakes, rule-check toggle, timer `tick`, pause, and `restore` all live here. Any **grid-changing** action pushes the prior grid onto `undoStack`, clears `redoStack` and `revealedMistakes`, and recomputes `status` via `isSolved`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/games/kenken/reducer.test.ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { createInitialState, gameReducer } from "./reducer";
import type { KenKenPuzzle } from "./types";

// 2×2 puzzle, solution [[1,2],[2,1]], four singleton cages.
const puzzle: KenKenPuzzle = {
  id: "k2-test-1",
  size: 2,
  difficulty: "easy",
  cages: [
    { cells: [[0, 0]], op: "=", target: 1 },
    { cells: [[0, 1]], op: "=", target: 2 },
    { cells: [[1, 0]], op: "=", target: 2 },
    { cells: [[1, 1]], op: "=", target: 1 },
  ],
  solution: [
    [1, 2],
    [2, 1],
  ],
};

describe("createInitialState", () => {
  test("starts empty, value mode, not paused, playing", () => {
    const s = createInitialState(puzzle);
    expect(s.grid[0][0].value).toBeNull();
    expect(s.mode).toBe("value");
    expect(s.paused).toBe(false);
    expect(s.status).toBe("playing");
    expect(s.hintsUsed).toBe(0);
  });
});

describe("gameReducer input", () => {
  test("value mode sets the selected cell's value", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "select", cell: [0, 0] });
    s = gameReducer(s, { type: "input", digit: 1 });
    expect(s.grid[0][0].value).toBe(1);
  });

  test("note mode toggles a pencil mark", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "select", cell: [0, 0] });
    s = gameReducer(s, { type: "setMode", mode: "note" });
    s = gameReducer(s, { type: "input", digit: 2 });
    expect(s.grid[0][0].notes).toEqual([2]);
    expect(s.grid[0][0].value).toBeNull();
  });

  test("input with no selection is a no-op", () => {
    const s0 = createInitialState(puzzle);
    const s1 = gameReducer(s0, { type: "input", digit: 1 });
    expect(s1.grid[0][0].value).toBeNull();
  });

  test("ignores digits larger than the grid size", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "select", cell: [0, 0] });
    s = gameReducer(s, { type: "input", digit: 3 }); // size is 2
    expect(s.grid[0][0].value).toBeNull();
  });
});

describe("gameReducer undo/redo", () => {
  test("undo reverts the last grid change; redo reapplies it", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "select", cell: [0, 0] });
    s = gameReducer(s, { type: "input", digit: 1 });
    s = gameReducer(s, { type: "undo" });
    expect(s.grid[0][0].value).toBeNull();
    s = gameReducer(s, { type: "redo" });
    expect(s.grid[0][0].value).toBe(1);
  });

  test("undo with empty history is a no-op", () => {
    const s = createInitialState(puzzle);
    expect(gameReducer(s, { type: "undo" })).toEqual(s);
  });
});

describe("gameReducer hint", () => {
  test("fills the selected cell from the solution and counts the hint", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "select", cell: [0, 1] });
    s = gameReducer(s, { type: "hint" });
    expect(s.grid[0][1].value).toBe(2); // solution[0][1]
    expect(s.hintsUsed).toBe(1);
  });
});

describe("gameReducer win", () => {
  test("status becomes 'won' when the final correct value completes the grid", () => {
    let s = createInitialState(puzzle);
    const fills: [number, number, number][] = [
      [0, 0, 1],
      [0, 1, 2],
      [1, 0, 2],
      [1, 1, 1],
    ];
    for (const [r, c, d] of fills) {
      s = gameReducer(s, { type: "select", cell: [r, c] });
      s = gameReducer(s, { type: "input", digit: d });
    }
    expect(s.status).toBe("won");
  });
});

describe("gameReducer timer + pause", () => {
  test("tick increments elapsed only while playing and not paused", () => {
    let s = createInitialState(puzzle);
    s = gameReducer(s, { type: "tick" });
    expect(s.elapsedSeconds).toBe(1);
    s = gameReducer(s, { type: "setPaused", paused: true });
    s = gameReducer(s, { type: "tick" });
    expect(s.elapsedSeconds).toBe(1); // paused -> no increment
  });
});

describe("gameReducer restore", () => {
  test("restores grid, elapsed, and hint count and recomputes status", () => {
    const s0 = createInitialState(puzzle);
    const grid = s0.grid.map((row) => row.map((cell) => ({ ...cell })));
    grid[0][0].value = 1;
    grid[0][1].value = 2;
    grid[1][0].value = 2;
    grid[1][1].value = 1;
    const s1 = gameReducer(s0, {
      type: "restore",
      grid,
      elapsedSeconds: 99,
      hintsUsed: 3,
    });
    expect(s1.elapsedSeconds).toBe(99);
    expect(s1.hintsUsed).toBe(3);
    expect(s1.status).toBe("won");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/reducer.test.ts`
Expected: FAIL — cannot find module `./reducer`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/reducer.ts
import {
  clearCell,
  cloneGrid,
  createEmptyGrid,
  isSolved,
  mistakeCells,
  setCellValue,
  toggleCellNote,
} from "./engine";
import type { GameAction, GameGrid, GameState } from "./runtime-types";
import { INITIAL_INPUT_MODE } from "./runtime-types";
import type { Cell, KenKenPuzzle } from "./types";

export function createInitialState(puzzle: KenKenPuzzle): GameState {
  return {
    puzzle,
    grid: createEmptyGrid(puzzle.size),
    selected: null,
    mode: INITIAL_INPUT_MODE,
    undoStack: [],
    redoStack: [],
    hintsUsed: 0,
    revealedMistakes: [],
    ruleCheckOn: true,
    elapsedSeconds: 0,
    paused: false,
    status: "playing",
  };
}

// Apply a grid mutation with undo bookkeeping + win recompute.
function commitGrid(state: GameState, nextGrid: GameGrid): GameState {
  const status = isSolved(nextGrid, state.puzzle.size, state.puzzle.cages)
    ? "won"
    : "playing";
  return {
    ...state,
    grid: nextGrid,
    undoStack: [...state.undoStack, state.grid],
    redoStack: [],
    revealedMistakes: [],
    status,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function applyInput(state: GameState, digit: number): GameState {
  if (!state.selected || digit < 1 || digit > state.puzzle.size) {
    return state;
  }
  const next =
    state.mode === "note"
      ? toggleCellNote(state.grid, state.selected, digit)
      : setCellValue(state.grid, state.selected, digit, state.puzzle.cages);
  return commitGrid(state, next);
}

function applyHint(state: GameState): GameState {
  const target = state.selected ?? firstEmptyCell(state);
  if (!target) {
    return state;
  }
  const [r, c] = target;
  const correct = state.puzzle.solution[r][c];
  const next = setCellValue(state.grid, target, correct, state.puzzle.cages);
  return {
    ...commitGrid(state, next),
    selected: target,
    hintsUsed: state.hintsUsed + 1,
  };
}

function firstEmptyCell(state: GameState): Cell | null {
  for (let r = 0; r < state.puzzle.size; r++) {
    for (let c = 0; c < state.puzzle.size; c++) {
      if (state.grid[r][c].value === null) {
        return [r, c];
      }
    }
  }
  return null;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "select":
      return { ...state, selected: action.cell };
    case "move": {
      const [r, c] = state.selected ?? [0, 0];
      const size = state.puzzle.size;
      return {
        ...state,
        selected: [
          clamp(r + action.dRow, 0, size - 1),
          clamp(c + action.dCol, 0, size - 1),
        ],
      };
    }
    case "input":
      return applyInput(state, action.digit);
    case "clear":
      return state.selected
        ? commitGrid(state, clearCell(state.grid, state.selected))
        : state;
    case "setMode":
      return { ...state, mode: action.mode };
    case "toggleMode":
      return { ...state, mode: state.mode === "value" ? "note" : "value" };
    case "undo": {
      if (state.undoStack.length === 0) {
        return state;
      }
      const prev = state.undoStack.at(-1) as GameGrid;
      return {
        ...state,
        grid: prev,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.grid],
        revealedMistakes: [],
        status: isSolved(prev, state.puzzle.size, state.puzzle.cages)
          ? "won"
          : "playing",
      };
    }
    case "redo": {
      if (state.redoStack.length === 0) {
        return state;
      }
      const next = state.redoStack.at(-1) as GameGrid;
      return {
        ...state,
        grid: next,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state.grid],
        revealedMistakes: [],
        status: isSolved(next, state.puzzle.size, state.puzzle.cages)
          ? "won"
          : "playing",
      };
    }
    case "hint":
      return applyHint(state);
    case "revealMistakes":
      return {
        ...state,
        revealedMistakes: mistakeCells(state.grid, state.puzzle.solution),
      };
    case "toggleRuleCheck":
      return { ...state, ruleCheckOn: !state.ruleCheckOn };
    case "tick":
      return state.paused || state.status === "won"
        ? state
        : { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    case "setPaused":
      return { ...state, paused: action.paused };
    case "restore": {
      const grid = cloneGrid(action.grid);
      return {
        ...state,
        grid,
        elapsedSeconds: action.elapsedSeconds,
        hintsUsed: action.hintsUsed,
        undoStack: [],
        redoStack: [],
        revealedMistakes: [],
        status: isSolved(grid, state.puzzle.size, state.puzzle.cages)
          ? "won"
          : "playing",
      };
    }
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/reducer.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/reducer.ts src/lib/games/kenken/reducer.test.ts
git commit -m "feat(kenken): add pure game reducer"
```

---

## Task 7: localStorage persistence

**Files:**
- Create: `src/lib/games/kenken/storage.ts`
- Test: `src/lib/games/kenken/storage.test.ts`

All functions accept an injectable `Storage` (defaulting to `globalThis.localStorage`) so they unit-test without a browser. Keys are namespaced + versioned (`bb:kenken:v1:*`). Reads tolerate missing/corrupt entries (treat as absent). Progress is serialized as compact value/notes arrays keyed by puzzle id; only the **active** puzzle's progress is retained (saving a new puzzle's progress overwrites the slot).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/games/kenken/storage.test.ts
/// <reference types="bun-types" />
import { beforeEach, describe, expect, test } from "bun:test";
import { createEmptyGrid, setCellValue } from "./engine";
import {
  addServedId,
  clearProgress,
  getDaily,
  getHowToSeen,
  getLastLevel,
  getServedIds,
  loadProgress,
  saveProgress,
  setDaily,
  setHowToSeen,
  setLastLevel,
} from "./storage";

// Minimal in-memory Storage stand-in.
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => map.delete(k),
    setItem: (k, v) => {
      map.set(k, v);
    },
  } satisfies Storage;
}

let store: Storage;
beforeEach(() => {
  store = memoryStorage();
});

describe("progress", () => {
  test("round-trips grid, elapsed, and hint count by puzzle id", () => {
    let grid = createEmptyGrid(3);
    grid = setCellValue(grid, [0, 0], 2, []);
    saveProgress(
      { puzzleId: "k3-easy-1", grid, elapsedSeconds: 30, hintsUsed: 1 },
      store
    );
    const loaded = loadProgress("k3-easy-1", store);
    expect(loaded?.elapsedSeconds).toBe(30);
    expect(loaded?.hintsUsed).toBe(1);
    expect(loaded?.grid[0][0].value).toBe(2);
  });

  test("loadProgress returns null for a different id or corrupt data", () => {
    saveProgress(
      { puzzleId: "a", grid: createEmptyGrid(2), elapsedSeconds: 0, hintsUsed: 0 },
      store
    );
    expect(loadProgress("b", store)).toBeNull();
  });

  test("saving a new puzzle's progress replaces the previous slot", () => {
    saveProgress(
      { puzzleId: "a", grid: createEmptyGrid(2), elapsedSeconds: 1, hintsUsed: 0 },
      store
    );
    saveProgress(
      { puzzleId: "b", grid: createEmptyGrid(2), elapsedSeconds: 2, hintsUsed: 0 },
      store
    );
    expect(loadProgress("a", store)).toBeNull();
    expect(loadProgress("b", store)?.elapsedSeconds).toBe(2);
  });

  test("clearProgress removes the slot", () => {
    saveProgress(
      { puzzleId: "a", grid: createEmptyGrid(2), elapsedSeconds: 1, hintsUsed: 0 },
      store
    );
    clearProgress(store);
    expect(loadProgress("a", store)).toBeNull();
  });
});

describe("daily", () => {
  test("stores and reads { date, puzzleId }", () => {
    setDaily({ date: "2026-05-24", puzzleId: "k4-intermediate-3" }, store);
    expect(getDaily(store)).toEqual({
      date: "2026-05-24",
      puzzleId: "k4-intermediate-3",
    });
  });

  test("getDaily returns null when unset", () => {
    expect(getDaily(store)).toBeNull();
  });
});

describe("served ids", () => {
  test("accumulates per level without duplicates", () => {
    addServedId("easy", "a", store);
    addServedId("easy", "a", store);
    addServedId("easy", "b", store);
    addServedId("hard", "z", store);
    expect(getServedIds("easy", store).sort()).toEqual(["a", "b"]);
    expect(getServedIds("hard", store)).toEqual(["z"]);
  });

  test("getServedIds returns [] for an untouched level", () => {
    expect(getServedIds("genius", store)).toEqual([]);
  });
});

describe("last level + how-to-seen", () => {
  test("last level round-trips, defaults null", () => {
    expect(getLastLevel(store)).toBeNull();
    setLastLevel("hard", store);
    expect(getLastLevel(store)).toBe("hard");
  });

  test("how-to-seen flag round-trips, defaults false", () => {
    expect(getHowToSeen(store)).toBe(false);
    setHowToSeen(store);
    expect(getHowToSeen(store)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/storage.test.ts`
Expected: FAIL — cannot find module `./storage`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/storage.ts
import { cloneGrid } from "./engine";
import type { GameGrid } from "./runtime-types";
import type { Difficulty } from "./types";

const NS = "bb:kenken:v1";
const PROGRESS_KEY = `${NS}:progress`;
const DAILY_KEY = `${NS}:daily`;
const LAST_LEVEL_KEY = `${NS}:lastLevel`;
const HOWTO_KEY = `${NS}:howtoSeen`;
const servedKey = (level: Difficulty): string => `${NS}:served:${level}`;

function getStore(provided?: Storage): Storage | null {
  if (provided) {
    return provided;
  }
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readJson<T>(store: Storage | null, key: string): T | null {
  if (!store) {
    return null;
  }
  const raw = store.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(store: Storage | null, key: string, value: unknown): void {
  if (!store) {
    return;
  }
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or serialization failure: persistence is best-effort.
  }
}

export interface ProgressRecord {
  puzzleId: string;
  grid: GameGrid;
  elapsedSeconds: number;
  hintsUsed: number;
}

export function saveProgress(record: ProgressRecord, store?: Storage): void {
  writeJson(getStore(store), PROGRESS_KEY, {
    puzzleId: record.puzzleId,
    grid: record.grid,
    elapsedSeconds: record.elapsedSeconds,
    hintsUsed: record.hintsUsed,
  });
}

export function loadProgress(
  puzzleId: string,
  store?: Storage
): ProgressRecord | null {
  const data = readJson<ProgressRecord>(getStore(store), PROGRESS_KEY);
  if (!data || data.puzzleId !== puzzleId || !Array.isArray(data.grid)) {
    return null;
  }
  return {
    puzzleId: data.puzzleId,
    grid: cloneGrid(data.grid as GameGrid),
    elapsedSeconds: Number(data.elapsedSeconds) || 0,
    hintsUsed: Number(data.hintsUsed) || 0,
  };
}

export function clearProgress(store?: Storage): void {
  getStore(store)?.removeItem(PROGRESS_KEY);
}

export interface DailyRecord {
  date: string;
  puzzleId: string;
}

export function setDaily(record: DailyRecord, store?: Storage): void {
  writeJson(getStore(store), DAILY_KEY, record);
}

export function getDaily(store?: Storage): DailyRecord | null {
  const data = readJson<DailyRecord>(getStore(store), DAILY_KEY);
  if (!data || typeof data.date !== "string" || typeof data.puzzleId !== "string") {
    return null;
  }
  return data;
}

export function getServedIds(level: Difficulty, store?: Storage): string[] {
  const data = readJson<string[]>(getStore(store), servedKey(level));
  return Array.isArray(data) ? data.filter((x) => typeof x === "string") : [];
}

export function addServedId(
  level: Difficulty,
  id: string,
  store?: Storage
): void {
  const set = new Set(getServedIds(level, store));
  set.add(id);
  writeJson(getStore(store), servedKey(level), [...set]);
}

export function getLastLevel(store?: Storage): Difficulty | null {
  const value = getStore(store)?.getItem(LAST_LEVEL_KEY);
  return value === "easy" ||
    value === "intermediate" ||
    value === "hard" ||
    value === "genius"
    ? value
    : null;
}

export function setLastLevel(level: Difficulty, store?: Storage): void {
  getStore(store)?.setItem(LAST_LEVEL_KEY, level);
}

export function getHowToSeen(store?: Storage): boolean {
  return getStore(store)?.getItem(HOWTO_KEY) === "1";
}

export function setHowToSeen(store?: Storage): void {
  getStore(store)?.setItem(HOWTO_KEY, "1");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/storage.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/storage.ts src/lib/games/kenken/storage.test.ts
git commit -m "feat(kenken): add namespaced localStorage persistence"
```

---

## Task 8: Client puzzle-fetch helper

**Files:**
- Create: `src/lib/games/kenken/puzzle-client.ts`
- Test: `src/lib/games/kenken/puzzle-client.test.ts`

Thin client over `GET /api/kenken/puzzle`. All functions accept an injectable `fetch` (defaulting to `globalThis.fetch`) and, for daily, an injectable `Storage`. `fetchPuzzleById` returns `null` on 404. `resolveDailyPuzzle` checks today's stored daily and reuses it (by id) when the date matches; otherwise fetches a random Intermediate puzzle and stores `{ today, id }`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/games/kenken/puzzle-client.test.ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import {
  fetchPuzzleById,
  fetchPuzzleByLevel,
  resolveDailyPuzzle,
} from "./puzzle-client";
import { getDaily, setDaily } from "./storage";
import type { KenKenPuzzle } from "./types";

function puzzle(id: string): KenKenPuzzle {
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => map.delete(k),
    setItem: (k, v) => {
      map.set(k, v);
    },
  } satisfies Storage;
}

describe("fetchPuzzleByLevel", () => {
  test("requests the level + exclude params and returns the puzzle", async () => {
    let seenUrl = "";
    const fakeFetch: typeof fetch = (input) => {
      seenUrl = String(input);
      return Promise.resolve(jsonResponse(puzzle("k3-easy-1")));
    };
    const result = await fetchPuzzleByLevel("easy", ["x", "y"], fakeFetch);
    expect(result.id).toBe("k3-easy-1");
    expect(seenUrl).toContain("level=easy");
    expect(seenUrl).toContain("exclude=x%2Cy");
  });

  test("throws on a non-OK response", async () => {
    const fakeFetch: typeof fetch = () =>
      Promise.resolve(jsonResponse({ error: "no puzzles available" }, 503));
    await expect(fetchPuzzleByLevel("easy", [], fakeFetch)).rejects.toThrow();
  });
});

describe("fetchPuzzleById", () => {
  test("returns the puzzle on 200", async () => {
    const fakeFetch: typeof fetch = () =>
      Promise.resolve(jsonResponse(puzzle("k3-easy-7")));
    expect((await fetchPuzzleById("k3-easy-7", fakeFetch))?.id).toBe(
      "k3-easy-7"
    );
  });

  test("returns null on 404", async () => {
    const fakeFetch: typeof fetch = () =>
      Promise.resolve(jsonResponse({ error: "puzzle not found" }, 404));
    expect(await fetchPuzzleById("nope", fakeFetch)).toBeNull();
  });
});

describe("resolveDailyPuzzle", () => {
  test("fetches intermediate and stores today's daily on first visit", async () => {
    const store = memoryStorage();
    const fakeFetch: typeof fetch = () =>
      Promise.resolve(jsonResponse(puzzle("k4-intermediate-2")));
    const result = await resolveDailyPuzzle("2026-05-24", fakeFetch, store);
    expect(result.id).toBe("k4-intermediate-2");
    expect(getDaily(store)).toEqual({
      date: "2026-05-24",
      puzzleId: "k4-intermediate-2",
    });
  });

  test("reuses the stored puzzle id when the date matches", async () => {
    const store = memoryStorage();
    setDaily({ date: "2026-05-24", puzzleId: "k4-intermediate-9" }, store);
    let seenUrl = "";
    const fakeFetch: typeof fetch = (input) => {
      seenUrl = String(input);
      return Promise.resolve(jsonResponse(puzzle("k4-intermediate-9")));
    };
    const result = await resolveDailyPuzzle("2026-05-24", fakeFetch, store);
    expect(result.id).toBe("k4-intermediate-9");
    expect(seenUrl).toContain("id=k4-intermediate-9");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/games/kenken/puzzle-client.test.ts`
Expected: FAIL — cannot find module `./puzzle-client`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/games/kenken/puzzle-client.ts
import { getDaily, setDaily } from "./storage";
import type { Difficulty, KenKenPuzzle } from "./types";

const ENDPOINT = "/api/kenken/puzzle";

function resolveFetch(provided?: typeof fetch): typeof fetch {
  const f = provided ?? globalThis.fetch;
  if (!f) {
    throw new Error("fetch is not available in this environment");
  }
  return f;
}

export async function fetchPuzzleByLevel(
  level: Difficulty,
  exclude: string[],
  fetchImpl?: typeof fetch
): Promise<KenKenPuzzle> {
  const params = new URLSearchParams({ level });
  if (exclude.length > 0) {
    params.set("exclude", exclude.join(","));
  }
  const response = await resolveFetch(fetchImpl)(`${ENDPOINT}?${params}`);
  if (!response.ok) {
    throw new Error(`puzzle fetch failed: ${response.status}`);
  }
  return (await response.json()) as KenKenPuzzle;
}

export async function fetchPuzzleById(
  id: string,
  fetchImpl?: typeof fetch
): Promise<KenKenPuzzle | null> {
  const params = new URLSearchParams({ id });
  const response = await resolveFetch(fetchImpl)(`${ENDPOINT}?${params}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`puzzle fetch failed: ${response.status}`);
  }
  return (await response.json()) as KenKenPuzzle;
}

/**
 * Per-device sticky daily: reuse today's stored Intermediate puzzle if the
 * date matches, else fetch a fresh one and persist { date, id }.
 */
export async function resolveDailyPuzzle(
  today: string,
  fetchImpl?: typeof fetch,
  store?: Storage
): Promise<KenKenPuzzle> {
  const stored = getDaily(store);
  if (stored && stored.date === today) {
    const existing = await fetchPuzzleById(stored.puzzleId, fetchImpl);
    if (existing) {
      return existing;
    }
  }
  const fresh = await fetchPuzzleByLevel("intermediate", [], fetchImpl);
  setDaily({ date: today, puzzleId: fresh.id }, store);
  return fresh;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/games/kenken/puzzle-client.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/lib/games/kenken/puzzle-client.ts src/lib/games/kenken/puzzle-client.test.ts
git commit -m "feat(kenken): add client puzzle-fetch helper"
```

---

## Task 9: Level picker component

**Files:**
- Create: `src/components/games/kenken/level-picker.tsx`

Presentational tier selector. No unit test (UI); verified at build + when wired into the container (Task 16). Uses `DIFFICULTIES`/`TIERS` from Plan 1 and the Sunset Pulse accent. Pre-selects `initialLevel`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/games/kenken/level-picker.tsx
"use client";

import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import { DIFFICULTIES, TIERS } from "@/lib/games/kenken/difficulty";
import type { Difficulty } from "@/lib/games/kenken/types";

const LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  intermediate: "Intermediate",
  hard: "Hard",
  genius: "Genius",
};

function sizesLabel(level: Difficulty): string {
  const sizes = [...new Set(TIERS[level].variants.map((v) => v.size))].sort(
    (a, b) => a - b
  );
  return sizes.map((s) => `${s}×${s}`).join(" · ");
}

interface LevelPickerProps {
  initialLevel?: Difficulty | null;
  onSelect: (level: Difficulty) => void;
}

export default function LevelPicker({
  initialLevel,
  onSelect,
}: LevelPickerProps) {
  return (
    <section className="wrapper py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1
          className="mb-3 font-bold text-[var(--fg-primary)]"
          style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em" }}
        >
          Choose your level
        </h1>
        <p className="mb-10 text-[var(--fg-secondary)]">
          Pick a difficulty to start a fresh KenKen puzzle.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {DIFFICULTIES.map((level) => {
            const isLast = level === initialLevel;
            return (
              <li key={level}>
                <button
                  className="w-full rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5"
                  onClick={() => onSelect(level)}
                  style={{
                    borderColor: isLast
                      ? BRAIN_BOOST_ACCENT.primary
                      : "var(--border-strong)",
                    background: "var(--bg-subtle)",
                  }}
                  type="button"
                >
                  <span
                    className="block font-semibold text-lg"
                    style={{ color: "var(--fg-primary)" }}
                  >
                    {LABELS[level]}
                    {isLast ? (
                      <span
                        className="ml-2 align-middle text-xs"
                        style={{ color: BRAIN_BOOST_ACCENT.primary }}
                      >
                        last played
                      </span>
                    ) : null}
                  </span>
                  <span
                    className="mt-1 block text-sm"
                    style={{ color: "var(--fg-secondary)" }}
                  >
                    {sizesLabel(level)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `bun run build`
Expected: build succeeds (component compiles; it is not yet imported by a route, which is fine — Next tree-shakes unused client components, but the type-check still covers it via the project tsconfig).

> If the build does not type-check unreferenced files, defer the build check to Task 16 where the container imports this component. Either way, run `bunx tsc --noEmit` is **not** part of this project; rely on `bun run build` at the integration tasks.

- [ ] **Step 3: Commit**

```bash
bun run format
git add src/components/games/kenken/level-picker.tsx
git commit -m "feat(kenken): add level picker component"
```

---

## Task 10: Cell + grid components (with cage borders, keyboard)

**Files:**
- Create: `src/components/games/kenken/cell.tsx`
- Create: `src/components/games/kenken/grid.tsx`

Presentational board. The `Cell` renders value or notes (notes hidden when `hideNotes` is true for large grids), the cage label on the label cell, dynamic borders, and selection/conflict/highlight styling. The `Grid` lays cells out in a CSS grid that **shrinks to fit width** (cells sized via `min()` so an 8×8/9×9 board never overflows), wires arrow-key/digit/backspace handling, and exposes selection through callbacks. No unit test (UI).

- [ ] **Step 1: Write the cell component**

```tsx
// src/components/games/kenken/cell.tsx
"use client";

import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import type { CellBorders, CellState } from "@/lib/games/kenken/runtime-types";

const THICK = "2.5px";
const THIN = "1px";

function borderValue(weight: "thick" | "thin"): string {
  const width = weight === "thick" ? THICK : THIN;
  const color =
    weight === "thick" ? "var(--fg-primary)" : "var(--border-subtle)";
  return `${width} solid ${color}`;
}

interface CellProps {
  state: CellState;
  borders: CellBorders;
  label: string | null;
  selected: boolean;
  conflict: boolean;
  mistake: boolean;
  sameValueHighlight: boolean;
  peerHighlight: boolean;
  hideNotes: boolean;
  onSelect: () => void;
}

export default function Cell({
  state,
  borders,
  label,
  selected,
  conflict,
  mistake,
  sameValueHighlight,
  peerHighlight,
  hideNotes,
  onSelect,
}: CellProps) {
  let background = "var(--bg-page)";
  if (peerHighlight) {
    background = "var(--bg-subtle)";
  }
  if (sameValueHighlight) {
    background = "color-mix(in srgb, var(--fg-brand) 12%, transparent)";
  }
  if (selected) {
    background = `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 22%, transparent)`;
  }

  let valueColor = "var(--fg-primary)";
  if (conflict || mistake) {
    valueColor = "#dc2626"; // red-600 — color is not the sole signal (also ring)
  }

  return (
    <button
      aria-label={
        label
          ? `Cell, cage ${label}${state.value ? `, value ${state.value}` : ", empty"}`
          : `Cell${state.value ? `, value ${state.value}` : ", empty"}`
      }
      aria-pressed={selected}
      className="relative flex aspect-square items-center justify-center"
      onClick={onSelect}
      style={{
        background,
        borderTop: borderValue(borders.top),
        borderRight: borderValue(borders.right),
        borderBottom: borderValue(borders.bottom),
        borderLeft: borderValue(borders.left),
        outline:
          conflict || mistake ? "2px solid #dc2626" : "none",
        outlineOffset: "-2px",
      }}
      type="button"
    >
      {label ? (
        <span
          className="absolute top-0.5 left-1 font-semibold leading-none"
          style={{ fontSize: "min(2.6vw, 0.7rem)", color: "var(--fg-secondary)" }}
        >
          {label}
        </span>
      ) : null}

      {state.value !== null ? (
        <span
          className="font-semibold"
          style={{ fontSize: "min(6vw, 1.5rem)", color: valueColor }}
        >
          {state.value}
        </span>
      ) : null}

      {state.value === null && !hideNotes && state.notes.length > 0 ? (
        <span
          className="absolute inset-0 grid grid-cols-3 place-items-center p-0.5"
          style={{ fontSize: "min(2.4vw, 0.6rem)", color: "var(--fg-muted)" }}
        >
          {state.notes.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </span>
      ) : null}
    </button>
  );
}
```

- [ ] **Step 2: Write the grid component**

```tsx
// src/components/games/kenken/grid.tsx
"use client";

import { useMemo } from "react";
import { computeCageBorders } from "@/lib/games/kenken/cage-borders";
import { cageLabel, cageLabelCell } from "@/lib/games/kenken/display";
import {
  cageConflicts,
  mistakeCells,
  rowColConflicts,
} from "@/lib/games/kenken/engine";
import type { GameState } from "@/lib/games/kenken/runtime-types";
import type { Cell as CellPos } from "@/lib/games/kenken/types";
import Cell from "./cell";

const LARGE_GRID_THRESHOLD = 8; // hide in-cell notes at 8×8 and up

interface GridProps {
  state: GameState;
  onSelect: (cell: CellPos) => void;
  onKeyAction: (event: React.KeyboardEvent) => void;
}

export default function Grid({ state, onSelect, onKeyAction }: GridProps) {
  const { puzzle, grid, selected, revealedMistakes, ruleCheckOn } = state;
  const size = puzzle.size;

  const borders = useMemo(
    () => computeCageBorders(size, puzzle.cages),
    [size, puzzle.cages]
  );

  // Map each cell to the cage label it should show (only on the label cell).
  const labelByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const cage of puzzle.cages) {
      const [lr, lc] = cageLabelCell(cage);
      map.set(`${lr},${lc}`, cageLabel(cage));
    }
    return map;
  }, [puzzle.cages]);

  const conflicts = useMemo(() => {
    if (!ruleCheckOn) {
      return new Set<string>();
    }
    const set = rowColConflicts(grid);
    for (const k of cageConflicts(grid, puzzle.cages)) {
      set.add(k);
    }
    return set;
  }, [grid, puzzle.cages, ruleCheckOn]);

  const mistakeKeys = useMemo(
    () => new Set(revealedMistakes.map(([r, c]) => `${r},${c}`)),
    [revealedMistakes]
  );

  const selectedValue =
    selected && grid[selected[0]][selected[1]].value !== null
      ? grid[selected[0]][selected[1]].value
      : null;

  const peerKeys = useMemo(() => {
    if (!selected) {
      return new Set<string>();
    }
    const [sr, sc] = selected;
    const set = new Set<string>();
    for (let i = 0; i < size; i++) {
      set.add(`${sr},${i}`);
      set.add(`${i},${sc}`);
    }
    const cage = puzzle.cages.find((cg) =>
      cg.cells.some(([r, c]) => r === sr && c === sc)
    );
    if (cage) {
      for (const [r, c] of cage.cells) {
        set.add(`${r},${c}`);
      }
    }
    return set;
  }, [selected, size, puzzle.cages]);

  const hideNotes = size >= LARGE_GRID_THRESHOLD;

  return (
    // biome-ignore lint/a11y/useSemanticElements: grid role models the board for AT
    <div
      aria-label={`KenKen ${size} by ${size} grid`}
      className="mx-auto w-full max-w-[min(92vw,32rem)] select-none"
      onKeyDown={onKeyAction}
      role="grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${size}, 1fr)`,
      }}
      tabIndex={0}
    >
      {grid.map((row, r) =>
        row.map((cellState, c) => {
          const k = `${r},${c}`;
          return (
            <Cell
              borders={borders[r][c]}
              conflict={conflicts.has(k)}
              hideNotes={hideNotes}
              key={k}
              label={labelByKey.get(k) ?? null}
              mistake={mistakeKeys.has(k)}
              onSelect={() => onSelect([r, c])}
              peerHighlight={peerKeys.has(k)}
              sameValueHighlight={
                selectedValue !== null &&
                cellState.value === selectedValue &&
                !(selected?.[0] === r && selected?.[1] === c)
              }
              selected={selected?.[0] === r && selected?.[1] === c}
              state={cellState}
            />
          );
        })
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
bun run format
git add src/components/games/kenken/cell.tsx src/components/games/kenken/grid.tsx
git commit -m "feat(kenken): add cell and grid board components"
```

---

## Task 11: Cell status bar

**Files:**
- Create: `src/components/games/kenken/cell-status-bar.tsx`

Strip above the keypad showing the selected cell's cage goal/operator, value, and pencil marks (carrying notes for large grids where in-cell marks are hidden). No unit test (UI).

- [ ] **Step 1: Write the component**

```tsx
// src/components/games/kenken/cell-status-bar.tsx
"use client";

import { cageLabel } from "@/lib/games/kenken/display";
import type { GameState } from "@/lib/games/kenken/runtime-types";

interface CellStatusBarProps {
  state: GameState;
}

export default function CellStatusBar({ state }: CellStatusBarProps) {
  const { selected, grid, puzzle } = state;

  if (!selected) {
    return (
      <div
        className="flex min-h-12 items-center justify-center rounded-xl px-4 text-sm"
        style={{ background: "var(--bg-subtle)", color: "var(--fg-muted)" }}
      >
        Select a cell to begin
      </div>
    );
  }

  const [r, c] = selected;
  const cell = grid[r][c];
  const cage = puzzle.cages.find((cg) =>
    cg.cells.some(([cr, cc]) => cr === r && cc === c)
  );

  return (
    <div
      className="flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-2"
      style={{ background: "var(--bg-subtle)" }}
    >
      <span className="font-semibold text-sm" style={{ color: "var(--fg-secondary)" }}>
        Cage:{" "}
        <span style={{ color: "var(--fg-primary)" }}>
          {cage ? cageLabel(cage) : "—"}
        </span>
      </span>
      <span className="text-sm" style={{ color: "var(--fg-secondary)" }}>
        Value:{" "}
        <span className="font-semibold" style={{ color: "var(--fg-primary)" }}>
          {cell.value ?? "—"}
        </span>
      </span>
      <span className="text-sm" style={{ color: "var(--fg-secondary)" }}>
        Notes:{" "}
        <span className="font-semibold" style={{ color: "var(--fg-primary)" }}>
          {cell.notes.length > 0 ? cell.notes.join(" ") : "—"}
        </span>
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
bun run format
git add src/components/games/kenken/cell-status-bar.tsx
git commit -m "feat(kenken): add cell status bar"
```

---

## Task 12: Number pad

**Files:**
- Create: `src/components/games/kenken/number-pad.tsx`

On-screen digits `1..size`, a notes-mode toggle, and an erase button. No unit test (UI).

- [ ] **Step 1: Write the component**

```tsx
// src/components/games/kenken/number-pad.tsx
"use client";

import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import type { InputMode } from "@/lib/games/kenken/runtime-types";

interface NumberPadProps {
  size: number;
  mode: InputMode;
  onDigit: (digit: number) => void;
  onToggleMode: () => void;
  onErase: () => void;
}

export default function NumberPad({
  size,
  mode,
  onDigit,
  onToggleMode,
  onErase,
}: NumberPadProps) {
  const digits = Array.from({ length: size }, (_, i) => i + 1);
  const noteMode = mode === "note";

  return (
    <div className="flex flex-col gap-3">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(size, 5)}, minmax(0, 1fr))`,
        }}
      >
        {digits.map((d) => (
          <button
            className="flex h-12 items-center justify-center rounded-lg border font-semibold text-lg transition-colors"
            key={d}
            onClick={() => onDigit(d)}
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--bg-page)",
              color: "var(--fg-primary)",
            }}
            type="button"
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          aria-pressed={noteMode}
          className="flex h-11 flex-1 items-center justify-center rounded-lg border font-medium text-sm transition-colors"
          onClick={onToggleMode}
          style={{
            borderColor: noteMode
              ? BRAIN_BOOST_ACCENT.primary
              : "var(--border-strong)",
            background: noteMode
              ? `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 14%, transparent)`
              : "var(--bg-page)",
            color: "var(--fg-primary)",
          }}
          type="button"
        >
          {noteMode ? "Notes: on" : "Notes: off"}
        </button>
        <button
          className="flex h-11 flex-1 items-center justify-center rounded-lg border font-medium text-sm transition-colors"
          onClick={onErase}
          style={{
            borderColor: "var(--border-strong)",
            background: "var(--bg-page)",
            color: "var(--fg-primary)",
          }}
          type="button"
        >
          Erase
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
bun run format
git add src/components/games/kenken/number-pad.tsx
git commit -m "feat(kenken): add number pad"
```

---

## Task 13: Game controls

**Files:**
- Create: `src/components/games/kenken/game-controls.tsx`

Undo/redo, rule-check toggle, reveal-mistakes, hint (with used-count), and pause/resume. No unit test (UI).

- [ ] **Step 1: Write the component**

```tsx
// src/components/games/kenken/game-controls.tsx
"use client";

interface GameControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  ruleCheckOn: boolean;
  hintsUsed: number;
  paused: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleRuleCheck: () => void;
  onRevealMistakes: () => void;
  onHint: () => void;
  onTogglePause: () => void;
}

function ControlButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="rounded-lg border px-3 py-2 font-medium text-sm transition-colors disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      style={{
        borderColor: "var(--border-strong)",
        background: "var(--bg-page)",
        color: "var(--fg-primary)",
      }}
      type="button"
    >
      {label}
    </button>
  );
}

export default function GameControls({
  canUndo,
  canRedo,
  ruleCheckOn,
  hintsUsed,
  paused,
  onUndo,
  onRedo,
  onToggleRuleCheck,
  onRevealMistakes,
  onHint,
  onTogglePause,
}: GameControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ControlButton disabled={!canUndo} label="Undo" onClick={onUndo} />
      <ControlButton disabled={!canRedo} label="Redo" onClick={onRedo} />
      <ControlButton
        label={ruleCheckOn ? "Rule check: on" : "Rule check: off"}
        onClick={onToggleRuleCheck}
      />
      <ControlButton label="Reveal mistakes" onClick={onRevealMistakes} />
      <ControlButton label={`Hint (${hintsUsed})`} onClick={onHint} />
      <ControlButton label={paused ? "Resume" : "Pause"} onClick={onTogglePause} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
bun run format
git add src/components/games/kenken/game-controls.tsx
git commit -m "feat(kenken): add game controls"
```

---

## Task 14: Timer (display + hook)

**Files:**
- Create: `src/components/games/kenken/timer.tsx`

A `formatDuration` pure helper (TDD-able), a `useGameTimer` hook that ticks every second while playing + not paused and auto-pauses on `visibilitychange` (tab hidden), and a small display. Because this file mixes a pure helper with a hook, we test only the pure helper.

- [ ] **Step 1: Write the failing test for the formatter**

Create `src/components/games/kenken/timer.test.ts`:

```ts
// src/components/games/kenken/timer.test.ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { formatDuration } from "./timer";

describe("formatDuration", () => {
  test("formats seconds as M:SS", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(9)).toBe("0:09");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(600)).toBe("10:00");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/components/games/kenken/timer.test.ts`
Expected: FAIL — cannot find module `./timer`.

- [ ] **Step 3: Write the component + hook + helper**

```tsx
// src/components/games/kenken/timer.tsx
"use client";

import { useEffect } from "react";

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface UseGameTimerArgs {
  running: boolean; // playing && !paused
  onTick: () => void;
  onAutoPause: () => void;
}

export function useGameTimer({
  running,
  onTick,
  onAutoPause,
}: UseGameTimerArgs): void {
  useEffect(() => {
    if (!running) {
      return;
    }
    const id = setInterval(onTick, 1000);
    return () => clearInterval(id);
  }, [running, onTick]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "hidden") {
        onAutoPause();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [onAutoPause]);
}

export default function Timer({ elapsedSeconds }: { elapsedSeconds: number }) {
  return (
    <span
      aria-label={`Elapsed time ${formatDuration(elapsedSeconds)}`}
      className="font-mono font-semibold text-lg tabular-nums"
      style={{ color: "var(--fg-primary)" }}
    >
      {formatDuration(elapsedSeconds)}
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/components/games/kenken/timer.test.ts`
Expected: PASS (1 test, 4 assertions).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/components/games/kenken/timer.tsx src/components/games/kenken/timer.test.ts
git commit -m "feat(kenken): add timer display, hook, and formatter"
```

---

## Task 15: How-to-play overlay + win overlay

**Files:**
- Create: `src/components/games/kenken/how-to-play-overlay.tsx`
- Create: `src/components/games/kenken/win-overlay.tsx`

Two dismissible modal-style overlays. No unit tests (UI).

- [ ] **Step 1: Write the how-to-play overlay**

```tsx
// src/components/games/kenken/how-to-play-overlay.tsx
"use client";

import { Button } from "@/components/ui/button";

const RULES = [
  "Fill the grid so each row and column contains every digit from 1 to N with no repeats.",
  "Each outlined cage shows a target and an operation. The digits in the cage must combine, using that operation, to make the target.",
  "− and ÷ cages are always two cells. A single-cell cage's target is simply that cell's digit.",
  "Use notes to jot candidates, and the keypad or your keyboard to fill values.",
];

export default function HowToPlayOverlay({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  return (
    <div
      aria-labelledby="howto-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      style={{ background: "rgb(0 0 0 / 0.5)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 sm:p-8"
        style={{ background: "var(--bg-page)" }}
      >
        <h2
          className="mb-4 font-bold text-2xl"
          id="howto-title"
          style={{ color: "var(--fg-primary)" }}
        >
          How to play KenKen
        </h2>
        <ul className="mb-6 flex flex-col gap-3">
          {RULES.map((rule) => (
            <li
              className="text-sm"
              key={rule.slice(0, 24)}
              style={{ color: "var(--fg-secondary)", lineHeight: 1.6 }}
            >
              {rule}
            </li>
          ))}
        </ul>
        <Button onClick={onDismiss}>Got it — start playing</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the win overlay**

```tsx
// src/components/games/kenken/win-overlay.tsx
"use client";

import { Button } from "@/components/ui/button";
import { formatDuration } from "./timer";

interface WinOverlayProps {
  elapsedSeconds: number;
  hintsUsed: number;
  onNewGame: () => void;
  onChangeLevel: () => void;
  onShare: () => void;
}

export default function WinOverlay({
  elapsedSeconds,
  hintsUsed,
  onNewGame,
  onChangeLevel,
  onShare,
}: WinOverlayProps) {
  return (
    <div
      aria-labelledby="win-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      style={{ background: "rgb(0 0 0 / 0.5)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 text-center sm:p-8"
        style={{ background: "var(--bg-page)" }}
      >
        <h2
          className="mb-2 font-bold text-3xl"
          id="win-title"
          style={{ color: "var(--fg-primary)" }}
        >
          Solved! 🎉
        </h2>
        <p className="mb-6 text-[var(--fg-secondary)]">
          Time {formatDuration(elapsedSeconds)} · {hintsUsed} hint
          {hintsUsed === 1 ? "" : "s"} used
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={onNewGame}>New game, same level</Button>
          <Button onClick={onChangeLevel} variant="secondary">
            Change level
          </Button>
          <Button onClick={onShare} variant="ghost">
            Share this puzzle
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
bun run format
git add src/components/games/kenken/how-to-play-overlay.tsx src/components/games/kenken/win-overlay.tsx
git commit -m "feat(kenken): add how-to-play and win overlays"
```

---

## Task 16: Game container (state orchestration)

**Files:**
- Create: `src/components/games/kenken/kenken-game.tsx`

The `"use client"` container ties everything together: `useReducer(gameReducer)`, fetch on mount (by `initialPuzzleId`, by `initialLevel`, or via daily), persistence (save on change, restore on load, served-id tracking, last-level), the timer hook, keyboard handling, the how-to overlay (first visit), and the win overlay (with share copying the puzzle URL). No unit test (UI); the heavy logic is already covered by the reducer/engine/storage/client tests. Build + manual verification.

- [ ] **Step 1: Write the container**

```tsx
// src/components/games/kenken/kenken-game.tsx
"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import {
  createInitialState,
  gameReducer,
} from "@/lib/games/kenken/reducer";
import {
  fetchPuzzleById,
  fetchPuzzleByLevel,
  resolveDailyPuzzle,
} from "@/lib/games/kenken/puzzle-client";
import {
  addServedId,
  clearProgress,
  getHowToSeen,
  getLastLevel,
  getServedIds,
  loadProgress,
  saveProgress,
  setHowToSeen,
  setLastLevel,
} from "@/lib/games/kenken/storage";
import type { GameState } from "@/lib/games/kenken/runtime-types";
import type { Difficulty, KenKenPuzzle } from "@/lib/games/kenken/types";
import CellStatusBar from "./cell-status-bar";
import GameControls from "./game-controls";
import Grid from "./grid";
import HowToPlayOverlay from "./how-to-play-overlay";
import LevelPicker from "./level-picker";
import NumberPad from "./number-pad";
import Timer, { useGameTimer } from "./timer";
import WinOverlay from "./win-overlay";

type Mode = "play" | "daily";

interface KenKenGameProps {
  mode: Mode;
  initialPuzzleId?: string;
}

const DIGIT_RE = /^[1-9]$/;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function KenKenGame({
  mode,
  initialPuzzleId,
}: KenKenGameProps) {
  const [puzzle, setPuzzle] = useState<KenKenPuzzle | null>(null);
  const [showPicker, setShowPicker] = useState(
    mode === "play" && !initialPuzzleId
  );
  const [showHowTo, setShowHowTo] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Reducer is (re)initialized whenever a new puzzle loads.
  const [state, dispatch] = useReducer(
    gameReducer,
    null as unknown as GameState
  );

  const startPuzzle = useCallback((next: KenKenPuzzle) => {
    setPuzzle(next);
    addServedId(next.difficulty, next.id);
    const restored = loadProgress(next.id);
    dispatch({ type: "restore", grid: createInitialState(next).grid, elapsedSeconds: 0, hintsUsed: 0 });
    // Reinitialize fully via a fresh initial state, then optionally restore.
    // (handled in the effect below to keep dispatch ordering simple)
    if (restored) {
      dispatch({
        type: "restore",
        grid: restored.grid,
        elapsedSeconds: restored.elapsedSeconds,
        hintsUsed: restored.hintsUsed,
      });
    }
  }, []);

  // Load a puzzle for the current mode / params.
  const loadForLevel = useCallback(async (level: Difficulty) => {
    setLoadError(null);
    setLastLevel(level);
    try {
      const served = getServedIds(level);
      const next = await fetchPuzzleByLevel(level, served);
      clearProgress();
      setShowPicker(false);
      startPuzzle(next);
    } catch {
      setLoadError("Could not load a puzzle. Please try again.");
    }
  }, [startPuzzle]);

  // Initial mount.
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        if (mode === "daily") {
          const daily = await resolveDailyPuzzle(todayIso());
          if (active) {
            startPuzzle(daily);
          }
          return;
        }
        if (initialPuzzleId) {
          const byId = await fetchPuzzleById(initialPuzzleId);
          if (!active) {
            return;
          }
          if (byId) {
            startPuzzle(byId);
          } else {
            setLoadError(
              "That puzzle is no longer available. Pick a level to start a new one."
            );
            setShowPicker(true);
          }
        }
      } catch {
        if (active) {
          setLoadError("Could not load a puzzle. Please try again.");
        }
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [mode, initialPuzzleId, startPuzzle]);

  // First-time how-to overlay (once a puzzle exists).
  useEffect(() => {
    if (puzzle && !getHowToSeen()) {
      setShowHowTo(true);
    }
  }, [puzzle]);

  // Persist progress on every state change.
  useEffect(() => {
    if (puzzle && state) {
      saveProgress({
        puzzleId: puzzle.id,
        grid: state.grid,
        elapsedSeconds: state.elapsedSeconds,
        hintsUsed: state.hintsUsed,
      });
    }
  }, [puzzle, state]);

  const running = Boolean(puzzle) && !showHowTo && state?.status === "playing" && !state?.paused;
  const onTick = useCallback(() => dispatch({ type: "tick" }), []);
  const onAutoPause = useCallback(
    () => dispatch({ type: "setPaused", paused: true }),
    []
  );
  useGameTimer({ running, onTick, onAutoPause });

  const handleKey = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === "ArrowUp") {
      dispatch({ type: "move", dRow: -1, dCol: 0 });
    } else if (key === "ArrowDown") {
      dispatch({ type: "move", dRow: 1, dCol: 0 });
    } else if (key === "ArrowLeft") {
      dispatch({ type: "move", dRow: 0, dCol: -1 });
    } else if (key === "ArrowRight") {
      dispatch({ type: "move", dRow: 0, dCol: 1 });
    } else if (key === "Backspace" || key === "Delete") {
      dispatch({ type: "clear" });
    } else if (key === "n" || key === "N") {
      dispatch({ type: "toggleMode" });
    } else if (DIGIT_RE.test(key)) {
      dispatch({ type: "input", digit: Number(key) });
    } else {
      return;
    }
    event.preventDefault();
  }, []);

  const handleShare = useCallback(() => {
    if (!puzzle) {
      return;
    }
    const url = `${globalThis.location.origin}/brain-boost/kenken/play?puzzle=${puzzle.id}`;
    globalThis.navigator?.clipboard?.writeText(url).catch(() => {
      // Clipboard may be unavailable; sharing is best-effort.
    });
  }, [puzzle]);

  const dismissHowTo = useCallback(() => {
    setHowToSeen();
    setShowHowTo(false);
  }, []);

  if (showPicker) {
    return (
      <>
        {loadError ? (
          <p className="wrapper pt-6 text-center text-sm" style={{ color: "#dc2626" }}>
            {loadError}
          </p>
        ) : null}
        <LevelPicker initialLevel={getLastLevel()} onSelect={loadForLevel} />
      </>
    );
  }

  if (!(puzzle && state)) {
    return (
      <p className="wrapper py-16 text-center text-[var(--fg-secondary)]">
        {loadError ?? "Loading puzzle…"}
      </p>
    );
  }

  return (
    <section className="wrapper py-8">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <Timer elapsedSeconds={state.elapsedSeconds} />
          <span className="text-sm capitalize" style={{ color: "var(--fg-secondary)" }}>
            {puzzle.difficulty} · {puzzle.size}×{puzzle.size}
          </span>
        </div>

        {state.paused ? (
          <div
            className="flex min-h-64 items-center justify-center rounded-2xl"
            style={{ background: "var(--bg-subtle)" }}
          >
            <button
              className="rounded-full px-6 py-3 font-semibold text-white"
              onClick={() => dispatch({ type: "setPaused", paused: false })}
              style={{ background: "var(--fg-brand)" }}
              type="button"
            >
              Resume
            </button>
          </div>
        ) : (
          <Grid
            onKeyAction={handleKey}
            onSelect={(cell) => dispatch({ type: "select", cell })}
            state={state}
          />
        )}

        <CellStatusBar state={state} />
        <NumberPad
          mode={state.mode}
          onDigit={(digit) => dispatch({ type: "input", digit })}
          onErase={() => dispatch({ type: "clear" })}
          onToggleMode={() => dispatch({ type: "toggleMode" })}
          size={puzzle.size}
        />
        <GameControls
          canRedo={state.redoStack.length > 0}
          canUndo={state.undoStack.length > 0}
          hintsUsed={state.hintsUsed}
          onHint={() => dispatch({ type: "hint" })}
          onRedo={() => dispatch({ type: "redo" })}
          onRevealMistakes={() => dispatch({ type: "revealMistakes" })}
          onToggleRuleCheck={() => dispatch({ type: "toggleRuleCheck" })}
          onTogglePause={() =>
            dispatch({ type: "setPaused", paused: !state.paused })
          }
          onUndo={() => dispatch({ type: "undo" })}
          paused={state.paused}
          ruleCheckOn={state.ruleCheckOn}
        />
      </div>

      {showHowTo ? <HowToPlayOverlay onDismiss={dismissHowTo} /> : null}
      {state.status === "won" && !showHowTo ? (
        <WinOverlay
          elapsedSeconds={state.elapsedSeconds}
          hintsUsed={state.hintsUsed}
          onChangeLevel={() => {
            clearProgress();
            setShowPicker(true);
          }}
          onNewGame={() => loadForLevel(puzzle.difficulty)}
          onShare={handleShare}
        />
      ) : null}
    </section>
  );
}
```

> **Implementer note on reducer re-init:** `useReducer` cannot swap its entire state from outside cleanly. The `startPuzzle` flow above resets via `restore`. If during implementation you find resetting through `restore` awkward (e.g. you need a brand-new `puzzle` reference in state), refactor to key the reducer-bearing subtree: render an inner `<GamePlay puzzle={puzzle} .../>` component with `key={puzzle.id}` that calls `useReducer(gameReducer, puzzle, createInitialState)`. This is the **preferred** structure — it guarantees a clean state per puzzle. Adopt it if the single-component approach gets tangled; keep the same child components and props. Report which structure you used.

- [ ] **Step 2: Verify the build compiles**

Run: `bun run build`
Expected: build succeeds. Resolve any type errors (the container imports every child component + lib module).

- [ ] **Step 3: Commit**

```bash
bun run format
git add src/components/games/kenken/kenken-game.tsx
git commit -m "feat(kenken): add game container with state orchestration"
```

---

## Task 17: `/play` and `/daily` route shells

**Files:**
- Create: `src/app/(site)/brain-boost/kenken/play/page.tsx`
- Create: `src/app/(site)/brain-boost/kenken/daily/page.tsx`

Thin server shells: export metadata + JSON-LD, mount the client game. `/play` reads the optional `?puzzle=<id>` search param (Next.js 16: `searchParams` is a Promise — `await` it). Both are interactive app routes, excluded from the sitemap (handled in Plan 3).

- [ ] **Step 1: Write the `/play` shell**

```tsx
// src/app/(site)/brain-boost/kenken/play/page.tsx
import type { Metadata } from "next";
import KenKenGame from "@/components/games/kenken/kenken-game";
import { jsonLdString, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Play KenKen — ${SITE_NAME}`,
  description:
    "Play KenKen online — pick a difficulty and solve uniquely-generated arithmetic logic puzzles. Free, no sign-up.",
  path: "/brain-boost/kenken/play",
});

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "Game",
  name: "KenKen",
  url: `${SITE_URL}/brain-boost/kenken/play`,
  genre: "Logic puzzle",
  applicationCategory: "Game",
};

export default async function KenKenPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ puzzle?: string }>;
}) {
  const { puzzle } = await searchParams;
  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD payload
        dangerouslySetInnerHTML={{ __html: jsonLdString(gameJsonLd) }}
        type="application/ld+json"
      />
      <KenKenGame initialPuzzleId={puzzle} mode="play" />
    </main>
  );
}
```

- [ ] **Step 2: Write the `/daily` shell**

```tsx
// src/app/(site)/brain-boost/kenken/daily/page.tsx
import type { Metadata } from "next";
import KenKenGame from "@/components/games/kenken/kenken-game";
import { jsonLdString, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Daily KenKen — ${SITE_NAME}`,
  description:
    "A fresh Intermediate KenKen puzzle each day. Solve today's daily KenKen — free, no sign-up.",
  path: "/brain-boost/kenken/daily",
});

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "Game",
  name: "Daily KenKen",
  url: `${SITE_URL}/brain-boost/kenken/daily`,
  genre: "Logic puzzle",
  applicationCategory: "Game",
};

export default function KenKenDailyPage() {
  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD payload
        dangerouslySetInnerHTML={{ __html: jsonLdString(gameJsonLd) }}
        type="application/ld+json"
      />
      <KenKenGame mode="daily" />
    </main>
  );
}
```

- [ ] **Step 3: Build + manual verification**

Run: `bun run build`
Expected: build succeeds; `/brain-boost/kenken/play` and `/brain-boost/kenken/daily` appear in the route list.

Then `bun run dev` and verify in a browser (desktop + a mobile viewport):
- `/brain-boost/kenken/play` shows the level picker; selecting a level loads a playable puzzle.
- Fill cells via the number pad and via the keyboard (arrows move, digits fill, `N` toggles notes, Backspace clears).
- Notes, undo/redo, rule-check toggle, reveal-mistakes, hint (+count), pause/resume all work; cell status bar reflects the selected cell.
- Committing a value auto-clears that digit from notes in the same row/column/cage.
- First-ever visit shows the how-to overlay; after dismissal it does not reappear (refresh).
- Refresh mid-puzzle resumes grid, timer, and hint count.
- Completing a puzzle shows the win overlay with time; "New game" loads a different puzzle; "Change level" returns to the picker; "Share" copies the URL.
- `?puzzle=<id>` (use a real id from `easy.json`) opens that exact puzzle; an unknown id shows a notice + the picker.
- An 8×8 / 9×9 grid fits the screen width on mobile (no horizontal scroll); in-cell notes are hidden and the status bar carries notes.
- `/brain-boost/kenken/daily` loads an Intermediate puzzle; refreshing the same day keeps the same puzzle.
- Switching browser tabs auto-pauses the timer.

- [ ] **Step 4: Commit**

```bash
bun run format
git add "src/app/(site)/brain-boost/kenken/play/page.tsx" "src/app/(site)/brain-boost/kenken/daily/page.tsx"
git commit -m "feat(kenken): add /play and /daily route shells"
```

---

## Final verification

- [ ] **Run the full kenken test suite:** `bun test src/lib/games/kenken` — all pass.
- [ ] **Run the component test(s):** `bun test src/components/games/kenken` — all pass.
- [ ] **Run the full test suite:** `bun test` — all pass.
- [ ] **Run the full check (final/pre-merge):** `bun run check` — clean + lint + build + audit pass. (Heavy: reinstalls deps. Skip during iteration; run once at the end.)

---

## Spec coverage check (this plan)

Covers from `2026-05-23-kenken-design.md`: §2.A standalone accent constant (Task 1), §6 engine modules + runtime state + reducer + client fetch helper (Tasks 1,4,5,6,8), §7 gameplay features — pencil marks incl. large-grid hiding, undo/redo, rule check + reveal-vs-solution, unlimited hints with count, timer + pause/resume + auto-pause on tab hidden, cell status bar, auto-clear notes, peer/same-value highlight, first-time how-to overlay, win celebration (Tasks 4,5,6,11,13,14,15,16), §8 input/devices — number pad + keyboard, fit-to-width large grids, hidden in-cell notes, ARIA labels with cage target, dynamic cage borders incl. L-shaped (Tasks 3,10,12,16), §9 persistence + sharing — namespaced/versioned localStorage, in-progress resume, daily stickiness, served-id tracking, share-by-id URL (Tasks 7,8,16), §5a client usage of the API (Tasks 8,16), §2 routing for `/play` + `/daily` (Task 17), §11 engine/persistence/client unit tests (Tasks 2–8,14).

**Deferred to Plan 3:** `/brain-boost` placeholder page, `kenken_page` Storyblok content type + bloks + hardcoded fallback + blok registration + `loadKenkenStory`, "Brain Boost" nav/footer entries, `/brain-boost/kenken` in `sitemap.ts`.
