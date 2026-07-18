export const BRAIN_BOOST_TITLE = "Brain Boost";
export const BRAIN_BOOST_TAGLINE = "Short games for long focus.";
export const BRAIN_BOOST_LEDE =
  "A new corner of PBDesk for short, focused puzzles that sharpen the mind between Bits and Bites. Twenty minutes of arithmetic logic, one solved grid at a time — the kind of quiet focus that resets a working day. KenKen is here today; more games are queued.";

export type BrainBoostMetaIcon = "Layers" | "Target" | "Sparkles" | "Calendar";

export interface BrainBoostMetaItem {
  icon: BrainBoostMetaIcon;
  label: string;
  value: string;
}

export const BRAIN_BOOST_META: readonly BrainBoostMetaItem[] = [
  { icon: "Layers", label: "game live", value: "1" },
  { icon: "Target", label: "difficulty tiers", value: "4" },
  { icon: "Sparkles", label: "hand-checked puzzles", value: "~200" },
  { icon: "Calendar", label: "new puzzle every day", value: "1" },
] as const;

export type BenefitIconKey = "Target" | "Brain" | "Clock" | "Flame";

export interface Benefit {
  body: string;
  icon: BenefitIconKey;
  title: string;
}

export const BENEFITS: readonly Benefit[] = [
  {
    body: "Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week.",
    icon: "Target",
    title: "Single-task focus",
  },
  {
    body: 'Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point.',
    icon: "Brain",
    title: "Working-memory workout",
  },
  {
    body: "Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes.",
    icon: "Clock",
    title: "Designed to be short",
  },
  {
    body: "A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can.",
    icon: "Flame",
    title: "Daily ritual, no streak shame",
  },
];
