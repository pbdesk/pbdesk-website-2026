// src/components/games/kenken/kenken-game.tsx
"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import {
  fetchPuzzleById,
  fetchPuzzleByLevel,
  resolveDailyPuzzle,
} from "@/lib/games/kenken/puzzle-client";
import { createInitialState, gameReducer } from "@/lib/games/kenken/reducer";
import type { ProgressRecord } from "@/lib/games/kenken/storage";
import {
  addServedId,
  clearProgress,
  getHowToSeen,
  getLastLevel,
  getServedIds,
  loadProgress,
  saveProgress,
  setHowToSeen,
  setLastLevel,
} from "@/lib/games/kenken/storage";
import type { Difficulty, KenKenPuzzle } from "@/lib/games/kenken/types";
import CellStatusBar from "./cell-status-bar";
import GameControls from "./game-controls";
import Grid from "./grid";
import HowToPlayOverlay from "./how-to-play-overlay";
import LevelPicker from "./level-picker";
import NumberPad from "./number-pad";
import Timer, { useGameTimer } from "./timer";
import WinOverlay from "./win-overlay";

type Mode = "play" | "daily";

interface KenKenGameProps {
  initialPuzzleId?: string;
  mode: Mode;
}

interface GamePlayProps {
  onChangeLevel: () => void;
  onNewGame: () => void;
  puzzle: KenKenPuzzle;
  restoredProgress: ProgressRecord | null;
}

const DIGIT_RE = /^[1-9]$/;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function resolveDaily(
  startPuzzle: (p: KenKenPuzzle) => void,
  signal: { active: boolean }
): Promise<void> {
  const daily = await resolveDailyPuzzle(todayIso());
  if (signal.active) {
    startPuzzle(daily);
  }
}

async function resolveById(
  id: string,
  startPuzzle: (p: KenKenPuzzle) => void,
  setLoadError: (e: string) => void,
  setShowPicker: (v: boolean) => void,
  signal: { active: boolean }
): Promise<void> {
  const byId = await fetchPuzzleById(id);
  if (!signal.active) {
    return;
  }
  if (byId) {
    startPuzzle(byId);
  } else {
    setLoadError(
      "That puzzle is no longer available. Pick a level to start a new one."
    );
    setShowPicker(true);
  }
}

function GamePlay({
  puzzle,
  restoredProgress,
  onNewGame,
  onChangeLevel,
}: GamePlayProps) {
  const [state, dispatch] = useReducer(gameReducer, puzzle, createInitialState);
  const [showHowTo, setShowHowTo] = useState(!getHowToSeen());

  // Restore saved progress on mount (if any).
  useEffect(() => {
    if (restoredProgress) {
      dispatch({
        type: "restore",
        grid: restoredProgress.grid,
        elapsedSeconds: restoredProgress.elapsedSeconds,
        hintsUsed: restoredProgress.hintsUsed,
      });
    }
  }, [restoredProgress]);

  // Persist progress on every state change.
  useEffect(() => {
    saveProgress({
      puzzleId: puzzle.id,
      grid: state.grid,
      elapsedSeconds: state.elapsedSeconds,
      hintsUsed: state.hintsUsed,
    });
  }, [puzzle.id, state]);

  const running = !showHowTo && state.status === "playing" && !state.paused;
  const onTick = useCallback(() => dispatch({ type: "tick" }), []);
  const onAutoPause = useCallback(
    () => dispatch({ type: "setPaused", paused: true }),
    []
  );
  useGameTimer({ running, onTick, onAutoPause });

  const handleKey = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === "ArrowUp") {
      dispatch({ type: "move", dRow: -1, dCol: 0 });
    } else if (key === "ArrowDown") {
      dispatch({ type: "move", dRow: 1, dCol: 0 });
    } else if (key === "ArrowLeft") {
      dispatch({ type: "move", dRow: 0, dCol: -1 });
    } else if (key === "ArrowRight") {
      dispatch({ type: "move", dRow: 0, dCol: 1 });
    } else if (key === "Backspace" || key === "Delete") {
      dispatch({ type: "clear" });
    } else if (key === "n" || key === "N") {
      dispatch({ type: "toggleMode" });
    } else if (DIGIT_RE.test(key)) {
      dispatch({ type: "input", digit: Number(key) });
    } else {
      return;
    }
    event.preventDefault();
  }, []);

  const handleShare = useCallback(() => {
    const url = `${globalThis.location.origin}/brain-boost/kenken/play?puzzle=${puzzle.id}`;
    globalThis.navigator?.clipboard?.writeText(url).catch(() => {
      // Clipboard may be unavailable; sharing is best-effort.
    });
  }, [puzzle.id]);

  const dismissHowTo = useCallback(() => {
    setHowToSeen();
    setShowHowTo(false);
  }, []);

  return (
    <section className="wrapper py-8">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <Timer elapsedSeconds={state.elapsedSeconds} />
          <span
            className="text-sm capitalize"
            style={{ color: "var(--fg-secondary)" }}
          >
            {puzzle.difficulty} · {puzzle.size}×{puzzle.size}
          </span>
        </div>

        {state.paused ? (
          <div
            className="flex min-h-64 items-center justify-center rounded-2xl"
            style={{ background: "var(--bg-subtle)" }}
          >
            <button
              className="rounded-full px-6 py-3 font-semibold text-white"
              onClick={() => dispatch({ type: "setPaused", paused: false })}
              style={{ background: "var(--fg-brand)" }}
              type="button"
            >
              Resume
            </button>
          </div>
        ) : (
          <Grid
            onKeyAction={handleKey}
            onSelect={(cell) => dispatch({ type: "select", cell })}
            state={state}
          />
        )}

        <CellStatusBar state={state} />
        <NumberPad
          mode={state.mode}
          onDigit={(digit) => dispatch({ type: "input", digit })}
          onErase={() => dispatch({ type: "clear" })}
          onToggleMode={() => dispatch({ type: "toggleMode" })}
          size={puzzle.size}
        />
        <GameControls
          canRedo={state.redoStack.length > 0}
          canUndo={state.undoStack.length > 0}
          hintsUsed={state.hintsUsed}
          onHint={() => dispatch({ type: "hint" })}
          onRedo={() => dispatch({ type: "redo" })}
          onRevealMistakes={() => dispatch({ type: "revealMistakes" })}
          onTogglePause={() =>
            dispatch({ type: "setPaused", paused: !state.paused })
          }
          onToggleRuleCheck={() => dispatch({ type: "toggleRuleCheck" })}
          onUndo={() => dispatch({ type: "undo" })}
          paused={state.paused}
          ruleCheckOn={state.ruleCheckOn}
        />
      </div>

      {showHowTo ? <HowToPlayOverlay onDismiss={dismissHowTo} /> : null}
      {state.status === "won" && !showHowTo ? (
        <WinOverlay
          elapsedSeconds={state.elapsedSeconds}
          hintsUsed={state.hintsUsed}
          onChangeLevel={() => {
            clearProgress();
            onChangeLevel();
          }}
          onNewGame={onNewGame}
          onShare={handleShare}
        />
      ) : null}
    </section>
  );
}

export default function KenKenGame({ mode, initialPuzzleId }: KenKenGameProps) {
  const [puzzle, setPuzzle] = useState<KenKenPuzzle | null>(null);
  const [restoredProgress, setRestoredProgress] =
    useState<ProgressRecord | null>(null);
  const [showPicker, setShowPicker] = useState(
    mode === "play" && !initialPuzzleId
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const startPuzzle = useCallback((next: KenKenPuzzle) => {
    addServedId(next.difficulty, next.id);
    const restored = loadProgress(next.id);
    setRestoredProgress(restored);
    setPuzzle(next);
  }, []);

  const loadForLevel = useCallback(
    async (level: Difficulty) => {
      setLoadError(null);
      setLastLevel(level);
      try {
        const served = getServedIds(level);
        const next = await fetchPuzzleByLevel(level, served);
        clearProgress();
        setShowPicker(false);
        startPuzzle(next);
      } catch {
        setLoadError("Could not load a puzzle. Please try again.");
      }
    },
    [startPuzzle]
  );

  useEffect(() => {
    const signal = { active: true };
    const run = async () => {
      try {
        if (mode === "daily") {
          await resolveDaily(startPuzzle, signal);
        } else if (initialPuzzleId) {
          await resolveById(
            initialPuzzleId,
            startPuzzle,
            setLoadError,
            setShowPicker,
            signal
          );
        }
      } catch {
        if (signal.active) {
          setLoadError("Could not load a puzzle. Please try again.");
        }
      }
    };
    run();
    return () => {
      signal.active = false;
    };
  }, [mode, initialPuzzleId, startPuzzle]);

  if (showPicker) {
    return (
      <>
        {loadError ? (
          <p
            className="wrapper pt-6 text-center text-sm"
            style={{ color: "#dc2626" }}
          >
            {loadError}
          </p>
        ) : null}
        <LevelPicker initialLevel={getLastLevel()} onSelect={loadForLevel} />
      </>
    );
  }

  if (!puzzle) {
    return (
      <p className="wrapper py-16 text-center text-[var(--fg-secondary)]">
        {loadError ?? "Loading puzzle…"}
      </p>
    );
  }

  return (
    <GamePlay
      key={puzzle.id}
      onChangeLevel={() => setShowPicker(true)}
      onNewGame={() => loadForLevel(puzzle.difficulty)}
      puzzle={puzzle}
      restoredProgress={restoredProgress}
    />
  );
}
