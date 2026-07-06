/**
 * Two tiny learners for the Data Detective module, both fully transparent:
 *
 * - "shortcut": a deliberately lazy learner that picks the SINGLE feature
 *   with the highest training accuracy (ties resolved in the order color,
 *   background, shape, so the tempting feature wins ties). Labeled in the UI
 *   as a simplified learner.
 * - "linear": logistic regression on the three binary features, trained with
 *   a few hundred gradient steps (instant at this size).
 *
 * Feature reliance is the classifier's own weight distribution.
 */

import type { ToyObject } from "../../content/learning-machines/dataDetective";

export type FeatureName = "color" | "background" | "shape";

const FEATURES: { name: FeatureName; value: (o: ToyObject) => number }[] = [
  { name: "color", value: (o) => (o.color === "blue" ? 1 : 0) },
  { name: "background", value: (o) => (o.striped ? 1 : 0) },
  { name: "shape", value: (o) => (o.shape === "circle" ? 1 : 0) }
];

export type ToyModel = {
  kind: "shortcut" | "linear";
  predict: (o: ToyObject) => 0 | 1;
  reliance: Record<FeatureName, number>; // sums to 1
  descr: string;
};

export function toyAccuracy(model: ToyModel, data: ToyObject[]): number {
  if (data.length === 0) return 0;
  let ok = 0;
  for (const o of data) if (model.predict(o) === o.label) ok++;
  return ok / data.length;
}

export function trainShortcutLearner(train: ToyObject[]): ToyModel {
  // Laziness modeled honestly: features are scanned in salience order
  // (color, then background, then shape) and the learner STOPS at the first
  // one that is "good enough" on the training data. If none is good enough,
  // it falls back to the single best feature.
  const GOOD_ENOUGH = 0.85;
  const scored = FEATURES.map((f, idx) => {
    let agree = 0;
    for (const o of train) if ((f.value(o) === 1 ? 1 : 0) === o.label) agree++;
    const acc = agree / train.length;
    return acc >= 0.5 ? { acc, idx, flip: false } : { acc: 1 - acc, idx, flip: true };
  });
  let best = scored.find((s) => s.acc >= GOOD_ENOUGH) ?? scored.reduce((a, b) => (b.acc > a.acc ? b : a));
  const f = FEATURES[best.idx];
  const reliance = { color: 0, background: 0, shape: 0 };
  reliance[f.name] = 1;
  return {
    kind: "shortcut",
    predict: (o) => {
      const v = f.value(o) === 1 ? 1 : 0;
      return (best.flip ? 1 - v : v) as 0 | 1;
    },
    reliance,
    descr: `uses only '${f.name}'`
  };
}

export function trainLinearLearner(train: ToyObject[]): ToyModel {
  let w = [0, 0, 0];
  let b = 0;
  const lr = 0.6;
  for (let step = 0; step < 500; step++) {
    let gb = 0;
    const gw = [0, 0, 0];
    for (const o of train) {
      const x = FEATURES.map((f) => f.value(o));
      const z = w[0] * x[0] + w[1] * x[1] + w[2] * x[2] + b;
      const p = 1 / (1 + Math.exp(-z));
      const e = p - o.label;
      for (let i = 0; i < 3; i++) gw[i] += e * x[i];
      gb += e;
    }
    for (let i = 0; i < 3; i++) w[i] -= (lr * gw[i]) / train.length;
    b -= (lr * gb) / train.length;
  }
  const abs = w.map(Math.abs);
  const total = abs.reduce((x, y) => x + y, 0) || 1;
  return {
    kind: "linear",
    predict: (o) => {
      const x = FEATURES.map((f) => f.value(o));
      const z = w[0] * x[0] + w[1] * x[1] + w[2] * x[2] + b;
      return (z >= 0 ? 1 : 0) as 0 | 1;
    },
    reliance: {
      color: abs[0] / total,
      background: abs[1] / total,
      shape: abs[2] / total
    },
    descr: "weighs all three features"
  };
}
