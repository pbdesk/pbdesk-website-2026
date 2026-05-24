// src/components/games/kenken/win-overlay.tsx
"use client";

import { Button } from "@/components/ui/button";
import { formatDuration } from "./timer";

interface WinOverlayProps {
  copied?: boolean;
  elapsedSeconds: number;
  hintsUsed: number;
  onChangeLevel: () => void;
  onNewGame: () => void;
  onShare: () => void;
}

export default function WinOverlay({
  copied,
  elapsedSeconds,
  hintsUsed,
  onNewGame,
  onChangeLevel,
  onShare,
}: WinOverlayProps) {
  return (
    <div
      aria-labelledby="win-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      style={{ background: "rgb(0 0 0 / 0.5)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 text-center sm:p-8"
        style={{ background: "var(--bg-page)" }}
      >
        <h2
          className="mb-2 font-bold text-3xl"
          id="win-title"
          style={{ color: "var(--fg-primary)" }}
        >
          Solved! 🎉
        </h2>
        <p className="mb-6 text-[var(--fg-secondary)]">
          Time {formatDuration(elapsedSeconds)} · {hintsUsed} hint
          {hintsUsed === 1 ? "" : "s"} used
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={onNewGame}>New game, same level</Button>
          <Button onClick={onChangeLevel} variant="secondary">
            Change level
          </Button>
          <Button onClick={onShare} variant="ghost">
            {copied ? "Copied!" : "Share this puzzle"}
          </Button>
        </div>
      </div>
    </div>
  );
}
