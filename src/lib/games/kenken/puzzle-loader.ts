import easy from "./puzzles/easy.json";
import genius from "./puzzles/genius.json";
import hard from "./puzzles/hard.json";
import intermediate from "./puzzles/intermediate.json";
import type { Rng } from "./rng";
import type { Difficulty, KenKenLibrary, KenKenPuzzle } from "./types";

const LIBRARIES: Record<Difficulty, KenKenLibrary> = {
  easy: easy as KenKenLibrary,
  genius: genius as KenKenLibrary,
  hard: hard as KenKenLibrary,
  intermediate: intermediate as KenKenLibrary,
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
