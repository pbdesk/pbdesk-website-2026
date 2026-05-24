"use client";

import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import { TIERS } from "@/lib/games/kenken/difficulty";
import { FREEBIE_COUNT } from "@/lib/games/kenken/freebies";
import type { Difficulty } from "@/lib/games/kenken/types";

const LEVEL_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  genius: "Genius",
  hard: "Hard",
  intermediate: "Intermediate",
};

interface SizePickerProps {
  lastSize?: number | null;
  level: Difficulty;
  onBack: () => void;
  onSelect: (size: number) => void;
}

export default function SizePicker({
  level,
  lastSize,
  onBack,
  onSelect,
}: SizePickerProps) {
  const sizes = [...new Set(TIERS[level].variants.map((v) => v.size))].sort(
    (a, b) => a - b
  );

  return (
    <section className="wrapper py-12">
      <div className="mx-auto max-w-2xl text-center">
        <button
          className="mb-6 text-sm"
          onClick={onBack}
          style={{ color: BRAIN_BOOST_ACCENT.primary }}
          type="button"
        >
          ← Back to levels
        </button>

        <h1
          className="mb-3 font-bold text-[var(--fg-primary)]"
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            letterSpacing: "-0.02em",
          }}
        >
          Choose grid size
        </h1>
        <p className="mb-10 text-[var(--fg-secondary)]">
          {LEVEL_LABELS[level]} — pick a size to start.
        </p>

        <ul className="grid gap-4 sm:grid-cols-3">
          {sizes.map((size) => {
            const isLast = size === lastSize;
            const freebies = FREEBIE_COUNT[size] ?? 0;
            return (
              <li key={size}>
                <button
                  className="w-full rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5"
                  onClick={() => onSelect(size)}
                  style={{
                    borderColor: isLast
                      ? BRAIN_BOOST_ACCENT.primary
                      : "var(--border-strong)",
                    background: "var(--bg-subtle)",
                  }}
                  type="button"
                >
                  <span
                    className="block font-semibold text-lg"
                    style={{ color: "var(--fg-primary)" }}
                  >
                    {size}×{size}
                    {isLast ? (
                      <span
                        className="ml-2 align-middle text-xs"
                        style={{ color: BRAIN_BOOST_ACCENT.primary }}
                      >
                        last played
                      </span>
                    ) : null}
                  </span>
                  <span
                    className="mt-1 block text-sm"
                    style={{ color: "var(--fg-secondary)" }}
                  >
                    {freebies} pre-filled cells
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
