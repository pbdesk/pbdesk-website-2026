// src/components/games/kenken/how-to-play-overlay.tsx
"use client";

import { Button } from "@/components/ui/button";

const RULES = [
  "Fill the grid so each row and column contains every digit from 1 to N with no repeats.",
  "Each outlined cage shows a target and an operation. The digits in the cage must combine, using that operation, to make the target.",
  "− and ÷ cages are always two cells. A single-cell cage's target is simply that cell's digit.",
  "Use notes to jot candidates, and the keypad or your keyboard to fill values.",
];

export default function HowToPlayOverlay({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  return (
    <div
      aria-labelledby="howto-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      style={{ background: "rgb(0 0 0 / 0.5)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 sm:p-8"
        style={{ background: "var(--bg-page)" }}
      >
        <h2
          className="mb-4 font-bold text-2xl"
          id="howto-title"
          style={{ color: "var(--fg-primary)" }}
        >
          How to play KenKen
        </h2>
        <ul className="mb-6 flex flex-col gap-3">
          {RULES.map((rule) => (
            <li
              className="text-sm"
              key={rule.slice(0, 24)}
              style={{ color: "var(--fg-secondary)", lineHeight: 1.6 }}
            >
              {rule}
            </li>
          ))}
        </ul>
        <Button onClick={onDismiss}>Got it — start playing</Button>
      </div>
    </div>
  );
}
