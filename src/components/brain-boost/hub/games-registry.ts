export type GameStatus = "live" | "coming-q3" | "coming-q4" | "exploring";

export interface BrainBoostGame {
  category: string;
  coverImage?: string;
  description: string;
  estTime?: string;
  glyph?: string;
  href?: string;
  name: string;
  operations?: string;
  slug: string;
  status: GameStatus;
  tiers?: number;
}

export const BRAIN_BOOST_GAMES: BrainBoostGame[] = [
  {
    slug: "kenken",
    name: "KenKen",
    status: "live",
    category: "Arithmetic · Logic",
    description:
      "Fill an N×N grid so digits don't repeat in any row or column — the catch: outlined cages must hit their target with +, −, ×, or ÷. Pure logic, no guessing required.",
    href: "/brain-boost/kenken",
    coverImage: "/pillers/kenken-banner.png",
    tiers: 4,
    estTime: "10–25 min",
    operations: "+ − × ÷",
  },
  {
    slug: "sudoku",
    name: "Sudoku",
    status: "coming-q3",
    glyph: "SUD",
    category: "Logic",
    description:
      "Classic 9×9 with hand-picked difficulty curves and a no-mark-ups expert mode.",
  },
  {
    slug: "cryptic",
    name: "Cryptic Mini",
    status: "coming-q4",
    glyph: "CRY",
    category: "Words",
    description:
      "Five-clue cryptic crossword, finishable on a coffee break. Each solved clue links to its wordplay.",
  },
  {
    slug: "logic-grid",
    name: "Logic Grid",
    status: "exploring",
    glyph: "LOG",
    category: "Logic",
    description:
      "Five-by-five attribute deduction puzzles — the kind your physics teacher used to print and hand out.",
  },
];

export const STATUS_LABEL: Record<GameStatus, string> = {
  live: "Now playing",
  "coming-q3": "Coming · Q3",
  "coming-q4": "Coming · Q4",
  exploring: "Exploring",
};
