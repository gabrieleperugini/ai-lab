/**
 * Regression datasets for LM2 Fit the Line, LM3 Loss Landscape and LM4
 * Gradient Descent. Deterministic (seeded), x normalized to [-1, 1], values
 * chosen so slope/intercept sliders in [-3, 3] cover everything interesting.
 */

import { makeRng, gaussian } from "../../lib/learning/rng";
import type { Point } from "../../lib/learning/regression";

export type RegressionDataset = {
  id: string;
  label: string;
  description: string;
  points: Point[];
  /** True when a straight line is the wrong model on purpose. */
  curved?: boolean;
};

function generate(
  seed: number,
  n: number,
  f: (x: number) => number,
  noise: number
): Point[] {
  const rng = makeRng(seed);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const x = -1 + (2 * i) / (n - 1) + (rng() - 0.5) * 0.05;
    pts.push({ x: Math.max(-1, Math.min(1, x)), y: f(x) + gaussian(rng) * noise });
  }
  return pts;
}

const cleanTrend = generate(11, 24, (x) => 1.2 * x + 0.5, 0.15);

const noisyTrend = generate(22, 24, (x) => -0.8 * x + 1.0, 0.45);

const outlierTrap: Point[] = [
  ...generate(33, 20, (x) => 0.9 * x - 0.2, 0.12),
  // two strong outliers pulling the line down on the right
  { x: 0.7, y: -2.6 },
  { x: 0.85, y: -2.2 }
];

const notALine = generate(44, 26, (x) => 2.2 * x * x - 1.0, 0.15);

export const regressionDatasets: RegressionDataset[] = [
  {
    id: "clean",
    label: "Clean trend",
    description: "A friendly, nearly linear cloud.",
    points: cleanTrend
  },
  {
    id: "noisy",
    label: "Noisy trend",
    description: "The same idea, but the world is messier.",
    points: noisyTrend
  },
  {
    id: "outlier",
    label: "Outlier trap",
    description: "Mostly a line, plus two strange points.",
    points: outlierTrap
  },
  {
    id: "curved",
    label: "Not a line",
    description: "A curved relation: the line is the wrong model here.",
    points: notALine,
    curved: true
  }
];
