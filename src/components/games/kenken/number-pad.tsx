// src/components/games/kenken/number-pad.tsx
"use client";

interface NumberPadProps {
  onDigit: (digit: number) => void;
  size: number;
}

export default function NumberPad({ size, onDigit }: NumberPadProps) {
  const digits = Array.from({ length: size }, (_, i) => i + 1);

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${Math.min(size, 5)}, minmax(0, 1fr))`,
      }}
    >
      {digits.map((d) => {
        const handleClick = () => onDigit(d);
        return (
          <button
            className="flex h-12 items-center justify-center rounded-lg border font-semibold text-lg transition-colors"
            key={d}
            onClick={handleClick}
            style={{
              background: "var(--bg-page)",
              borderColor: "var(--border-strong)",
              color: "var(--fg-primary)",
            }}
            type="button"
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}
