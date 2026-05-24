# KenKen Game — Requirements & Design

- **Date:** 2026-05-23
- **Status:** Draft for review
- **Author:** Pinal Bhatt (with Claude)
- **Section:** Brain Boost (`/brain-boost`) — the site's new brain-games section; KenKen is the first game.
- **Display name:** "Brain Boost" (two words) in all UI, nav, and footer text. URL slug stays `/brain-boost`. Code identifiers may use `brainBoost`.
- **Section model:** Brain Boost is a **separate games section**, NOT a new pillar. It is not added to `PillarKey` / `pillarAccents` in `src/lib/pillars.ts`; it borrows the landing-page styling/components with its own standalone accent.

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

- Ship a polished, mobile-first KenKen game as the first Brain Boost game.
- Generate guaranteed-valid, uniquely-solvable puzzles offline and ship them as a
  committed library, served one at a time by a read-only route handler (no database,
  no login).
- Establish the `/brain-boost` section (a separate games section, not a pillar) so
  future games slot in cleanly.

### Non-goals (for the first implementation)

- User accounts / server-side persistence.
- Stats, streaks, leaderboards, or best-time tracking (timer is shown but not persisted as stats).
- Progression/level-unlock ladder (documented as a future phase).
- Multiplayer or social features beyond shareable puzzle URLs.

---

## 2. Routing & Section Structure

| Route | Type | Purpose |
|-------|------|---------|
| `/brain-boost` | Storyblok-managed hub landing | Lists Brain Boost games; KenKen is the first card. Borrows the Bits/Bites/Blog landing styling (not a pillar). |
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
- **Not a pillar.** Brain Boost is a separate games section: it is NOT added to
  `PillarKey` / `pillarAccents` in `src/lib/pillars.ts`. It reuses the landing-page
  styling/components, passing its own standalone accent (a gradient pair defined within
  the Brain Boost section, not in the pillar registry).
- "Brain Boost" (two words) is added to the header and footer navigation.
- **Daily semantics:** on the first visit to `/daily` on a given calendar date, the
  client picks a random Intermediate puzzle and stores `{ date, puzzleId }` in
  localStorage. Refresh/return **the same day on the same device** restores that **same**
  puzzle; a new one is chosen the next day. (This is per-device, not yet a date-seeded
  "same puzzle for everyone" daily — that's §10 Phase 2.)

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

**Operation semantics (standard KenKen)**

- **Addition (`+`)** / **Multiplication (`×`)**: cage cells sum / multiply to the target
  (any cage size ≥ 2).
- **Subtraction (`−`)**: two cells; target is their **absolute difference**
  (`|a − b|`).
- **Division (`÷`)**: two cells; target is **larger ÷ smaller**, and only valid when the
  quotient is an **integer** (the generator only emits division cages that divide evenly).
- **Single-cell (`=`)**: the target is the given digit.

**Display mapping:** data stores ASCII operators `+`, `-`, `*`, `/` (and `=`); the UI
renders them as `+`, `−`, `×`, `÷` (single-cell cages show just the number).

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

// Each tier JSON file is a versioned library wrapper:
type KenKenLibrary = {
  schemaVersion: number;  // bump when puzzle/cage metadata format changes
  difficulty: "easy" | "intermediate" | "hard" | "genius";
  puzzles: KenKenPuzzle[];
};
```

- `solution` is shipped with the puzzle so hints and mistake-checking work fully
  client-side (no solver needed at runtime). It is the unique solution guaranteed by
  the generator.
- Puzzle `id` encodes size + difficulty + sequence for stable share URLs.
- **`schemaVersion`** is stored on the library wrapper (cheap now, useful later if cage
  metadata, difficulty tuning, or curated daily/archive fields change). The loader can
  branch on it if the format ever evolves.

### Storage of the library

**Location**

- Generated puzzles live under `src/lib/games/kenken/puzzles/`, organized by
  difficulty: `easy.json`, `intermediate.json`, `hard.json`, `genius.json`.
- Committed to the repo and read **server-side** by the `/api/kenken/puzzle` route
  handler (§5a). They are **not** imported into the client bundle, so the page stays
  light as the library grows.
- **Loading mechanics:** the server-side loader reads these files via **static ES
  imports** (e.g. `import easy from "./puzzles/easy.json"`) rather than runtime `fs`
  reads. This sidesteps Next.js deployment file-tracing issues, and because the import
  only happens in the route handler / server loader it still does **not** enter the
  client bundle.
- Output sits under `src/` (not next to the script) so the deployed Next server can
  read it. The generator's own location (`scripts/bb/kenken/`) is independent of where
  its output is written.

**Format & save mechanics**

- Each file is a **`KenKenLibrary` object** (`{ schemaVersion, difficulty, puzzles[] }`)
  — see the data model above.
- The generator **appends** newly-verified puzzles to the matching tier file's
  `puzzles` array, so re-running grows the library rather than overwriting it.
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
| `exclude` | optional | Comma-separated puzzle ids to avoid (every puzzle the player has been **served/started** for that level, completed or not — see §9). The handler prefers a puzzle whose id is not in this list. |

**Selection logic**

- With `id`: return that exact puzzle.
- With `level`: pick a **random** puzzle of that tier, **preferring one not in
  `exclude`**. If every puzzle in the tier is excluded (pool exhausted), fall back to a
  random one from the full tier.
- Response: a single `KenKenPuzzle` JSON object.

**Error behavior**

| Condition | Status | Body |
|-----------|--------|------|
| `level` is missing/invalid and no `id` | `400` | `{ error: "invalid level" }` |
| `id` provided but not found in any tier | `404` | `{ error: "puzzle not found" }` |
| Requested tier library is empty | `503` | `{ error: "no puzzles available" }` |

**Client usage**

- On `/play`: when the user selects a level (and on each "New game, same level"), the
  client calls `GET /api/kenken/puzzle?level=X&exclude=<seen ids for X>`.
- On `/daily`: the client first checks localStorage for today's stored daily
  (`{ date, puzzleId }`). If present, it resolves that puzzle via
  `GET /api/kenken/puzzle?id=<storedId>`; otherwise it calls
  `GET /api/kenken/puzzle?level=intermediate`, then stores `{ today, puzzle.id }` so the
  rest of the day is sticky (see §2, §9).
- For a shared URL (`?puzzle=<id>`): the client calls `GET /api/kenken/puzzle?id=<id>`.

**Play loop (`/play`)**

1. User selects a level → client fetches a puzzle for that level → game starts.
2. User solves or ends the game → completion view offers:
   - **New game, same level** → fetch another puzzle of the same tier (excluding seen ids).
   - **Change level** → return to level select; choosing a tier fetches a puzzle for it.
3. Every puzzle served/started is tracked per-level in localStorage (§9) and passed as
   `exclude` so "New game" prefers puzzles the player has not yet been shown — even ones
   they abandoned.

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
  entry. **Unlimited**, but the game displays a **count of hints used** for the current
  puzzle (no cap, no cross-puzzle persistence).
- **Timer with pause/resume** — shown during play and on completion. A visible
  **pause/resume control** stops the timer and hides the grid (so the player can't keep
  solving while "paused"); resuming restores the grid and continues timing. **Not**
  persisted as stats/streaks.
- **Auto-fill helpers** — quality-of-life: clear a cell's pencil marks when a final
  value is placed; highlight other cells with the same value; highlight the active
  cell's row/column/cage.
- **First-time how-to-play overlay** — on the player's first game start, show a brief
  dismissible "How to play" overlay (rules + controls). A dismissal flag is stored in
  localStorage so it doesn't reappear. KenKen is less universal than Sudoku, so this
  reduces bounce. (The full rules also live on the `/brain-boost/kenken` info page.)
- **Win celebration** — on solving, show a completion state with the solve time and a
  share affordance. (Lightweight; no stats persistence.)

---

## 8. Input & Devices

- **Mobile-first** responsive layout; the grid scales to viewport and stays usable on
  phones.
- **Large grids (8×8, 9×9) on mobile: shrink to fit the viewport width.** The grid
  always scales down so the whole board is visible at once (no horizontal scroll, no
  zoom controls). Cells, cage labels, and pencil marks shrink accordingly; the layout
  must keep them legible and tap targets usable at the smallest supported width. This
  fit-to-width approach is decided up front because it shapes the grid layout
  architecture.
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

- **In-progress game state** — persist grid values, pencil marks, timer, hint count,
  and selected puzzle id, keyed by puzzle id, so a refresh or return on the same device
  resumes the puzzle.
- **Today's daily** — store `{ date, puzzleId }` for `/daily`. While the stored `date`
  matches today, `/daily` reloads the **same** puzzle on that device; on a new date the
  client picks a fresh random Intermediate puzzle and overwrites the entry (see §2, §5a).
- **Served-puzzle ids (repeat avoidance)** — track, **per level**, every puzzle id the
  player has been **served/started** (not only completed ones). The client passes these
  as the `exclude` param to `/api/kenken/puzzle` (§5a) so "New game" prefers puzzles the
  player has not yet been shown, falling back to any once the tier's pool is exhausted.
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
  `/brain-boost/kenken/daily` (per-device sticky daily Intermediate puzzle).
- localStorage persistence (in-progress state, today's daily, served-id tracking) +
  shareable puzzle URLs.
- "Brain Boost" nav/footer entry; standalone section accent (no `pillars.ts` change).
- First-time how-to-play overlay.

**Phase 2 — date-seeded daily + archive (future)**

- Upgrade `/daily` from the per-device sticky daily to a **date-seeded** puzzle that is
  the same for everyone on a given day, with a browsable archive of past days.

**Phase 3 — progression / levels (future)**

- A curated easy→genius ladder with unlock tracking (local), surfaced from the
  `/brain-boost/kenken` page.

(Phases 2–3 reuse the same engine and library; routes are reserved but not built now.)

---

## 11. Testing Strategy

- **Generator/solver unit tests:** the solver finds the known solution; every shipped
  puzzle has exactly one solution and a `solution` grid that satisfies all cages and
  the Latin-square constraints.
- **Library validation tests** (run over every committed puzzle): every cell is covered
  by **exactly one** cage; each cage's cells are **contiguous**; `−`/`÷` cages have
  exactly 2 cells; all solution values are in range `1..size`; the cage `op`/`target`
  is satisfied by the solution (incl. division integer quotient and subtraction absolute
  difference); `solution` is `size × size`; `schemaVersion` is the expected value.
- **Engine unit tests:** conflict detection (row/col duplicates, cage violations),
  win-condition detection, undo/redo correctness, pencil-mark behavior, auto-clear on
  value placement, hint-count increment, pause/resume timer behavior.
- **Route handler tests:** `GET /api/kenken/puzzle` returns a valid puzzle for each
  level; `id` returns the exact puzzle; `exclude` prefers unseen ids and falls back when
  the tier pool is exhausted. **Error cases:** `400` for missing/invalid `level` (no
  `id`), `404` for an unknown `id`, `503` for an empty tier library.
- **Persistence tests:** save/restore round-trips through localStorage; resume matches
  prior state; served-id tracking accumulates per level; today's-daily stickiness
  (same id within a date, new id on date change); share-URL puzzle id resolves to the
  correct puzzle.
- **Verification — development iteration:** `bun test`, `bun run lint`, `bun run build`
  (fast; does not reinstall dependencies).
- **Verification — final/pre-merge:** `bun run format` then `bun run check` (which runs
  clean + lint + build + audit; note `clean` wipes `node_modules` and reinstalls, so
  reserve it for final verification, not normal iteration).
- **Manual UI verification:** play on desktop and a mobile viewport — keyboard and
  on-screen pad, notes, undo/redo, check, hints, pause/resume, first-time overlay, win
  flow, resume after refresh.

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
    validate.ts                 # library validation (cells/cages/targets/solution)
    puzzle-loader.ts            # server-side selection by id / tier + exclude (static JSON import)
    puzzle-client.ts            # client fetch helper for /api/kenken/puzzle
    puzzles/
      easy.json                 # KenKenLibrary { schemaVersion, difficulty, puzzles[] }
      intermediate.json
      hard.json
      genius.json
  components/games/kenken/      # client game UI (grid, cage borders, number pad, controls, timer, pause, hint counter, how-to-play overlay, win)
  app/api/kenken/puzzle/
    route.ts                    # GET handler: returns one puzzle (level/id/exclude); 400/404/503
  app/(site)/brain-boost/
    page.tsx                    # Storyblok hub landing (borrows landing styling; standalone accent)
    kenken/
      page.tsx                  # Storyblok info/rules/levels page
      play/page.tsx             # server shell -> client game (level select + free play)
      daily/page.tsx            # server shell -> client game (sticky daily Intermediate)
```

Brain Boost defines its **own accent** within the section (e.g. a constant beside the
landing components) and is **not** added to `src/lib/pillars.ts` (`PillarKey` /
`pillarAccents` are unchanged). "Brain Boost" is added to the header and footer nav lists.

(Exact filenames/organization may be refined during planning, following existing
project conventions.)

---

## 13. Resolved Decisions & Open Items

**Resolved (from review)**

- **Display name:** "Brain Boost" (two words) in UI/nav/footer; slug `/brain-boost`.
- **Section model:** separate games section, **not** a pillar (no `pillars.ts` change).
- **Daily:** per-device sticky — same Intermediate puzzle all day, new one next day.
- **Repeat avoidance:** exclude every puzzle **served/started** (not just completed).
- **Hints:** unlimited, with a visible used-count per puzzle.
- **Library size:** ~50 puzzles per tier for launch.
- **Operations:** standard rules (subtraction = absolute difference; division =
  larger ÷ smaller, integer only); data uses `+ - * /`, UI shows `+ − × ÷`.
- **Pause/resume:** included. **How-to-play overlay:** included (first-time, localStorage).
- **Large mobile grids:** shrink to fit viewport width.
- **Loading:** server-side static JSON import (not `fs`).
- **Share scope:** share a *puzzle* by id, not live in-progress state.

**Still open (resolve during planning)**

- **Storyblok content types** — the hub and the kenken info page need new Storyblok
  components/stories; field design happens at planning time.
- **Standalone accent values** — the exact Brain Boost gradient/accent pair.

---

## 14. Acceptance Checklist (product-level)

The first implementation is done when all of these pass (desktop + mobile):

- [ ] Navigate to `/brain-boost`; the hub lists KenKen and links to it.
- [ ] `/brain-boost/kenken` explains the game, rules, and levels, and links to play/daily.
- [ ] On `/play`, select a level → a puzzle of that level loads and is playable.
- [ ] Fill cells via the **on-screen number pad** and via the **keyboard**; both work.
- [ ] Pencil marks, undo/redo, mistake-check, hints (with used-count), and pause/resume
      all work.
- [ ] First-ever game shows the how-to-play overlay; it does not reappear after dismissal.
- [ ] Refresh mid-puzzle → progress, timer, and hint count **resume**.
- [ ] Completing a puzzle shows the win state with solve time and a share affordance.
- [ ] Completion offers **New game (same level)** and **Change level**; "New game"
      avoids already-served puzzles for that level.
- [ ] A shared URL (`?puzzle=<id>`) opens the **exact** puzzle.
- [ ] `/daily` shows an Intermediate puzzle; refreshing the same day keeps the **same**
      puzzle; a new day yields a new one.
- [ ] On a phone, an 8×8/9×9 grid **fits the screen** (shrinks to width) and stays usable.
- [ ] API returns `400` (bad level), `404` (unknown id), `503` (empty tier) appropriately.
