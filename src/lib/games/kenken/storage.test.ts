// src/lib/games/kenken/storage.test.ts
/// <reference types="bun-types" />
import { beforeEach, describe, expect, test } from "bun:test";
import { createEmptyGrid, setCellValue } from "./engine";
import {
  addServedId,
  clearProgress,
  getDaily,
  getHowToSeen,
  getLastLevel,
  getServedIds,
  loadProgress,
  saveProgress,
  setDaily,
  setHowToSeen,
  setLastLevel,
} from "./storage";

// Minimal in-memory Storage stand-in.
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

let store: Storage;
beforeEach(() => {
  store = memoryStorage();
});

describe("progress", () => {
  test("round-trips grid, elapsed, and hint count by puzzle id", () => {
    let grid = createEmptyGrid(3);
    grid = setCellValue(grid, [0, 0], 2, []);
    saveProgress(
      { elapsedSeconds: 30, grid, hintsUsed: 1, puzzleId: "k3-easy-1" },
      store
    );
    const loaded = loadProgress("k3-easy-1", store);
    expect(loaded?.elapsedSeconds).toBe(30);
    expect(loaded?.hintsUsed).toBe(1);
    expect(loaded?.grid[0][0].value).toBe(2);
  });

  test("loadProgress returns null for a different id or corrupt data", () => {
    saveProgress(
      {
        elapsedSeconds: 0,
        grid: createEmptyGrid(2),
        hintsUsed: 0,
        puzzleId: "a",
      },
      store
    );
    expect(loadProgress("b", store)).toBeNull();
  });

  test("saving a new puzzle's progress replaces the previous slot", () => {
    saveProgress(
      {
        elapsedSeconds: 1,
        grid: createEmptyGrid(2),
        hintsUsed: 0,
        puzzleId: "a",
      },
      store
    );
    saveProgress(
      {
        elapsedSeconds: 2,
        grid: createEmptyGrid(2),
        hintsUsed: 0,
        puzzleId: "b",
      },
      store
    );
    expect(loadProgress("a", store)).toBeNull();
    expect(loadProgress("b", store)?.elapsedSeconds).toBe(2);
  });

  test("clearProgress removes the slot", () => {
    saveProgress(
      {
        elapsedSeconds: 1,
        grid: createEmptyGrid(2),
        hintsUsed: 0,
        puzzleId: "a",
      },
      store
    );
    clearProgress(store);
    expect(loadProgress("a", store)).toBeNull();
  });
});

describe("daily", () => {
  test("stores and reads { date, puzzleId }", () => {
    setDaily({ date: "2026-05-24", puzzleId: "k4-intermediate-3" }, store);
    expect(getDaily(store)).toEqual({
      date: "2026-05-24",
      puzzleId: "k4-intermediate-3",
    });
  });

  test("getDaily returns null when unset", () => {
    expect(getDaily(store)).toBeNull();
  });
});

describe("served ids", () => {
  test("accumulates per level without duplicates", () => {
    addServedId("easy", "a", store);
    addServedId("easy", "a", store);
    addServedId("easy", "b", store);
    addServedId("hard", "z", store);
    expect(
      getServedIds("easy", store).sort((a, b) => a.localeCompare(b))
    ).toEqual(["a", "b"]);
    expect(getServedIds("hard", store)).toEqual(["z"]);
  });

  test("getServedIds returns [] for an untouched level", () => {
    expect(getServedIds("genius", store)).toEqual([]);
  });
});

describe("last level + how-to-seen", () => {
  test("last level round-trips, defaults null", () => {
    expect(getLastLevel(store)).toBeNull();
    setLastLevel("hard", store);
    expect(getLastLevel(store)).toBe("hard");
  });

  test("how-to-seen flag round-trips, defaults false", () => {
    expect(getHowToSeen(store)).toBe(false);
    setHowToSeen(store);
    expect(getHowToSeen(store)).toBe(true);
  });
});
