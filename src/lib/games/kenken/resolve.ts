import { isDifficulty } from "./difficulty";
import { selectRandom } from "./puzzle-loader";
import type { Rng } from "./rng";
import type { Difficulty, KenKenPuzzle } from "./types";

export interface PuzzleRequestParams {
  exclude: string[];
  id: string | null;
  level: string | null;
  /** If set, only return puzzles of this grid size within the requested level. */
  size?: number | null;
}

export interface PuzzleLookup {
  byId: (id: string) => KenKenPuzzle | null;
  byLevel: (level: Difficulty) => KenKenPuzzle[];
}

export interface ResolvedResponse {
  body: KenKenPuzzle | { error: string };
  status: number;
}

export function resolvePuzzleRequest(
  params: PuzzleRequestParams,
  lookup: PuzzleLookup,
  rng: Rng = Math.random
): ResolvedResponse {
  if (params.id) {
    const puzzle = lookup.byId(params.id);
    return puzzle
      ? { body: puzzle, status: 200 }
      : { body: { error: "puzzle not found" }, status: 404 };
  }

  if (!isDifficulty(params.level)) {
    return { body: { error: "invalid level" }, status: 400 };
  }

  const all = lookup.byLevel(params.level);
  const noSizeFilter = params.size === null || params.size === undefined;
  const puzzles = noSizeFilter
    ? all
    : all.filter((p) => p.size === params.size);
  if (puzzles.length === 0) {
    return { body: { error: "no puzzles available" }, status: 503 };
  }

  const puzzle = selectRandom(puzzles, params.exclude, rng);
  if (!puzzle) {
    return { body: { error: "no puzzles available" }, status: 503 };
  }
  return { body: puzzle, status: 200 };
}
