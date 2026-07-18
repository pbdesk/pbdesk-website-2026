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
    category: "Arithmetic · Logic",
    coverImage: "/pillers/kenken-banner.png",
    description:
      "Fill an N×N grid so digits don't repeat in any row or column — the catch: outlined cages must hit their target with +, −, ×, or ÷. Pure logic, no guessing required.",
    estTime: "10–25 min",
    href: "/brain-boost/kenken",
    name: "KenKen",
    operations: "+ − × ÷",
    slug: "kenken",
    status: "live",
    tiers: 4,
  },
  {
    category: "Logic",
    description:
      "Classic 9×9 with hand-picked difficulty curves and a no-mark-ups expert mode.",
    glyph: "SUD",
    name: "Sudoku",
    slug: "sudoku",
    status: "coming-q3",
  },
  {
    category: "Words",
    description:
      "Five-clue cryptic crossword, finishable on a coffee break. Each solved clue links to its wordplay.",
    glyph: "CRY",
    name: "Cryptic Mini",
    slug: "cryptic",
    status: "coming-q4",
  },
  {
    category: "Logic",
    description:
      "Five-by-five attribute deduction puzzles — the kind your physics teacher used to print and hand out.",
    glyph: "LOG",
    name: "Logic Grid",
    slug: "logic-grid",
    status: "exploring",
  },
];

export const STATUS_LABEL: Record<GameStatus, string> = {
  "coming-q3": "Coming · Q3",
  "coming-q4": "Coming · Q4",
  exploring: "Exploring",
  live: "Now playing",
};
