// scripts/bb/kenken/generate-kenken.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDifficulty, TIERS } from "../../../src/lib/games/kenken/difficulty";
import {
  generatePuzzle,
  generatePuzzleForTier,
} from "../../../src/lib/games/kenken/generate";
import { mulberry32, type Rng } from "../../../src/lib/games/kenken/rng";
import {
  type Difficulty,
  type KenKenLibrary,
  type KenKenPuzzle,
  SCHEMA_VERSION,
} from "../../../src/lib/games/kenken/types";
import { validateLibrary } from "../../../src/lib/games/kenken/validate";

const PUZZLES_DIR = join(process.cwd(), "src/lib/games/kenken/puzzles");

interface CliArgs {
  count: number;
  difficulty: Difficulty;
  seed: number;
  size: number | null;
}

function parseArgs(argv: string[]): CliArgs {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      args.set(a.slice(2), argv[i + 1]);
      i += 1;
    }
  }
  const difficulty = args.get("difficulty");
  if (!isDifficulty(difficulty)) {
    throw new Error(
      "Usage: --difficulty <easy|intermediate|hard|genius> --count N [--seed S] [--size N]"
    );
  }
  const count = Number(args.get("count") ?? "10");
  const seed = Number(args.get("seed") ?? String(Date.now() % 2_147_483_647));
  const sizeRaw = args.get("size");
  const size = sizeRaw === undefined ? null : Number(sizeRaw);
  if (size !== null && !Number.isFinite(size)) {
    throw new Error("--size must be a number");
  }
  if (size !== null) {
    const validSizes = TIERS[difficulty].variants.map((v) => v.size);
    if (!validSizes.includes(size)) {
      throw new Error(
        `--size ${size} is not a variant of ${difficulty}; valid sizes: ${validSizes.join(", ")}`
      );
    }
  }
  return { count, difficulty, seed, size };
}

function generateForSize(
  difficulty: Difficulty,
  size: number,
  rng: Rng,
  id: string
): KenKenPuzzle | null {
  const tier = TIERS[difficulty];
  const variant = tier.variants.find((v) => v.size === size);
  if (!variant) {
    throw new Error(`no variant for size ${size} in ${difficulty}`);
  }
  return generatePuzzle(
    variant.size,
    difficulty,
    variant.ops,
    tier.maxCageSize,
    rng,
    id
  );
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
  const { difficulty, count, seed, size } = parseArgs(process.argv.slice(2));
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
    guard += 1;
    const provisionalId = `pending-${seq}`;
    const puzzle =
      size === null
        ? generatePuzzleForTier(difficulty, rng, provisionalId)
        : generateForSize(difficulty, size, rng, provisionalId);
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
    seq += 1;
    added += 1;
  }

  const errors = validateLibrary(library);
  if (errors.length > 0) {
    throw new Error(`Generated library is invalid:\n${errors.join("\n")}`);
  }

  writeFileSync(filePath, `${JSON.stringify(library, null, 2)}\n`);
  const sizeNote = size === null ? "" : ` (size ${size})`;
  process.stdout.write(
    `Added ${added} ${difficulty}${sizeNote} puzzles (total ${library.puzzles.length}). Seed ${seed}.\n`
  );
}

main();
