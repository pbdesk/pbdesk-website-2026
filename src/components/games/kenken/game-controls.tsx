// src/components/games/kenken/game-controls.tsx
"use client";

interface GameControlsProps {
  canRedo: boolean;
  canUndo: boolean;
  hintsUsed: number;
  onHint: () => void;
  onRedo: () => void;
  onRevealMistakes: () => void;
  onTogglePause: () => void;
  onToggleRuleCheck: () => void;
  onUndo: () => void;
  paused: boolean;
  ruleCheckOn: boolean;
}

function ControlButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="rounded-lg border px-3 py-2 font-medium text-sm transition-colors disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      style={{
        borderColor: "var(--border-strong)",
        background: "var(--bg-page)",
        color: "var(--fg-primary)",
      }}
      type="button"
    >
      {label}
    </button>
  );
}

export default function GameControls({
  canUndo,
  canRedo,
  ruleCheckOn,
  hintsUsed,
  paused,
  onUndo,
  onRedo,
  onToggleRuleCheck,
  onRevealMistakes,
  onHint,
  onTogglePause,
}: GameControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ControlButton disabled={!canUndo} label="Undo" onClick={onUndo} />
      <ControlButton disabled={!canRedo} label="Redo" onClick={onRedo} />
      <ControlButton
        label={ruleCheckOn ? "Rule check: on" : "Rule check: off"}
        onClick={onToggleRuleCheck}
      />
      <ControlButton label="Reveal mistakes" onClick={onRevealMistakes} />
      <ControlButton label={`Hint (${hintsUsed})`} onClick={onHint} />
      <ControlButton
        label={paused ? "Resume" : "Pause"}
        onClick={onTogglePause}
      />
    </div>
  );
}
