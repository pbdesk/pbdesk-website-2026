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
  { value: "1", label: "game live", icon: "Layers" },
  { value: "4", label: "difficulty tiers", icon: "Target" },
  { value: "~200", label: "hand-checked puzzles", icon: "Sparkles" },
  { value: "1", label: "new puzzle every day", icon: "Calendar" },
] as const;

export type BenefitIconKey = "Target" | "Brain" | "Clock" | "Flame";

export interface Benefit {
  body: string;
  icon: BenefitIconKey;
  title: string;
}

export const BENEFITS: readonly Benefit[] = [
  {
    icon: "Target",
    title: "Single-task focus",
    body: "Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week.",
  },
  {
    icon: "Brain",
    title: "Working-memory workout",
    body: 'Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point.',
  },
  {
    icon: "Clock",
    title: "Designed to be short",
    body: "Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes.",
  },
  {
    icon: "Flame",
    title: "Daily ritual, no streak shame",
    body: "A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can.",
  },
];
