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
