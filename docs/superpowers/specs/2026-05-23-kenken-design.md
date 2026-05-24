# KenKen Game — Requirements & Design

- **Date:** 2026-05-23
- **Status:** Draft for review
- **Author:** Pinal Bhatt (with Claude)
- **Section:** BrainBoost (`/brain-boost`) — the site's new brain-games section; KenKen is the first game.

---

## 1. Overview

KenKen is an arithmetic logic puzzle. The player fills an N×N grid with the digits
1…N so that **no digit repeats in any row or column** (a Latin square). The grid is
divided into **cages** — outlined groups of cells — each labeled with a target number
and an operation (`+`, `−`, `×`, `÷`). The digits in a cage must combine, using that
operation, to produce the target. Single-cell cages are "freebies" (a given digit).

This document specifies the **full product vision** for KenKen on PBDesk, and scopes
the **first implementation** to a self-contained, shippable game (see §10, Phasing).

### Goals

- Ship a polished, mobile-first KenKen game as the first BrainBoost game.
- Generate guaranteed-valid, uniquely-solvable puzzles offline and ship them as a
  static library (no runtime backend, no login).
- Establish the `/brain-boost` section so future games slot in cleanly.

### Non-goals (for the first implementation)

- User accounts / server-side persistence.
- Stats, streaks, leaderboards, or best-time tracking (timer is shown but not persisted as stats).
- Progression/level-unlock ladder (documented as a future phase).
- Multiplayer or social features beyond shareable puzzle URLs.

---

## 2. Routing & Section Structure

| Route | Type | Purpose |
|-------|------|---------|
| `/brain-boost` | Storyblok-managed hub landing | Lists BrainBoost games; KenKen is the first card. Consistent with Bits/Bites/Blog landings. |
| `/brain-boost/kenken` | Storyblok-managed content page | Explains what KenKen is, how to play, the rules, and an overview of the difficulty levels. Links to `/play` and `/daily`. |
| `/brain-boost/kenken/play` | Interactive game (client) | User selects a level/size and plays a puzzle from the library. |
| `/brain-boost/kenken/daily` | Interactive game (client) | Serves one randomly-selected **Intermediate** puzzle. |

**Notes**

- All routes use the hyphenated `/brain-boost` slug.
- `/brain-boost` and `/brain-boost/kenken` are CMS-driven (Storyblok), matching the
  existing section pattern (`loadPillarData`-style content + metadata + JSON-LD).
- `/play` and `/daily` are interactive client games. Their pages are thin server
  shells (metadata, JSON-LD, static puzzle import) that mount a client game component.
- A new pillar accent is added to `src/lib/pillars.ts` for `brain-boost` (its own
  gradient pair).
- "BrainBoost" is added to the header and footer navigation.
- **Daily semantics:** `/daily` selects a random Intermediate puzzle from the library
  on load. (This is intentionally simpler than a date-seeded "same puzzle for everyone"
  daily; it can be upgraded later — see §10.)

---

## 3. Difficulty Levels

Difficulty is a function of **grid size** and the **operation set** in play.

| Tier | Sizes | Operations |
|--------------|--------------|----------------|
| Easy | 3×3 | +, −, ×, ÷ |
| Easy | 4×4, 5×5 | +, −, × |
| Intermediate | 4×4, 5×5 | +, −, ×, ÷ |
| Hard | 6×6, 7×7 | +, −, ×, ÷ |
| Genius | 8×8, 9×9 | +, −, ×, ÷ |

- Subtraction (`−`) and division (`÷`) cages are always exactly **two cells** (the
  operation is only well-defined pairwise; larger such cages are ambiguous).
- Difficulty is additionally tuned by **cage size distribution**: harder tiers favor
  smaller cages and fewer single-cell freebies.

---

## 4. Puzzle Data Model

The generator emits, and the game consumes, this shape:

```ts
type Operation = "+" | "-" | "*" | "/" | "="; // "=" is a single-cell given

type Cell = [row: number, col: number]; // 0-indexed

type Cage = {
  cells: Cell[];      // contiguous group; length 1 for "=", exactly 2 for "-"/"/"
  op: Operation;
  target: number;     // the value cage digits must produce via op
};

type KenKenPuzzle = {
  id: string;             // stable, e.g. "k4-easy-00012"
  size: number;           // 3..9
  difficulty: "easy" | "intermediate" | "hard" | "genius";
  cages: Cage[];          // partition of all cells; every cell in exactly one cage
  solution: number[][];   // size×size solved grid; used for hints + checking
};
```

- `solution` is shipped with the puzzle so hints and mistake-checking work fully
  client-side (no solver needed at runtime). It is the unique solution guaranteed by
  the generator.
- Puzzle `id` encodes size + difficulty + sequence for stable share URLs.

### Storage of the library

- Generated puzzles live under `src/lib/games/kenken/puzzles/`, organized by
  difficulty (e.g. `easy.json`, `intermediate.json`, `hard.json`, `genius.json`), and
  committed to the repo. Imported as static JSON at build time.
- Target initial library size: enough variety per tier that free-play and random
  daily selection feel fresh (e.g. ~50 puzzles per tier as a starting point; tunable).

---

## 5. Puzzle Generator (offline script)

A pure-TypeScript Bun script, `scripts/generate-kenken.ts`, run on demand (not at
request time). Output is committed JSON.

**Algorithm**

1. **Latin square:** generate a random valid N×N Latin square (shuffled symbols +
   backtracking to fill).
2. **Cage partition:** randomly group cells into contiguous cages, with sizes drawn
   from a distribution keyed to the target difficulty (smaller cages → harder).
3. **Operation + target assignment:** for each cage pick an operation allowed for the
   tier (respecting the 2-cell rule for `−`/`÷`), and compute its target from the
   Latin square solution.
4. **Uniqueness verification (critical):** run a backtracking constraint solver over
   the cage/target constraints. Accept the puzzle only if it has **exactly one**
   solution. Otherwise discard and retry (re-partition / re-assign).
5. **Emit:** append the validated `KenKenPuzzle` to the appropriate difficulty file
   with a stable `id`.

**Properties**

- Generator and solver are framework-free and independently unit-testable.
- Solver is reused in tests to assert every shipped puzzle is uniquely solvable and
  that `solution` matches.
- The generator is retained (not a throwaway) so the library can be expanded over time
  — this is the "hybrid: generate + cache" strategy.

---

## 6. Game Engine & State

The interactive game is a React **client component** tree mounted by the `/play` and
`/daily` server shells. Core game logic is isolated in framework-light modules so it
can be unit-tested without rendering.

**Engine modules (`src/lib/games/kenken/`)**

- `types.ts` — the data model above plus runtime state types.
- `engine.ts` — pure functions: apply a value/note to a cell, clear a cell,
  detect row/column duplicate conflicts, detect cage-constraint violations, and
  determine the win condition (grid full + all rows/cols valid + all cages satisfied).
- `puzzle-loader.ts` — select a puzzle by id, by (size, difficulty), or a random one
  for a given tier (used by `/daily` → random Intermediate).

**Runtime state (held in the client game component)**

- Current grid values (`number | null` per cell).
- Pencil marks per cell (a set of candidate digits).
- Selected cell, current input mode (value vs. note).
- Undo/redo stacks (immutable snapshots of grid + notes).
- Timer (elapsed seconds, running/paused).
- Mistake-check state (which cells are flagged), hint usage.

State updates flow through the pure `engine.ts` functions so behavior is testable and
predictable.

---

## 7. Gameplay Features (first implementation)

All of the following are in scope:

- **Pencil marks / notes** — toggle note mode; jot multiple candidate digits in a cell
  before committing a final value.
- **Undo / redo** — step backward/forward through moves (value, note, and clear
  actions).
- **Mistake checking** — highlight row/column duplicates and entries that conflict with
  the solution. Available both as a manual "Check" action and as live conflict
  highlighting for duplicate row/column digits. (Live full-correctness checking against
  the solution is exposed via the Check action / hints, not forced on the player.)
- **Hints** — on request, reveal a correct cell (from `solution`) or flag an incorrect
  entry. Always available because the solution ships with the puzzle.
- **Timer** — shown during play and on completion. **Not** persisted as stats/streaks.
- **Auto-fill helpers** — quality-of-life: clear a cell's pencil marks when a final
  value is placed; highlight other cells with the same value; highlight the active
  cell's row/column/cage.
- **Win celebration** — on solving, show a completion state with the solve time and a
  share affordance. (Lightweight; no stats persistence.)

---

## 8. Input & Devices

- **Mobile-first** responsive layout; the grid scales to viewport and stays usable on
  phones. Larger grids (7×7–9×9) get appropriate sizing/scroll treatment on small
  screens.
- **Dual input:**
  - **On-screen number pad** — tap a cell, tap a digit; a notes toggle and an erase
    button are part of the pad.
  - **Keyboard** — arrow keys move the selection; digit keys fill; a modifier or toggle
    enters note mode; Backspace/Delete clears; undo/redo shortcuts.
- **Accessibility** (per project standards): semantic markup, ARIA roles/labels for the
  grid and cells, visible focus, keyboard operability, sufficient color contrast for
  cage borders, conflict highlights, and the active selection. Color is never the sole
  signal for a conflict.

---

## 9. Persistence & Sharing

- **localStorage** — persist in-progress game state (grid values, pencil marks, timer,
  selected puzzle id) keyed by puzzle id, so a refresh or return on the same device
  resumes the puzzle. Daily-puzzle completion state is also stored locally.
- **Shareable URLs** — a puzzle is addressable by id (e.g.
  `/brain-boost/kenken/play?puzzle=k4-intermediate-00007`) so a specific puzzle can be
  shared/bookmarked. Sharing the puzzle (not live progress) is the primary use; the
  share affordance copies the puzzle URL.
- No backend; all persistence is client-side.

---

## 10. Phasing

The spec describes the full vision; implementation is phased so the first release is a
complete, shippable game.

**Phase 1 — first implementation (this build)**

- Generator + solver script and committed puzzle library (all tiers).
- Game engine + full feature set (§7) and dual input (§8).
- `/brain-boost` Storyblok hub + `/brain-boost/kenken` Storyblok info page.
- `/brain-boost/kenken/play` (level select + free play) and
  `/brain-boost/kenken/daily` (random Intermediate puzzle).
- localStorage persistence + shareable puzzle URLs.
- Nav/footer entry and `pillars.ts` accent.

**Phase 2 — date-seeded daily + archive (future)**

- Upgrade `/daily` from "random Intermediate" to a date-seeded puzzle that is the same
  for everyone on a given day, with a browsable archive of past days.

**Phase 3 — progression / levels (future)**

- A curated easy→genius ladder with unlock tracking (local), surfaced from the
  `/brain-boost/kenken` page.

(Phases 2–3 reuse the same engine and library; routes are reserved but not built now.)

---

## 11. Testing Strategy

- **Generator/solver unit tests:** the solver finds the known solution; every shipped
  puzzle has exactly one solution and a `solution` grid that satisfies all cages and
  the Latin-square constraints.
- **Engine unit tests:** conflict detection (row/col duplicates, cage violations),
  win-condition detection, undo/redo correctness, pencil-mark behavior, auto-clear on
  value placement.
- **Persistence tests:** save/restore round-trips through localStorage; resume matches
  prior state; share-URL puzzle id resolves to the correct puzzle.
- **Build verification:** `bun run format` then `bun run check` (clean + lint + build).
- **Manual UI verification:** play on desktop and a mobile viewport — keyboard and
  on-screen pad, notes, undo/redo, check, hints, win flow, resume after refresh.

---

## 12. Source Layout (proposed)

```
scripts/
  generate-kenken.ts            # offline generator + uniqueness verification
src/
  lib/games/kenken/
    types.ts                    # data model + runtime state types
    engine.ts                   # pure game logic (conflicts, win, moves)
    solver.ts                   # backtracking solver (shared by generator + tests)
    puzzle-loader.ts            # select by id / (size,difficulty) / random tier
    puzzles/
      easy.json
      intermediate.json
      hard.json
      genius.json
  components/games/kenken/      # client game UI (grid, cage borders, number pad, controls, timer, win)
  app/(site)/brain-boost/
    page.tsx                    # Storyblok hub landing
    kenken/
      page.tsx                  # Storyblok info/rules/levels page
      play/page.tsx             # server shell -> client game (level select + free play)
      daily/page.tsx            # server shell -> client game (random Intermediate)
  lib/pillars.ts                # add brain-boost accent
```

(Exact filenames/organization may be refined during planning, following existing
project conventions.)

---

## 13. Open Questions / Assumptions

- **Library size per tier** — assumed ~50/tier to start; confirm during planning.
- **Storyblok content types** — the hub and the kenken info page need new Storyblok
  components/stories; field design happens at planning time.
- **Share scope** — assumed sharing a *puzzle* (by id), not live in-progress state.
