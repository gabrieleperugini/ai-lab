import type { SamplingFamily } from "../content/day1-llm/samplingTrees";
import { normalize } from "./sampling";
import type { Distribution } from "./sampling";

/**
 * Turns a family's weighted storylines into a next-token distribution given
 * the tokens generated so far. Storylines are tokenized on whitespace;
 * punctuation stays attached to its word (good enough for a teaching tool).
 */

export function tokenizeStoryline(text: string): string[] {
  return text.trim().split(/\s+/);
}

export type StepResult = {
  dist: Distribution;
  /** True when we fell back to the generic distribution (off every storyline). */
  offStory: boolean;
};

export function nextTokenDistribution(family: SamplingFamily, generated: string[]): StepResult {
  // Storylines whose beginning matches everything generated so far.
  const matches = family.storylines.filter((s) => {
    const tokens = tokenizeStoryline(s.text);
    if (tokens.length <= generated.length) return false;
    return generated.every((g, i) => tokens[i] === g);
  });

  if (matches.length === 0) {
    // We wandered off every storyline: use the family fallback, keeping a
    // pinch of noise so high temperatures stay chaotic.
    const dist: Distribution = { ...family.fallback };
    for (const [tok, w] of Object.entries(family.noise)) {
      dist[tok] = (dist[tok] ?? 0) + w * 0.05;
    }
    return { dist: normalize(dist), offStory: true };
  }

  const storyDist: Distribution = {};
  for (const s of matches) {
    const tokens = tokenizeStoryline(s.text);
    const next = tokens[generated.length];
    storyDist[next] = (storyDist[next] ?? 0) + s.weight;
  }

  const storyMass = 1 - family.noiseMass;
  const dist: Distribution = {};
  const normStory = normalize(storyDist);
  for (const [tok, p] of Object.entries(normStory)) dist[tok] = p * storyMass;
  const normNoise = normalize(family.noise);
  for (const [tok, p] of Object.entries(normNoise)) {
    dist[tok] = (dist[tok] ?? 0) + p * family.noiseMass;
  }
  return { dist: normalize(dist), offStory: false };
}

/** True if a token ends a sentence. */
export function endsSentence(token: string): boolean {
  return /[.!?]$/.test(token);
}
