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
  /** Model family the landscape modules should fit on this dataset.
   * "line" (default): y = m·x + b. "bump": y = m·exp(-(x-b)²/2σ²), which
   * makes the loss landscape non-convex on two-hill data. */
  model?: "line" | "bump";
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

// Two hills of different heights: fit with a single movable bump and the
// loss landscape gets a global valley (tall hill) plus a genuine local
// valley (short hill), separated by a ridge.
const twoHills: Point[] = generate(
  55,
  36,
  (x) =>
    2.0 * Math.exp(-0.5 * Math.pow((x + 0.7) / 0.25, 2)) +
    1.0 * Math.exp(-0.5 * Math.pow((x - 0.7) / 0.25, 2)),
  0.08
);

/** The dataset that makes the landscape non-convex; only the landscape
 * modules (Loss Landscape, Gradient Descent Race) include it. */
export const twoHillsDataset: RegressionDataset = {
  id: "two-hills",
  label: "Two hills",
  description: "Two bumps, one taller. The model is a single movable bump: which hill will it grab?",
  points: twoHills,
  model: "bump"
};

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
