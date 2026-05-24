// src/components/brain-boost/kenken/fallback-content.ts
export interface OperationCopy {
  description: string;
  name: string;
  symbol: string;
}

export interface LevelCopy {
  description: string;
  name: string;
  operations: string;
  sizes: string;
}

export interface StepCopy {
  text: string;
  title: string;
}

export const FALLBACK_HERO = {
  eyebrow: "Brain Boost",
  title: "KenKen",
  lede: "A bite-sized arithmetic logic puzzle. Fill the grid so every row and column holds each digit once, and each cage hits its target.",
  ctaPlayLabel: "Play now",
  ctaDailyLabel: "Today's daily",
} as const;

export const FALLBACK_WHAT_IS =
  "KenKen is a grid-based logic puzzle. Fill an N×N grid with the digits 1 to N so that no digit repeats in any row or column. The grid is split into outlined groups called cages — each shows a target and an operation, and the digits in the cage must combine, using that operation, to produce the target.";

export const FALLBACK_STEPS: StepCopy[] = [
  {
    title: "Fill rows and columns",
    text: "Place the digits 1 to N so each appears exactly once in every row and every column.",
  },
  {
    title: "Satisfy each cage",
    text: "An outlined cage shows a target and an operation. The digits inside must combine, using that operation, to make the target.",
  },
  {
    title: "Use notes and checks",
    text: "Jot candidate digits as notes, toggle rule-checking to spot duplicates, and reveal mistakes if you get stuck.",
  },
];

export const FALLBACK_OPERATIONS: OperationCopy[] = [
  {
    symbol: "+",
    name: "Addition",
    description: "Cage digits add up to the target (any cage size).",
  },
  {
    symbol: "−",
    name: "Subtraction",
    description: "Two cells; the target is their absolute difference.",
  },
  {
    symbol: "×",
    name: "Multiplication",
    description: "Cage digits multiply to the target (any cage size).",
  },
  {
    symbol: "÷",
    name: "Division",
    description:
      "Two cells; the larger divided by the smaller equals the target (whole numbers only).",
  },
];

export const FALLBACK_LEVELS: LevelCopy[] = [
  {
    name: "Easy",
    sizes: "3×3, 4×4, 5×5",
    operations: "+ − ×  (÷ on 3×3)",
    description: "Gentle grids to learn the ropes.",
  },
  {
    name: "Intermediate",
    sizes: "4×4, 5×5",
    operations: "+ − × ÷",
    description: "All four operations in play — the daily puzzle's tier.",
  },
  {
    name: "Hard",
    sizes: "6×6, 7×7",
    operations: "+ − × ÷",
    description: "Bigger boards and tighter cages.",
  },
  {
    name: "Genius",
    sizes: "8×8, 9×9",
    operations: "+ − × ÷",
    description: "A serious workout for puzzle veterans.",
  },
];
