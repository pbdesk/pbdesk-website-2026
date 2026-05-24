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
  committed library, served one at a time by a read-only route handler (no database,
  no login).
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
| `/brain-boost/kenken/play` | Interactive game (client) | User selects a level and plays. Puzzles are fetched on demand from the API route. |
| `/brain-boost/kenken/daily` | Interactive game (client) | Fetches one randomly-selected **Intermediate** puzzle from the API route. |
| `GET /api/kenken/puzzle` | Route handler (server) | Returns a single puzzle as JSON from the committed library, selected by `level` (and optional `id` / `exclude` params). See §5a. |

**Notes**

- All routes use the hyphenated `/brain-boost` slug.
- `/brain-boost` and `/brain-boost/kenken` are CMS-driven (Storyblok), matching the
  existing section pattern (`loadPillarData`-style content + metadata + JSON-LD).
- `/play` and `/daily` are interactive client games. Their pages are thin server
  shells (metadata, JSON-LD) that mount a client game component. The client fetches
  puzzles **one at a time** from `/api/kenken/puzzle` — the full library is **not**
  bundled into the page JS (see §5a).
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

**Location**

- Generated puzzles live under `src/lib/games/kenken/puzzles/`, organized by
  difficulty: `easy.json`, `intermediate.json`, `hard.json`, `genius.json`.
- Committed to the repo and read **server-side** by the `/api/kenken/puzzle` route
  handler (§5a). They are **not** imported into the client bundle, so the page stays
  light as the library grows.
- Output sits under `src/` (not next to the script) so the deployed Next server can
  read it. The generator's own location (`scripts/bb/kenken/`) is independent of where
  its output is written.

**Format & save mechanics**

- Each file is a **JSON array of `KenKenPuzzle` objects** (the shape above).
- The generator **appends** newly-verified puzzles to the matching tier file, so
  re-running grows the library rather than overwriting it.
- Each puzzle gets a **stable, incrementing `id`** of the form
  `k<size>-<difficulty>-<seq>` (e.g. `k4-intermediate-00007`).
- **De-duplication:** before appending, skip any puzzle whose `solution` grid already
  exists in that tier file, so identical puzzles don't accumulate.
- Target initial library size: enough variety per tier that free-play and random
  daily selection feel fresh (e.g. ~50 puzzles per tier as a starting point; tunable).

---

## 5. Puzzle Generator (offline script)

A pure-TypeScript Bun script, `scripts/bb/kenken/generate-kenken.ts`, run on demand
(not at request time). Output is committed JSON written to
`src/lib/games/kenken/puzzles/` (see §4, "Storage of the library").

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

## 5a. Puzzle Delivery (route handler)

Puzzles reach the browser via a single **Next.js route handler**, fetched on demand —
one puzzle per call. The committed library is read server-side; nothing is bundled into
the client.

**Endpoint:** `GET /api/kenken/puzzle`

| Param | Required | Meaning |
|-------|----------|---------|
| `level` | yes (unless `id`) | `easy` \| `intermediate` \| `hard` \| `genius`. Returns one puzzle of that tier. |
| `id` | optional | Return a specific puzzle by id (used for shareable URLs). |
| `exclude` | optional | Comma-separated puzzle ids to avoid (the player's already-seen ids). The handler prefers a puzzle whose id is not in this list. |

**Selection logic**

- With `id`: return that exact puzzle (404 if unknown).
- With `level`: pick a **random** puzzle of that tier, **preferring one not in
  `exclude`**. If every puzzle in the tier is excluded (pool exhausted), fall back to a
  random one from the full tier.
- Response: a single `KenKenPuzzle` JSON object.

**Client usage**

- On `/play`: when the user selects a level (and on each "New game, same level"), the
  client calls `GET /api/kenken/puzzle?level=X&exclude=<seen ids for X>`.
- On `/daily`: the client calls `GET /api/kenken/puzzle?level=intermediate`.
- For a shared URL (`?puzzle=<id>`): the client calls `GET /api/kenken/puzzle?id=<id>`.

**Play loop (`/play`)**

1. User selects a level → client fetches a puzzle for that level → game starts.
2. User solves or ends the game → completion view offers:
   - **New game, same level** → fetch another puzzle of the same tier (excluding seen ids).
   - **Change level** → return to level select; choosing a tier fetches a puzzle for it.
3. Seen puzzle ids are tracked per-level in localStorage (§9) and passed as `exclude`
   so "New game" prefers unseen puzzles.

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
- `puzzle-loader.ts` — **server-side** selection used by the `/api/kenken/puzzle` route
  handler: read the committed library and select a puzzle by id, or a random one for a
  tier with `exclude`-aware preference for unseen ids (§5a).
- `puzzle-client.ts` — thin client helper that calls `/api/kenken/puzzle` (by level
  + exclude, by id, or daily) and returns the puzzle to the game component.

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
- **Played-puzzle ids (repeat avoidance)** — track the set of completed/seen puzzle ids
  **per level** in localStorage. The client passes these as the `exclude` param to
  `/api/kenken/puzzle` (§5a) so "New game" prefers puzzles the player hasn't seen for
  that level, falling back to any once the tier's pool is exhausted.
- **Shareable URLs** — a puzzle is addressable by id (e.g.
  `/brain-boost/kenken/play?puzzle=k4-intermediate-00007`) so a specific puzzle can be
  shared/bookmarked. The client resolves the id via `GET /api/kenken/puzzle?id=…`.
  Sharing the puzzle (not live progress) is the primary use; the share affordance copies
  the puzzle URL.
- No database; persistence of player state is client-side (localStorage). The only
  server piece is the read-only puzzle route handler reading committed JSON.

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
- **Route handler tests:** `GET /api/kenken/puzzle` returns a valid puzzle for each
  level; `id` returns the exact puzzle (404 if unknown); `exclude` prefers unseen ids
  and falls back when the tier pool is exhausted.
- **Persistence tests:** save/restore round-trips through localStorage; resume matches
  prior state; played-id tracking accumulates per level; share-URL puzzle id resolves to
  the correct puzzle.
- **Build verification:** `bun run format` then `bun run check` (clean + lint + build).
- **Manual UI verification:** play on desktop and a mobile viewport — keyboard and
  on-screen pad, notes, undo/redo, check, hints, win flow, resume after refresh.

---

## 12. Source Layout (proposed)

```
scripts/bb/kenken/
  generate-kenken.ts            # offline generator + uniqueness verification
src/
  lib/games/kenken/
    types.ts                    # data model + runtime state types
    engine.ts                   # pure game logic (conflicts, win, moves)
    solver.ts                   # backtracking solver (shared by generator + tests)
    puzzle-loader.ts            # server-side selection by id / tier + exclude
    puzzle-client.ts            # client fetch helper for /api/kenken/puzzle
    puzzles/
      easy.json
      intermediate.json
      hard.json
      genius.json
  components/games/kenken/      # client game UI (grid, cage borders, number pad, controls, timer, win)
  app/api/kenken/puzzle/
    route.ts                    # GET handler: returns one puzzle (level/id/exclude)
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
