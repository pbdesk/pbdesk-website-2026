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
    cages: [{ cells: [[0, 0]], op: "=", target: 1 }],
    difficulty: "easy",
    id,
    size: 3,
    solution: [
      [1, 2, 3],
      [2, 3, 1],
      [3, 1, 2],
    ],
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
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
    const result = await fetchPuzzleByLevel("easy", ["x", "y"], {
      fetchImpl: fakeFetch,
    });
    expect(result.id).toBe("k3-easy-1");
    expect(seenUrl).toContain("level=easy");
    expect(seenUrl).toContain("exclude=x%2Cy");
  });

  test("throws on a non-OK response", async () => {
    const fakeFetch: typeof fetch = () =>
      Promise.resolve(jsonResponse({ error: "no puzzles available" }, 503));
    await expect(
      fetchPuzzleByLevel("easy", [], { fetchImpl: fakeFetch })
    ).rejects.toThrow();
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
