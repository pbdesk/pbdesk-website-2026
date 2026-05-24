// src/lib/games/kenken/reducer.ts
import {
  clearCell,
  cloneGrid,
  createEmptyGrid,
  isSolved,
  mistakeCells,
  setCellValue,
  toggleCellNote,
} from "./engine";
import type { GameAction, GameGrid, GameState } from "./runtime-types";
import { INITIAL_INPUT_MODE } from "./runtime-types";
import type { Cell, KenKenPuzzle } from "./types";

export function createInitialState(
  puzzle: KenKenPuzzle,
  freebies: Cell[] = []
): GameState {
  const grid = createEmptyGrid(puzzle.size);
  for (const [r, c] of freebies) {
    grid[r][c] = { given: true, value: puzzle.solution[r][c], notes: [] };
  }
  return {
    puzzle,
    freebies,
    grid,
    selected: null,
    mode: INITIAL_INPUT_MODE,
    undoStack: [],
    redoStack: [],
    hintsUsed: 0,
    revealedMistakes: [],
    ruleCheckOn: true,
    elapsedSeconds: 0,
    paused: false,
    status: "playing",
  };
}

// Apply a grid mutation with undo bookkeeping + win recompute.
function commitGrid(state: GameState, nextGrid: GameGrid): GameState {
  const status = isSolved(nextGrid, state.puzzle.size, state.puzzle.cages)
    ? "won"
    : "playing";
  return {
    ...state,
    grid: nextGrid,
    undoStack: [...state.undoStack, state.grid],
    redoStack: [],
    revealedMistakes: [],
    status,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function applyInput(state: GameState, digit: number): GameState {
  if (!state.selected || digit < 1 || digit > state.puzzle.size) {
    return state;
  }
  const [r, c] = state.selected;
  if (state.grid[r][c].given) {
    return state;
  }
  const next =
    state.mode === "note"
      ? toggleCellNote(state.grid, state.selected, digit)
      : setCellValue(state.grid, state.selected, digit, state.puzzle.cages);
  return commitGrid(state, next);
}

function applyClear(state: GameState): GameState {
  if (!state.selected) {
    return state;
  }
  const [r, c] = state.selected;
  if (state.grid[r][c].given) {
    return state;
  }
  return commitGrid(state, clearCell(state.grid, state.selected));
}

function firstEmptyCell(state: GameState): Cell | null {
  for (let r = 0; r < state.puzzle.size; r++) {
    for (let c = 0; c < state.puzzle.size; c++) {
      const cell = state.grid[r][c];
      if (cell.value === null && !cell.given) {
        return [r, c];
      }
    }
  }
  return null;
}

function applyHint(state: GameState): GameState {
  const target = state.selected ?? firstEmptyCell(state);
  if (!target) {
    return state;
  }
  const [r, c] = target;
  if (state.grid[r][c].given) {
    return state;
  }
  const correct = state.puzzle.solution[r][c];
  const next = setCellValue(state.grid, target, correct, state.puzzle.cages);
  return {
    ...commitGrid(state, next),
    selected: target,
    hintsUsed: state.hintsUsed + 1,
  };
}

function applyRestore(
  state: GameState,
  action: Extract<GameAction, { type: "restore" }>
): GameState {
  const grid = cloneGrid(action.grid);
  // Re-stamp given cells so freebies survive a progress restore from old saves.
  for (const [r, c] of state.freebies) {
    grid[r][c] = { given: true, value: state.puzzle.solution[r][c], notes: [] };
  }
  return {
    ...state,
    grid,
    elapsedSeconds: action.elapsedSeconds,
    hintsUsed: action.hintsUsed,
    undoStack: [],
    redoStack: [],
    revealedMistakes: [],
    status: isSolved(grid, state.puzzle.size, state.puzzle.cages)
      ? "won"
      : "playing",
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "select":
      return { ...state, selected: action.cell };
    case "move": {
      const [r, c] = state.selected ?? [0, 0];
      const size = state.puzzle.size;
      return {
        ...state,
        selected: [
          clamp(r + action.dRow, 0, size - 1),
          clamp(c + action.dCol, 0, size - 1),
        ],
      };
    }
    case "input":
      return applyInput(state, action.digit);
    case "clear":
      return applyClear(state);
    case "setMode":
      return { ...state, mode: action.mode };
    case "toggleMode":
      return { ...state, mode: state.mode === "value" ? "note" : "value" };
    case "undo": {
      if (state.undoStack.length === 0) {
        return state;
      }
      const prev = state.undoStack.at(-1) as GameGrid;
      return {
        ...state,
        grid: prev,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.grid],
        revealedMistakes: [],
        status: isSolved(prev, state.puzzle.size, state.puzzle.cages)
          ? "won"
          : "playing",
      };
    }
    case "redo": {
      if (state.redoStack.length === 0) {
        return state;
      }
      const next = state.redoStack.at(-1) as GameGrid;
      return {
        ...state,
        grid: next,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state.grid],
        revealedMistakes: [],
        status: isSolved(next, state.puzzle.size, state.puzzle.cages)
          ? "won"
          : "playing",
      };
    }
    case "hint":
      return applyHint(state);
    case "revealMistakes":
      return {
        ...state,
        revealedMistakes: mistakeCells(state.grid, state.puzzle.solution),
      };
    case "toggleRuleCheck":
      return { ...state, ruleCheckOn: !state.ruleCheckOn };
    case "tick":
      return state.paused || state.status === "won"
        ? state
        : { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    case "setPaused":
      return { ...state, paused: action.paused };
    case "restore":
      return applyRestore(state, action);
    default:
      return state;
  }
}
