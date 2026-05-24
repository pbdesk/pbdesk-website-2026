import type { Cell, KenKenPuzzle } from "./types";

export type CellValue = number | null;

export interface CellState {
  notes: number[]; // candidate digits, ascending; empty when none
  value: CellValue;
}

export type GameGrid = CellState[][]; // size × size

export type InputMode = "value" | "note";
export type GameStatus = "playing" | "won";

export const INITIAL_INPUT_MODE: InputMode = "value";

export interface GameState {
  elapsedSeconds: number;
  grid: GameGrid;
  hintsUsed: number;
  mode: InputMode;
  paused: boolean;
  puzzle: KenKenPuzzle;
  redoStack: GameGrid[];
  /** Cells flagged by the last "reveal mistakes" action; cleared on next edit. */
  revealedMistakes: Cell[];
  /** When true, the UI highlights row/col duplicates + cage violations live. */
  ruleCheckOn: boolean;
  selected: Cell | null;
  status: GameStatus;
  undoStack: GameGrid[];
}

export type BorderWeight = "thick" | "thin";

export interface CellBorders {
  bottom: BorderWeight;
  left: BorderWeight;
  right: BorderWeight;
  top: BorderWeight;
}

export type GameAction =
  | { type: "select"; cell: Cell }
  | { type: "move"; dRow: number; dCol: number }
  | { type: "input"; digit: number }
  | { type: "clear" }
  | { type: "setMode"; mode: InputMode }
  | { type: "toggleMode" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "hint" }
  | { type: "revealMistakes" }
  | { type: "toggleRuleCheck" }
  | { type: "tick" }
  | { type: "setPaused"; paused: boolean }
  | {
      type: "restore";
      grid: GameGrid;
      elapsedSeconds: number;
      hintsUsed: number;
    };
