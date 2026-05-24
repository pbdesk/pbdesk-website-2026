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
