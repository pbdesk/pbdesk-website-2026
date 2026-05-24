import { mulberry32, shuffle } from "./rng";
import type { Cell, KenKenPuzzle } from "./types";

export const FREEBIE_COUNT: Record<number, number> = {
  3: 3,
  4: 5,
  5: 8,
  6: 11,
  7: 15,
  8: 20,
  9: 25,
};

// djb2-variant hash: deterministic string → unsigned 32-bit seed for mulberry32.
export function idToSeed(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    // biome-ignore lint/suspicious/noBitwiseOperators: djb2 hash requires bitwise ops
    h = (Math.imul(h, 33) ^ id.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Select freebie cells for a puzzle deterministically from its id.
 *
 * Algorithm (two-phase, spread guarantee):
 *  Phase 1 — iterate a seeded shuffle of all cells; pick any cell whose row or
 *             column hasn't been covered yet.  Stops once every row AND column
 *             has at least one freebie.
 *  Phase 2 — continue picking from the same shuffle (skipping already-picked
 *             cells) until the target count for this grid size is reached.
 *
 * Same puzzle id always produces the same freebie positions.
 */
export function selectFreebies(puzzle: KenKenPuzzle): Cell[] {
  const { size } = puzzle;
  const target = FREEBIE_COUNT[size] ?? 0;
  if (target === 0) {
    return [];
  }

  const rng = mulberry32(idToSeed(puzzle.id));

  const allCells: Cell[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      allCells.push([r, c]);
    }
  }
  const shuffled = shuffle(rng, allCells);

  const picked: Cell[] = [];
  const pickedKeys = new Set<string>();
  const uncoveredRows = new Set<number>(
    Array.from({ length: size }, (_, i) => i)
  );
  const uncoveredCols = new Set<number>(
    Array.from({ length: size }, (_, i) => i)
  );

  // Phase 1: ensure every row and column has at least one freebie.
  for (const [r, c] of shuffled) {
    if (uncoveredRows.size === 0 && uncoveredCols.size === 0) {
      break;
    }
    if (uncoveredRows.has(r) || uncoveredCols.has(c)) {
      picked.push([r, c]);
      pickedKeys.add(`${r},${c}`);
      uncoveredRows.delete(r);
      uncoveredCols.delete(c);
    }
  }

  // Phase 2: fill to target count.
  for (const [r, c] of shuffled) {
    if (picked.length >= target) {
      break;
    }
    const k = `${r},${c}`;
    if (!pickedKeys.has(k)) {
      picked.push([r, c]);
      pickedKeys.add(k);
    }
  }

  return picked;
}
