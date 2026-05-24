// src/components/games/kenken/cell.tsx
"use client";

import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import type { CellBorders, CellState } from "@/lib/games/kenken/runtime-types";

const THICK = "2.5px";
const THIN = "1px";

function borderValue(weight: "thick" | "thin"): string {
  const width = weight === "thick" ? THICK : THIN;
  const color =
    weight === "thick" ? "var(--fg-primary)" : "var(--border-subtle)";
  return `${width} solid ${color}`;
}

interface CellProps {
  borders: CellBorders;
  conflict: boolean;
  hideNotes: boolean;
  label: string | null;
  mistake: boolean;
  onSelect: () => void;
  peerHighlight: boolean;
  sameValueHighlight: boolean;
  selected: boolean;
  state: CellState;
}

export default function Cell({
  state,
  borders,
  label,
  selected,
  conflict,
  mistake,
  sameValueHighlight,
  peerHighlight,
  hideNotes,
  onSelect,
}: CellProps) {
  let background = "var(--bg-page)";
  if (peerHighlight) {
    background = "var(--bg-subtle)";
  }
  if (sameValueHighlight) {
    background = "color-mix(in srgb, var(--fg-brand) 12%, transparent)";
  }
  if (selected) {
    background = `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 22%, transparent)`;
  }

  let valueColor = "var(--fg-primary)";
  if (conflict || mistake) {
    valueColor = "#dc2626"; // red-600 — color is not the sole signal (also ring)
  }

  return (
    <button
      aria-label={
        label
          ? `Cell, cage ${label}${state.value ? `, value ${state.value}` : ", empty"}`
          : `Cell${state.value ? `, value ${state.value}` : ", empty"}`
      }
      aria-pressed={selected}
      className="relative flex aspect-square items-center justify-center"
      onClick={onSelect}
      style={{
        background,
        borderTop: borderValue(borders.top),
        borderRight: borderValue(borders.right),
        borderBottom: borderValue(borders.bottom),
        borderLeft: borderValue(borders.left),
        outline: conflict || mistake ? "2px solid #dc2626" : "none",
        outlineOffset: "-2px",
      }}
      type="button"
    >
      {label ? (
        <span
          className="absolute top-0.5 left-1 font-semibold leading-none"
          style={{
            fontSize: "min(2.6vw, 0.7rem)",
            color: "var(--fg-secondary)",
          }}
        >
          {label}
        </span>
      ) : null}

      {state.value === null ? null : (
        <span
          className="font-semibold"
          style={{ fontSize: "min(6vw, 1.5rem)", color: valueColor }}
        >
          {state.value}
        </span>
      )}

      {state.value === null && !hideNotes && state.notes.length > 0 ? (
        <span
          className="absolute inset-0 grid grid-cols-3 place-items-center p-0.5"
          style={{ fontSize: "min(2.4vw, 0.6rem)", color: "var(--fg-muted)" }}
        >
          {state.notes.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </span>
      ) : null}
    </button>
  );
}
