// src/components/games/kenken/level-picker.tsx
"use client";

import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import { DIFFICULTIES, TIERS } from "@/lib/games/kenken/difficulty";
import type { Difficulty } from "@/lib/games/kenken/types";

const LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  intermediate: "Intermediate",
  hard: "Hard",
  genius: "Genius",
};

function sizesLabel(level: Difficulty): string {
  const sizes = [...new Set(TIERS[level].variants.map((v) => v.size))].sort(
    (a, b) => a - b
  );
  return sizes.map((s) => `${s}×${s}`).join(" · ");
}

interface LevelPickerProps {
  initialLevel?: Difficulty | null;
  onSelect: (level: Difficulty) => void;
}

export default function LevelPicker({
  initialLevel,
  onSelect,
}: LevelPickerProps) {
  return (
    <section className="wrapper py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1
          className="mb-3 font-bold text-[var(--fg-primary)]"
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            letterSpacing: "-0.02em",
          }}
        >
          Choose your level
        </h1>
        <p className="mb-10 text-[var(--fg-secondary)]">
          Pick a difficulty to start a fresh KenKen puzzle.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {DIFFICULTIES.map((level) => {
            const isLast = level === initialLevel;
            return (
              <li key={level}>
                <button
                  className="w-full rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5"
                  onClick={() => onSelect(level)}
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
                    {LABELS[level]}
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
                    {sizesLabel(level)}
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
