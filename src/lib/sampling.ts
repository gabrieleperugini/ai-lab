/** Probability distribution over token strings. */
export type Distribution = Record<string, number>;

export function normalize(dist: Distribution): Distribution {
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  if (total <= 0) return dist;
  const out: Distribution = {};
  for (const [k, v] of Object.entries(dist)) out[k] = v / total;
  return out;
}

/**
 * Apply temperature: p_i^(1/T), then renormalize.
 * T < 1 sharpens the distribution (more predictable);
 * T > 1 flattens it (more surprising).
 */
export function applyTemperature(dist: Distribution, temperature: number): Distribution {
  const t = Math.max(temperature, 0.05);
  const out: Distribution = {};
  for (const [k, v] of Object.entries(dist)) {
    out[k] = Math.pow(Math.max(v, 1e-12), 1 / t);
  }
  return normalize(out);
}

/** Keep only the k most likely tokens, then renormalize. k <= 0 means "all". */
export function applyTopK(dist: Distribution, k: number): Distribution {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  if (k <= 0 || k >= entries.length) return normalize(dist);
  const kept = entries.slice(0, k);
  return normalize(Object.fromEntries(kept));
}

/** Draw one token according to the distribution. */
export function sample(dist: Distribution, rng: () => number = Math.random): string {
  const entries = Object.entries(dist);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  let r = rng() * total;
  for (const [token, p] of entries) {
    r -= p;
    if (r <= 0) return token;
  }
  return entries[entries.length - 1][0];
}

/** Softmax with temperature over raw scores. */
export function softmax(scores: number[], temperature = 1): number[] {
  const t = Math.max(temperature, 0.05);
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - max) / t));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / total);
}

/** Sort distribution entries by probability, descending, "other" always last. */
export function sortedEntries(dist: Distribution): [string, number][] {
  return Object.entries(dist).sort((a, b) => {
    if (a[0] === "other") return 1;
    if (b[0] === "other") return -1;
    return b[1] - a[1];
  });
}
