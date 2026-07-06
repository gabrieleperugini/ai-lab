/**
 * Datasets for LM5 Generalization Challenge: a hidden true curve, noisy
 * training samples, and a fixed test set from the same curve. Deterministic.
 */

import { makeRng, gaussian } from "../../lib/learning/rng";
import type { Point } from "../../lib/learning/regression";

export type GeneralizationPreset = {
  id: string;
  label: string;
  description: string;
  trueFn: (x: number) => number;
  defaultNoise: number;
  defaultTrainSize: number;
  seed: number;
};

export const generalizationPresets: GeneralizationPreset[] = [
  {
    id: "smooth",
    label: "Smooth curve",
    description: "A gentle wave with little noise.",
    trueFn: (x) => Math.sin(3 * x),
    defaultNoise: 0.12,
    defaultTrainSize: 30,
    seed: 7
  },
  {
    id: "noisy",
    label: "Noisy curve",
    description: "The same wave, but measurements are messy.",
    trueFn: (x) => Math.sin(3 * x),
    defaultNoise: 0.4,
    defaultTrainSize: 30,
    seed: 8
  },
  {
    id: "few",
    label: "Few examples",
    description: "Only a handful of training points: overfitting paradise.",
    trueFn: (x) => Math.sin(3 * x),
    defaultNoise: 0.18,
    defaultTrainSize: 8,
    seed: 9
  }
];

export function samplePoints(
  preset: GeneralizationPreset,
  n: number,
  noise: number,
  seedOffset: number
): Point[] {
  const rng = makeRng(preset.seed * 1000 + seedOffset);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const x = -1 + 2 * rng();
    pts.push({ x, y: preset.trueFn(x) + gaussian(rng) * noise });
  }
  return pts.sort((a, b) => a.x - b.x);
}
