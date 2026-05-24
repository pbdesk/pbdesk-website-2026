// src/components/games/kenken/grid.tsx
"use client";

import { useMemo } from "react";
import { computeCageBorders } from "@/lib/games/kenken/cage-borders";
import { cageLabel, cageLabelCell } from "@/lib/games/kenken/display";
import { cageConflicts, rowColConflicts } from "@/lib/games/kenken/engine";
import type { GameState } from "@/lib/games/kenken/runtime-types";
import type { Cell as CellPos } from "@/lib/games/kenken/types";
import Cell from "./cell";

const LARGE_GRID_THRESHOLD = 8; // hide in-cell notes at 8×8 and up

interface GridProps {
  onKeyAction: (event: React.KeyboardEvent) => void;
  onSelect: (cell: CellPos) => void;
  state: GameState;
}

export default function Grid({ state, onSelect, onKeyAction }: GridProps) {
  const { puzzle, grid, selected, revealedMistakes, ruleCheckOn } = state;
  const size = puzzle.size;

  const borders = useMemo(
    () => computeCageBorders(size, puzzle.cages),
    [size, puzzle.cages]
  );

  // Map each cell to the cage label it should show (only on the label cell).
  const labelByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const cage of puzzle.cages) {
      const [lr, lc] = cageLabelCell(cage);
      map.set(`${lr},${lc}`, cageLabel(cage));
    }
    return map;
  }, [puzzle.cages]);

  const conflicts = useMemo(() => {
    if (!ruleCheckOn) {
      return new Set<string>();
    }
    const set = rowColConflicts(grid);
    for (const k of cageConflicts(grid, puzzle.cages)) {
      set.add(k);
    }
    return set;
  }, [grid, puzzle.cages, ruleCheckOn]);

  const mistakeKeys = useMemo(
    () => new Set(revealedMistakes.map(([r, c]) => `${r},${c}`)),
    [revealedMistakes]
  );

  const selectedValue =
    selected && grid[selected[0]][selected[1]].value !== null
      ? grid[selected[0]][selected[1]].value
      : null;

  const peerKeys = useMemo(() => {
    if (!selected) {
      return new Set<string>();
    }
    const [sr, sc] = selected;
    const set = new Set<string>();
    for (let i = 0; i < size; i++) {
      set.add(`${sr},${i}`);
      set.add(`${i},${sc}`);
    }
    const cage = puzzle.cages.find((cg) =>
      cg.cells.some(([r, c]) => r === sr && c === sc)
    );
    if (cage) {
      for (const [r, c] of cage.cells) {
        set.add(`${r},${c}`);
      }
    }
    return set;
  }, [selected, size, puzzle.cages]);

  const hideNotes = size >= LARGE_GRID_THRESHOLD;

  return (
    // biome-ignore lint/a11y/useSemanticElements: grid role models the board for AT
    <div
      aria-label={`KenKen ${size} by ${size} grid`}
      className="mx-auto w-full max-w-[min(92vw,32rem)] select-none"
      onKeyDown={onKeyAction}
      role="grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${size}, 1fr)`,
      }}
      tabIndex={0}
    >
      {grid.map((row, r) =>
        row.map((cellState, c) => {
          const k = `${r},${c}`;
          return (
            <Cell
              borders={borders[r][c]}
              conflict={conflicts.has(k)}
              given={cellState.given}
              hideNotes={hideNotes}
              key={k}
              label={labelByKey.get(k) ?? null}
              mistake={mistakeKeys.has(k)}
              onSelect={() => onSelect([r, c])}
              peerHighlight={peerKeys.has(k)}
              sameValueHighlight={
                selectedValue !== null &&
                cellState.value === selectedValue &&
                !(selected?.[0] === r && selected?.[1] === c)
              }
              selected={selected?.[0] === r && selected?.[1] === c}
              state={cellState}
            />
          );
        })
      )}
    </div>
  );
}
