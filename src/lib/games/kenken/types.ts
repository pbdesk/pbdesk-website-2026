export type Operation = "+" | "-" | "*" | "/" | "=";

export type Difficulty = "easy" | "intermediate" | "hard" | "genius";

// 0-indexed [row, col]
export type Cell = [row: number, col: number];

export interface Cage {
  cells: Cell[];
  op: Operation;
  target: number;
}

export interface KenKenPuzzle {
  cages: Cage[];
  difficulty: Difficulty;
  id: string;
  size: number;
  solution: number[][];
}

export interface KenKenLibrary {
  difficulty: Difficulty;
  puzzles: KenKenPuzzle[];
  schemaVersion: number;
}

export const SCHEMA_VERSION = 1;
