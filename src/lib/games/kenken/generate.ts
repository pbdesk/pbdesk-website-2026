// src/lib/games/kenken/generate.ts
import { assignCage, partitionCages } from "./cages";
import { TIERS } from "./difficulty";
import { generateLatinSquare } from "./latin-square";
import { type Rng, randInt } from "./rng";
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
