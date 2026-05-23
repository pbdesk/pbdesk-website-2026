export const DEFAULT_REVEAL_VARIANT = "up";
export const DEFAULT_REVEAL_STAGGER_MS = 90;
export const MAX_REVEAL_STAGGER_MS = 360;

export type RevealVariant = typeof DEFAULT_REVEAL_VARIANT | "fade";

export function getRevealVariant(variant?: RevealVariant): RevealVariant {
  return variant ?? DEFAULT_REVEAL_VARIANT;
}

export function getRevealStaggerDelay(index: number): number {
  const normalizedIndex = Math.max(0, Math.floor(index));
  return Math.min(
    normalizedIndex * DEFAULT_REVEAL_STAGGER_MS,
    MAX_REVEAL_STAGGER_MS
  );
}
