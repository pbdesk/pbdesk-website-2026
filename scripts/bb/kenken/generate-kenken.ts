// scripts/bb/kenken/generate-kenken.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDifficulty } from "../../../src/lib/games/kenken/difficulty";
import { generatePuzzleForTier } from "../../../src/lib/games/kenken/generate";
import { mulberry32 } from "../../../src/lib/games/kenken/rng";
import {
  type Difficulty,
  type KenKenLibrary,
  type KenKenPuzzle,
  SCHEMA_VERSION,
} from "../../../src/lib/games/kenken/types";
import { validateLibrary } from "../../../src/lib/games/kenken/validate";

const PUZZLES_DIR = join(process.cwd(), "src/lib/games/kenken/puzzles");

function parseArgs(argv: string[]): {
  difficulty: Difficulty;
  count: number;
  seed: number;
} {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      args.set(a.slice(2), argv[i + 1]);
      i++;
    }
  }
  const difficulty = args.get("difficulty");
  if (!isDifficulty(difficulty)) {
    throw new Error(
      "Usage: --difficulty <easy|intermediate|hard|genius> --count N [--seed S]"
    );
  }
  const count = Number(args.get("count") ?? "10");
  const seed = Number(args.get("seed") ?? String(Date.now() % 2_147_483_647));
  return { difficulty, count, seed };
}

function solutionSignature(puzzle: KenKenPuzzle): string {
  return puzzle.solution.map((row) => row.join("")).join("|");
}

function nextSeq(puzzles: KenKenPuzzle[]): number {
  let max = 0;
  for (const p of puzzles) {
    const tail = Number(p.id.split("-").at(-1));
    if (Number.isFinite(tail) && tail > max) {
      max = tail;
    }
  }
  return max + 1;
}

function main(): void {
  const { difficulty, count, seed } = parseArgs(process.argv.slice(2));
  const filePath = join(PUZZLES_DIR, `${difficulty}.json`);
  const library = JSON.parse(readFileSync(filePath, "utf8")) as KenKenLibrary;
  library.schemaVersion = SCHEMA_VERSION;

  const signatures = new Set(library.puzzles.map(solutionSignature));
  const rng = mulberry32(seed);
  let seq = nextSeq(library.puzzles);
  let added = 0;
  let guard = 0;
  const maxGuard = count * 50;

  while (added < count && guard < maxGuard) {
    guard++;
    const provisionalId = `pending-${seq}`;
    const puzzle = generatePuzzleForTier(difficulty, rng, provisionalId);
    if (!puzzle) {
      continue;
    }
    const sig = solutionSignature(puzzle);
    if (signatures.has(sig)) {
      continue;
    }
    puzzle.id = `k${puzzle.size}-${difficulty}-${String(seq).padStart(5, "0")}`;
    signatures.add(sig);
    library.puzzles.push(puzzle);
    seq++;
    added++;
  }

  const errors = validateLibrary(library);
  if (errors.length > 0) {
    throw new Error(`Generated library is invalid:\n${errors.join("\n")}`);
  }

  writeFileSync(filePath, `${JSON.stringify(library, null, 2)}\n`);
  process.stdout.write(
    `Added ${added} ${difficulty} puzzles (total ${library.puzzles.length}). Seed ${seed}.\n`
  );
}

main();
