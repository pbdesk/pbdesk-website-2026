export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  // biome-ignore lint/suspicious/noBitwiseOperators: mulberry32 PRNG algorithm
  let a = seed >>> 0;
  return () => {
    // biome-ignore lint/suspicious/noBitwiseOperators: mulberry32 PRNG algorithm
    a = (a + 0x6d_2b_79_f5) | 0;
    // biome-ignore lint/suspicious/noBitwiseOperators: mulberry32 PRNG algorithm
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    // biome-ignore lint/suspicious/noBitwiseOperators: mulberry32 PRNG algorithm
    // biome-ignore lint/style/useShorthandAssign: mulberry32 PRNG algorithm
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    // biome-ignore lint/suspicious/noBitwiseOperators: mulberry32 PRNG algorithm
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function randInt(rng: Rng, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive);
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
