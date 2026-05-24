// src/lib/games/kenken/storage.ts
import { cloneGrid } from "./engine";
import type { GameGrid } from "./runtime-types";
import type { Difficulty } from "./types";

const NS = "bb:kenken:v1";
const PROGRESS_KEY = `${NS}:progress`;
const DAILY_KEY = `${NS}:daily`;
const LAST_LEVEL_KEY = `${NS}:lastLevel`;
const HOWTO_KEY = `${NS}:howtoSeen`;
const servedKey = (level: Difficulty): string => `${NS}:served:${level}`;

function getStore(provided?: Storage): Storage | null {
  if (provided) {
    return provided;
  }
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readJson<T>(store: Storage | null, key: string): T | null {
  if (!store) {
    return null;
  }
  const raw = store.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(store: Storage | null, key: string, value: unknown): void {
  if (!store) {
    return;
  }
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or serialization failure: persistence is best-effort.
  }
}

export interface ProgressRecord {
  elapsedSeconds: number;
  grid: GameGrid;
  hintsUsed: number;
  puzzleId: string;
}

export function saveProgress(record: ProgressRecord, store?: Storage): void {
  writeJson(getStore(store), PROGRESS_KEY, {
    puzzleId: record.puzzleId,
    grid: record.grid,
    elapsedSeconds: record.elapsedSeconds,
    hintsUsed: record.hintsUsed,
  });
}

export function loadProgress(
  puzzleId: string,
  store?: Storage
): ProgressRecord | null {
  const data = readJson<ProgressRecord>(getStore(store), PROGRESS_KEY);
  if (!data || data.puzzleId !== puzzleId || !Array.isArray(data.grid)) {
    return null;
  }
  return {
    puzzleId: data.puzzleId,
    grid: cloneGrid(data.grid as GameGrid),
    elapsedSeconds: Number(data.elapsedSeconds) || 0,
    hintsUsed: Number(data.hintsUsed) || 0,
  };
}

export function clearProgress(store?: Storage): void {
  getStore(store)?.removeItem(PROGRESS_KEY);
}

export interface DailyRecord {
  date: string;
  puzzleId: string;
}

export function setDaily(record: DailyRecord, store?: Storage): void {
  writeJson(getStore(store), DAILY_KEY, record);
}

export function getDaily(store?: Storage): DailyRecord | null {
  const data = readJson<DailyRecord>(getStore(store), DAILY_KEY);
  if (
    !data ||
    typeof data.date !== "string" ||
    typeof data.puzzleId !== "string"
  ) {
    return null;
  }
  return data;
}

export function getServedIds(level: Difficulty, store?: Storage): string[] {
  const data = readJson<string[]>(getStore(store), servedKey(level));
  return Array.isArray(data) ? data.filter((x) => typeof x === "string") : [];
}

export function addServedId(
  level: Difficulty,
  id: string,
  store?: Storage
): void {
  const set = new Set(getServedIds(level, store));
  set.add(id);
  writeJson(getStore(store), servedKey(level), [...set]);
}

export function getLastLevel(store?: Storage): Difficulty | null {
  const value = getStore(store)?.getItem(LAST_LEVEL_KEY);
  return value === "easy" ||
    value === "intermediate" ||
    value === "hard" ||
    value === "genius"
    ? value
    : null;
}

export function setLastLevel(level: Difficulty, store?: Storage): void {
  getStore(store)?.setItem(LAST_LEVEL_KEY, level);
}

export function getHowToSeen(store?: Storage): boolean {
  return getStore(store)?.getItem(HOWTO_KEY) === "1";
}

export function setHowToSeen(store?: Storage): void {
  getStore(store)?.setItem(HOWTO_KEY, "1");
}
