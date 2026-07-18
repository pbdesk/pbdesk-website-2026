// src/components/games/kenken/game-controls.tsx
"use client";

import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBulb,
  IconEraser,
  IconEye,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconShield,
} from "@tabler/icons-react";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";

interface GameControlsProps {
  canRedo: boolean;
  canUndo: boolean;
  hintsUsed: number;
  onErase: () => void;
  onHint: () => void;
  onNewGame: () => void;
  onRedo: () => void;
  onReset: () => void;
  onRevealMistakes: () => void;
  onTogglePause: () => void;
  onToggleRuleCheck: () => void;
  onUndo: () => void;
  paused: boolean;
  revealActive: boolean;
  ruleCheckOn: boolean;
}

function ControlButton({
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      aria-pressed={active}
      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border px-3 font-medium text-sm transition-colors disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      style={{
        background: active
          ? `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 14%, transparent)`
          : "var(--bg-page)",
        borderColor: active
          ? BRAIN_BOOST_ACCENT.primary
          : "var(--border-strong)",
        color: "var(--fg-primary)",
      }}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export default function GameControls({
  canUndo,
  canRedo,
  ruleCheckOn,
  revealActive,
  hintsUsed,
  paused,
  onUndo,
  onRedo,
  onToggleRuleCheck,
  onRevealMistakes,
  onHint,
  onTogglePause,
  onErase,
  onReset,
  onNewGame,
}: GameControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <ControlButton
        disabled={!canUndo}
        icon={<IconArrowBackUp size={15} />}
        label="Undo"
        onClick={onUndo}
      />
      <ControlButton
        disabled={!canRedo}
        icon={<IconArrowForwardUp size={15} />}
        label="Redo"
        onClick={onRedo}
      />
      <ControlButton
        icon={
          paused ? <IconPlayerPlay size={15} /> : <IconPlayerPause size={15} />
        }
        label={paused ? "Resume" : "Pause"}
        onClick={onTogglePause}
      />
      <ControlButton
        active={ruleCheckOn}
        icon={<IconShield size={15} />}
        label="Rule Check"
        onClick={onToggleRuleCheck}
      />
      <ControlButton
        active={revealActive}
        icon={<IconEye size={15} />}
        label="Reveal Mistakes"
        onClick={onRevealMistakes}
      />
      <ControlButton
        icon={<IconBulb size={15} />}
        label={`Hint (${hintsUsed})`}
        onClick={onHint}
      />
      <ControlButton
        icon={<IconEraser size={15} />}
        label="Erase"
        onClick={onErase}
      />
      <ControlButton
        icon={<IconRefresh size={15} />}
        label="Reset"
        onClick={onReset}
      />
      <ControlButton
        icon={<IconPlus size={15} />}
        label="New Game"
        onClick={onNewGame}
      />
    </div>
  );
}
