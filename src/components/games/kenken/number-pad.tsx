// src/components/games/kenken/number-pad.tsx
"use client";

import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import type { InputMode } from "@/lib/games/kenken/runtime-types";

interface NumberPadProps {
  mode: InputMode;
  onDigit: (digit: number) => void;
  onErase: () => void;
  onToggleMode: () => void;
  size: number;
}

export default function NumberPad({
  size,
  mode,
  onDigit,
  onToggleMode,
  onErase,
}: NumberPadProps) {
  const digits = Array.from({ length: size }, (_, i) => i + 1);
  const noteMode = mode === "note";

  return (
    <div className="flex flex-col gap-3">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(size, 5)}, minmax(0, 1fr))`,
        }}
      >
        {digits.map((d) => (
          <button
            className="flex h-12 items-center justify-center rounded-lg border font-semibold text-lg transition-colors"
            key={d}
            onClick={() => onDigit(d)}
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--bg-page)",
              color: "var(--fg-primary)",
            }}
            type="button"
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          aria-pressed={noteMode}
          className="flex h-11 flex-1 items-center justify-center rounded-lg border font-medium text-sm transition-colors"
          onClick={onToggleMode}
          style={{
            borderColor: noteMode
              ? BRAIN_BOOST_ACCENT.primary
              : "var(--border-strong)",
            background: noteMode
              ? `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 14%, transparent)`
              : "var(--bg-page)",
            color: "var(--fg-primary)",
          }}
          type="button"
        >
          {noteMode ? "Notes: on" : "Notes: off"}
        </button>
        <button
          className="flex h-11 flex-1 items-center justify-center rounded-lg border font-medium text-sm transition-colors"
          onClick={onErase}
          style={{
            borderColor: "var(--border-strong)",
            background: "var(--bg-page)",
            color: "var(--fg-primary)",
          }}
          type="button"
        >
          Erase
        </button>
      </div>
    </div>
  );
}
