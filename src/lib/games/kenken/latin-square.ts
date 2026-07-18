import { type Rng, shuffle } from "./rng";

export function generateLatinSquare(size: number, rng: Rng): number[][] {
  const base: number[][] = [];
  for (let i = 0; i < size; i += 1) {
    const row: number[] = [];
    for (let j = 0; j < size; j += 1) {
      row.push(((i + j) % size) + 1);
    }
    base.push(row);
  }

  const indices = Array.from({ length: size }, (_, i) => i);
  const rowOrder = shuffle(rng, indices);
  const colOrder = shuffle(rng, indices);
  const symbols = shuffle(
    rng,
    Array.from({ length: size }, (_, i) => i + 1)
  );

  const result: number[][] = [];
  for (let i = 0; i < size; i += 1) {
    const row: number[] = [];
    for (let j = 0; j < size; j += 1) {
      const baseValue = base[rowOrder[i]][colOrder[j]];
      row.push(symbols[baseValue - 1]);
    }
    result.push(row);
  }
  return result;
}
