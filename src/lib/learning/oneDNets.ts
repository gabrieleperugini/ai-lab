/**
 * Tiny 1D sigmoid-neuron networks for the One-Dimensional Neural Nets module.
 * Formulas translated from the course Mathematica notebook (slopes.nb):
 *
 *   neuron[x_, b_]  := 1/(1+Exp[-x+b])                      -> neuron(x, b) = sigmoid(x - b)
 *   truep[x_]       := 1/(1+Exp[-x+2.1])                    -> stepTarget(x) = sigmoid(x - 2.1)
 *   truep2[x_]      := (1/(1+Exp[-x-2.1])) (1/(1+Exp[x-5])) -> bumpTarget(x) = sigmoid(x+2.1)·sigmoid(5-x)
 *   neuralnet[x_, w1_, w2_, b1_, b2_, b3_]
 *     := neuron[w1 neuron[x, b1] + w2 neuron[x, b2], b3]
 *
 * The loss is MSE between the model curve and the target curve on a fixed
 * x grid (consistent with the rest of the section, which uses MSE).
 */

import { makeRng } from "./rng";

export function sigmoid(z: number): number {
  if (z > 30) return 1;
  if (z < -30) return 0;
  return 1 / (1 + Math.exp(-z));
}

/** One sigmoid neuron with a threshold: sigmoid(x - b). */
export function neuron(x: number, b: number): number {
  return sigmoid(x - b);
}

/** Step-like target for the one-neuron activity (truep in the notebook). */
export function stepTarget(x: number): number {
  return sigmoid(x - 2.1);
}

/** Soft window/bump target for the five-parameter activity (truep2). */
export function bumpTarget(x: number): number {
  return sigmoid(x + 2.1) * sigmoid(5.0 - x);
}

export type NetParams = {
  w1: number;
  w2: number;
  b1: number;
  b2: number;
  b3: number;
};

/** Two hidden sigmoid neurons + one output sigmoid neuron (five parameters). */
export function neuralnet(x: number, p: NetParams): number {
  return sigmoid(p.w1 * neuron(x, p.b1) + p.w2 * neuron(x, p.b2) - p.b3);
}

export const X_MIN = -8;
export const X_MAX = 8;

export function xGrid(n = 81): number[] {
  return Array.from({ length: n }, (_, i) => X_MIN + ((X_MAX - X_MIN) * i) / (n - 1));
}

/** MSE between a model curve and the target curve on the standard grid. */
export function curveMse(model: (x: number) => number, target: (x: number) => number): number {
  const xs = xGrid();
  let s = 0;
  for (const x of xs) {
    const d = model(x) - target(x);
    s += d * d;
  }
  return s / xs.length;
}

/** Binary sample points drawn from the target probability (y = 1 with
 * probability target(x)), like the notebook's generated datasets.
 * Deterministic for a given seed. */
export function sampleBinaryPoints(
  target: (x: number) => number,
  n: number,
  seed: number
): { x: number; y: number }[] {
  const rng = makeRng(seed);
  return Array.from({ length: n }, () => {
    const x = X_MIN + (X_MAX - X_MIN) * rng();
    return { x, y: rng() < target(x) ? 1 : 0 };
  }).sort((a, b) => a.x - b.x);
}

const PARAM_KEYS: (keyof NetParams)[] = ["w1", "w2", "b1", "b2", "b3"];

/** One gradient-descent step on the five parameters, with finite-difference
 * gradients of the curve MSE. Returns the new parameters and their loss. */
export function descentStep(
  p: NetParams,
  target: (x: number) => number,
  lr: number
): { params: NetParams; loss: number } {
  const eps = 1e-3;
  const lossAt = (q: NetParams) => curveMse((x) => neuralnet(x, q), target);
  const out: NetParams = { ...p };
  for (const k of PARAM_KEYS) {
    const plus = { ...p, [k]: p[k] + eps };
    const minus = { ...p, [k]: p[k] - eps };
    const g = (lossAt(plus) - lossAt(minus)) / (2 * eps);
    out[k] = p[k] - lr * g;
  }
  return { params: out, loss: lossAt(out) };
}
