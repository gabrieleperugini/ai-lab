/**
 * Data Detective toy world. Objects have a shape (the TRUE rule: round =
 * Class A), a color (the tempting shortcut) and a background texture (an
 * irrelevant distractor). Bias presets control how strongly color correlates
 * with the label in the TRAINING data; test worlds control whether that
 * correlation survives at test time.
 */

import { makeRng } from "../../lib/learning/rng";
import type { Rng } from "../../lib/learning/rng";

export type ToyObject = {
  shape: "circle" | "square" | "triangle";
  color: "blue" | "red";
  striped: boolean;
  /** True rule: Class A (1) = round object. */
  label: 0 | 1;
};

export type BiasPreset = { id: string; label: string; pBlueGivenA: number };

export const biasPresets: BiasPreset[] = [
  { id: "balanced", label: "Balanced", pBlueGivenA: 0.5 },
  { id: "mild", label: "Mild shortcut", pBlueGivenA: 0.75 },
  { id: "strong", label: "Strong shortcut", pBlueGivenA: 0.92 },
  { id: "extreme", label: "Extreme shortcut", pBlueGivenA: 1.0 }
];

export type TestWorld = { id: string; label: string; description: string; pBlueGivenA: number };

export const testWorlds: TestWorld[] = [
  {
    id: "ordinary",
    label: "Ordinary test",
    description: "New objects from the same biased world.",
    pBlueGivenA: -1 // sentinel: use the training bias
  },
  {
    id: "broken",
    label: "Shortcut broken",
    description: "Colors are now random: only the true rule survives.",
    pBlueGivenA: 0.5
  },
  {
    id: "swapped",
    label: "Colors swapped",
    description: "The correlation is reversed: blue now hints Class B.",
    pBlueGivenA: 0.0
  }
];

export const trainSizes = [12, 24, 48];
export const noiseLevels = [
  { id: "none", label: "None", p: 0 },
  { id: "low", label: "Low", p: 0.1 },
  { id: "medium", label: "Medium", p: 0.2 }
];

function makeObject(rng: Rng, pBlueGivenA: number, labelNoise: number): ToyObject {
  const isA = rng() < 0.5;
  const shape: ToyObject["shape"] = isA
    ? "circle"
    : rng() < 0.5
      ? "square"
      : "triangle";
  const pBlue = isA ? pBlueGivenA : 1 - pBlueGivenA;
  const color = rng() < pBlue ? "blue" : "red";
  const striped = rng() < 0.35;
  let label: 0 | 1 = isA ? 1 : 0;
  if (rng() < labelNoise) label = (1 - label) as 0 | 1;
  return { shape, color, striped, label };
}

export function makeTrainingSet(
  biasId: string,
  size: number,
  noise: number,
  seed: number
): ToyObject[] {
  const bias = biasPresets.find((b) => b.id === biasId)!;
  const rng = makeRng(seed);
  return Array.from({ length: size }, () => makeObject(rng, bias.pBlueGivenA, noise));
}

export function makeTestSet(worldId: string, trainBiasId: string, seed: number): ToyObject[] {
  const world = testWorlds.find((w) => w.id === worldId)!;
  const p =
    world.pBlueGivenA < 0
      ? biasPresets.find((b) => b.id === trainBiasId)!.pBlueGivenA
      : world.pBlueGivenA;
  const rng = makeRng(seed);
  return Array.from({ length: 40 }, () => makeObject(rng, p, 0));
}
