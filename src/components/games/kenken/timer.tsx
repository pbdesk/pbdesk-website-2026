// src/components/games/kenken/timer.tsx
"use client";

import { useEffect } from "react";

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface UseGameTimerArgs {
  onAutoPause: () => void;
  onTick: () => void;
  running: boolean; // playing && !paused
}

export function useGameTimer({
  running,
  onTick,
  onAutoPause,
}: UseGameTimerArgs): void {
  useEffect(() => {
    if (!running) {
      return;
    }
    const id = setInterval(onTick, 1000);
    return () => clearInterval(id);
  }, [running, onTick]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "hidden") {
        onAutoPause();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [onAutoPause]);
}

export default function Timer({ elapsedSeconds }: { elapsedSeconds: number }) {
  return (
    <span
      aria-label={`Elapsed time ${formatDuration(elapsedSeconds)}`}
      className="font-mono font-semibold text-lg tabular-nums"
      role="timer"
      style={{ color: "var(--fg-primary)" }}
    >
      {formatDuration(elapsedSeconds)}
    </span>
  );
}
