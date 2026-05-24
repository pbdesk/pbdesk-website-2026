// src/components/games/kenken/cell-status-bar.tsx
"use client";

import { cageLabel } from "@/lib/games/kenken/display";
import type { GameState } from "@/lib/games/kenken/runtime-types";

interface CellStatusBarProps {
  state: GameState;
}

export default function CellStatusBar({ state }: CellStatusBarProps) {
  const { selected, grid, puzzle } = state;

  if (!selected) {
    return (
      <div
        className="flex min-h-12 items-center justify-center rounded-xl px-4 text-sm"
        style={{ background: "var(--bg-subtle)", color: "var(--fg-muted)" }}
      >
        Select a cell to begin
      </div>
    );
  }

  const [r, c] = selected;
  const cell = grid[r][c];
  const cage = puzzle.cages.find((cg) =>
    cg.cells.some(([cr, cc]) => cr === r && cc === c)
  );

  return (
    <div
      className="flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-2"
      style={{ background: "var(--bg-subtle)" }}
    >
      <span
        className="font-semibold text-sm"
        style={{ color: "var(--fg-secondary)" }}
      >
        Cage:{" "}
        <span style={{ color: "var(--fg-primary)" }}>
          {cage ? cageLabel(cage) : "—"}
        </span>
      </span>
      <span className="text-sm" style={{ color: "var(--fg-secondary)" }}>
        Value:{" "}
        <span className="font-semibold" style={{ color: "var(--fg-primary)" }}>
          {cell.value ?? "—"}
        </span>
      </span>
    </div>
  );
}
