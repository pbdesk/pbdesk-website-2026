// src/lib/games/kenken/reducer.ts
import {
  clearCell,
  cloneGrid,
  createEmptyGrid,
  isSolved,
  mistakeCells,
  setCellValue,
} from "./engine";
import type { GameAction, GameGrid, GameState } from "./runtime-types";
import type { Cell, KenKenPuzzle } from "./types";

export function createInitialState(
  puzzle: KenKenPuzzle,
  freebies: Cell[] = []
): GameState {
  const grid = createEmptyGrid(puzzle.size);
  for (const [r, c] of freebies) {
    grid[r][c] = { given: true, value: puzzle.solution[r][c] };
  }
  return {
    puzzle,
    freebies,
    grid,
    selected: null,
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
  const next = setCellValue(state.grid, state.selected, digit);
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
  // Only target the selected cell if it is actually empty; otherwise find the first empty cell.
  const sel = state.selected;
  const selectedIsEmpty =
    sel !== null &&
    state.grid[sel[0]][sel[1]].value === null &&
    !state.grid[sel[0]][sel[1]].given;
  const target = selectedIsEmpty ? sel : firstEmptyCell(state);
  if (!target) {
    return state;
  }
  const [r, c] = target;
  const correct = state.puzzle.solution[r][c];
  const next = setCellValue(state.grid, target, correct);
  next[r][c] = { ...next[r][c], hinted: true };
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
    grid[r][c] = { given: true, value: state.puzzle.solution[r][c] };
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
    case "clearRevealedMistakes":
      return { ...state, revealedMistakes: [] };
    case "toggleRuleCheck":
      return { ...state, ruleCheckOn: !state.ruleCheckOn };
    case "tick":
      return state.paused || state.status === "won"
        ? state
        : { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    case "setPaused":
      return { ...state, paused: action.paused };
    case "reset":
      return createInitialState(state.puzzle, state.freebies);
    case "restore":
      return applyRestore(state, action);
    default:
      return state;
  }
}
