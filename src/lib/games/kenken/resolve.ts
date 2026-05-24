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
      ? { status: 200, body: puzzle }
      : { status: 404, body: { error: "puzzle not found" } };
  }

  if (!isDifficulty(params.level)) {
    return { status: 400, body: { error: "invalid level" } };
  }

  const all = lookup.byLevel(params.level);
  const puzzles =
    params.size == null ? all : all.filter((p) => p.size === params.size);
  if (puzzles.length === 0) {
    return { status: 503, body: { error: "no puzzles available" } };
  }

  const puzzle = selectRandom(puzzles, params.exclude, rng);
  if (!puzzle) {
    return { status: 503, body: { error: "no puzzles available" } };
  }
  return { status: 200, body: puzzle };
}
