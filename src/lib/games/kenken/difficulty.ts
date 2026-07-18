import type { Difficulty, Operation } from "./types";

export interface TierVariant {
  ops: Operation[]; // multi-cell ops allowed; "-"/"/" restricted to 2-cell cages
  size: number;
}

export interface TierConfig {
  maxCageSize: number;
  variants: TierVariant[];
}

export const DIFFICULTIES: Difficulty[] = [
  "easy",
  "intermediate",
  "hard",
  "genius",
];

const ALL_OPS: Operation[] = ["+", "-", "*", "/"];
const NO_DIVISION: Operation[] = ["+", "-", "*"];

export const TIERS: Record<Difficulty, TierConfig> = {
  easy: {
    maxCageSize: 3,
    variants: [
      { ops: ALL_OPS, size: 3 },
      { ops: NO_DIVISION, size: 4 },
      { ops: NO_DIVISION, size: 5 },
    ],
  },
  genius: {
    maxCageSize: 5,
    variants: [
      { ops: ALL_OPS, size: 6 },
      { ops: ALL_OPS, size: 7 },
      { ops: NO_DIVISION, size: 8 },
      { ops: NO_DIVISION, size: 9 },
    ],
  },
  hard: {
    maxCageSize: 4,
    variants: [
      { ops: NO_DIVISION, size: 6 },
      { ops: NO_DIVISION, size: 7 },
    ],
  },
  intermediate: {
    maxCageSize: 4,
    variants: [
      { ops: ALL_OPS, size: 4 },
      { ops: ALL_OPS, size: 5 },
    ],
  },
};

export function isDifficulty(value: unknown): value is Difficulty {
  return (
    typeof value === "string" && (DIFFICULTIES as string[]).includes(value)
  );
}
