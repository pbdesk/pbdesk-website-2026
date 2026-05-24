import type { Cage, Cell, Operation } from "./types";

const OPERATOR_GLYPHS: Record<Operation, string> = {
  "+": "+",
  "-": "−", // −
  "*": "×", // ×
  "/": "÷", // ÷
  "=": "",
};

export function operationSymbol(op: Operation): string {
  return OPERATOR_GLYPHS[op];
}

export function cageLabel(cage: Cage): string {
  if (cage.op === "=") {
    return String(cage.target);
  }
  return `${cage.target}${operationSymbol(cage.op)}`;
}

/** The cell that displays the cage's label: smallest row, then smallest col. */
export function cageLabelCell(cage: Cage): Cell {
  let best = cage.cells[0];
  for (const [r, c] of cage.cells) {
    const [br, bc] = best;
    if (r < br || (r === br && c < bc)) {
      best = [r, c];
    }
  }
  return best;
}
