import type { CellBorders } from "./runtime-types";
import type { Cage } from "./types";

/** map[r][c] = index of the cage that owns cell (r,c). */
export function buildCellCageMap(size: number, cages: Cage[]): number[][] {
  const map: number[][] = Array.from({ length: size }, () =>
    new Array<number>(size).fill(-1)
  );
  for (let i = 0; i < cages.length; i++) {
    for (const [r, c] of cages[i].cells) {
      map[r][c] = i;
    }
  }
  return map;
}

/**
 * For each cell, an edge is "thick" when the neighbour across it belongs to a
 * different cage or lies outside the grid; otherwise "thin". This reproduces
 * KenKen cage outlines for arbitrary (incl. L-shaped) cage shapes.
 */
export function computeCageBorders(
  size: number,
  cages: Cage[]
): CellBorders[][] {
  const map = buildCellCageMap(size, cages);
  const sameCage = (
    r1: number,
    c1: number,
    r2: number,
    c2: number
  ): boolean => {
    if (r2 < 0 || r2 >= size || c2 < 0 || c2 >= size) {
      return false;
    }
    return map[r1][c1] === map[r2][c2];
  };

  const result: CellBorders[][] = [];
  for (let r = 0; r < size; r++) {
    const row: CellBorders[] = [];
    for (let c = 0; c < size; c++) {
      row.push({
        top: sameCage(r, c, r - 1, c) ? "thin" : "thick",
        right: sameCage(r, c, r, c + 1) ? "thin" : "thick",
        bottom: sameCage(r, c, r + 1, c) ? "thin" : "thick",
        left: sameCage(r, c, r, c - 1) ? "thin" : "thick",
      });
    }
    result.push(row);
  }
  return result;
}
