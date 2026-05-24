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

function resolveCellBackground(
  given: boolean,
  peerHighlight: boolean,
  sameValueHighlight: boolean,
  selected: boolean
): string {
  if (selected) {
    return `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 22%, transparent)`;
  }
  if (sameValueHighlight) {
    return "color-mix(in srgb, var(--fg-brand) 12%, transparent)";
  }
  if (peerHighlight) {
    return "var(--bg-subtle)";
  }
  if (given) {
    return "color-mix(in srgb, var(--fg-brand) 8%, var(--bg-page))";
  }
  return "var(--bg-page)";
}

function resolveValueColor(
  given: boolean,
  conflict: boolean,
  mistake: boolean,
  hinted: boolean
): string {
  if (conflict || mistake) {
    return "#dc2626"; // red-600 — not sole signal (ring too)
  }
  if (hinted) {
    return "#ea580c"; // orange-600
  }
  return given ? "var(--fg-brand)" : "var(--fg-primary)";
}

function cellAriaLabel(
  label: string | null,
  value: number | null,
  given: boolean
): string {
  const valueStr = value ? `, value ${value}` : ", empty";
  const givenStr = given ? ", pre-filled" : "";
  return label
    ? `Cell, cage ${label}${valueStr}${givenStr}`
    : `Cell${valueStr}${givenStr}`;
}

interface CellProps {
  borders: CellBorders;
  conflict: boolean;
  given: boolean;
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
  given,
  sameValueHighlight,
  peerHighlight,
  onSelect,
}: CellProps) {
  const background = resolveCellBackground(
    given,
    peerHighlight,
    sameValueHighlight,
    selected
  );
  const valueColor = resolveValueColor(
    given,
    conflict,
    mistake,
    state.hinted ?? false
  );
  const hasConflict = conflict || mistake;

  return (
    <button
      aria-disabled={given || undefined}
      aria-label={cellAriaLabel(label, state.value, given)}
      aria-pressed={selected}
      className="relative flex aspect-square items-center justify-center"
      onClick={onSelect}
      style={{
        background,
        borderTop: borderValue(borders.top),
        borderRight: borderValue(borders.right),
        borderBottom: borderValue(borders.bottom),
        borderLeft: borderValue(borders.left),
        cursor: given ? "default" : undefined,
        outline: hasConflict ? "2px solid #dc2626" : "none",
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
    </button>
  );
}
