# KenKen puzzle generator

Generates and persists KenKen puzzles into the on-disk libraries at
`src/lib/games/kenken/puzzles/{easy,intermediate,hard,genius}.json`.

These libraries are imported directly by the runtime
([`puzzle-loader.ts`](../../../src/lib/games/kenken/puzzle-loader.ts)) and served
by the API route at `/api/kenken/puzzle`.

## Quick start

```bash
# Add 50 easy puzzles (mix of variants picked uniformly at random)
bun scripts/bb/kenken/generate-kenken.ts --difficulty easy --count 50

# Add 20 genius puzzles, deterministic seed
bun scripts/bb/kenken/generate-kenken.ts --difficulty genius --count 20 --seed 4242

# Target a specific variant: 10 genius puzzles of size 6 only
bun scripts/bb/kenken/generate-kenken.ts --difficulty genius --count 10 --size 6
```

The script **appends** to the existing library file. Solutions are de-duplicated
against existing puzzles by signature, and new IDs continue from the highest
existing sequence number.

To start fresh, empty the file first:

```bash
printf '{\n  "difficulty": "genius",\n  "puzzles": [],\n  "schemaVersion": 1\n}\n' \
  > src/lib/games/kenken/puzzles/genius.json
```

## CLI flags

| Flag           | Required | Default      | Description                                              |
| -------------- | -------- | ------------ | -------------------------------------------------------- |
| `--difficulty` | yes      | —            | `easy` \| `intermediate` \| `hard` \| `genius`           |
| `--count`      | no       | `10`         | Number of new puzzles to add                             |
| `--seed`       | no       | `Date.now()` | Seed for the mulberry32 RNG; same seed → same puzzles    |
| `--size`       | no       | random       | Restrict generation to a single grid size in the tier    |

Variants (grid size + allowed ops) per difficulty are defined in
[`src/lib/games/kenken/difficulty.ts`](../../../src/lib/games/kenken/difficulty.ts).
Without `--size` the generator picks a variant uniformly at random per puzzle,
so a single run produces a mix of sizes within the tier. With `--size N` it
generates only puzzles of that size (must be a valid variant of the tier).

## Tier configuration

| Tier         | Grid sizes | Operations              | maxCageSize |
| ------------ | ---------- | ----------------------- | ----------- |
| easy         | 3          | `+ - × ÷`               | 3           |
| easy         | 4, 5       | `+ - ×` (no division)   | 3           |
| intermediate | 4, 5       | `+ - × ÷`               | 4           |
| hard         | 6, 7       | `+ - ×` (no division)   | 4           |
| genius       | 6, 7       | `+ - × ÷`               | 5           |
| genius       | 8, 9       | `+ - ×` (no division)   | 5           |

Freebie counts (pre-filled cells) are determined at runtime from
[`freebies.ts`](../../../src/lib/games/kenken/freebies.ts) — they are not stored
in the puzzle JSON, so existing puzzles pick up new freebie counts automatically.

## Performance notes

Generation time is dominated by `countSolutions(... 2)` in
[`solver.ts`](../../../src/lib/games/kenken/solver.ts), which proves uniqueness
by attempting to find a second solution via backtracking.

- 3×3 – 5×5: milliseconds per puzzle.
- 6×6 – 7×7: tens to hundreds of milliseconds.
- 8×8 – 9×9: seconds to minutes per puzzle. The current Latin-square +
  random-partition approach often produces ambiguous puzzles at this size, so
  many attempts are discarded before one survives the uniqueness check.

The script picks variants uniformly, so a `--count 50` genius run will spend the
majority of its time on the ~25 large-grid puzzles. If a run hangs, kill it
(`Ctrl-C`) and use `--size` to generate each variant separately:

```bash
bun scripts/bb/kenken/generate-kenken.ts --difficulty genius --size 6 --count 15
bun scripts/bb/kenken/generate-kenken.ts --difficulty genius --size 7 --count 15
bun scripts/bb/kenken/generate-kenken.ts --difficulty genius --size 8 --count 10
bun scripts/bb/kenken/generate-kenken.ts --difficulty genius --size 9 --count 5
```

This lets you cap time on the slowest variants and resume after interruption
without losing progress on the smaller sizes.

## Output format

Each library file conforms to `KenKenLibrary`:

```json
{
  "difficulty": "easy",
  "schemaVersion": 1,
  "puzzles": [
    {
      "id": "k3-easy-00001",
      "size": 3,
      "difficulty": "easy",
      "solution": [[1,2,3],[2,3,1],[3,1,2]],
      "cages": [
        { "op": "+", "target": 6, "cells": [[0,0],[0,1],[0,2]] },
        { "op": "=", "target": 2, "cells": [[1,0]] }
      ]
    }
  ]
}
```

Generated IDs follow the pattern `k{size}-{difficulty}-{NNNNN}` where `NNNNN` is
a zero-padded sequence number. The script will keep incrementing from the
highest existing sequence in the file.

Every generated library is run through `validateLibrary()` before being written
— a generation that produces an invalid library throws instead of overwriting
the file.
