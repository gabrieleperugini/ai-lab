/**
 * A tiny multilayer perceptron for 2D binary classification, written in
 * plain TypeScript: forward pass, backpropagation, full-batch gradient
 * descent. Small enough to train live in the browser (a few hundred points,
 * networks up to 3 hidden layers x 8 neurons).
 */

import { makeRng, gaussian } from "./rng";

export type Activation = "tanh" | "relu";

export type NNConfig = {
  hiddenLayers: number[]; // e.g. [4, 4]; [] means logistic regression
  activation: Activation;
  seed: number;
};

export type Sample = { x1: number; x2: number; label: 0 | 1 };

type Layer = {
  w: number[][]; // [out][in]
  b: number[];
};

export class TinyNN {
  layers: Layer[] = [];
  sizes: number[];
  activation: Activation;

  constructor(cfg: NNConfig) {
    this.sizes = [2, ...cfg.hiddenLayers, 1];
    this.activation = cfg.activation;
    const rng = makeRng(cfg.seed);
    for (let l = 0; l < this.sizes.length - 1; l++) {
      const nIn = this.sizes[l];
      const nOut = this.sizes[l + 1];
      const scale = Math.sqrt(2 / nIn);
      this.layers.push({
        w: Array.from({ length: nOut }, () =>
          Array.from({ length: nIn }, () => gaussian(rng) * scale)
        ),
        b: Array.from({ length: nOut }, () => 0)
      });
    }
  }

  paramCount(): number {
    return this.layers.reduce((s, l) => s + l.w.length * l.w[0].length + l.b.length, 0);
  }

  private act(v: number): number {
    return this.activation === "tanh" ? Math.tanh(v) : Math.max(0, v);
  }

  private actGrad(pre: number, post: number): number {
    return this.activation === "tanh" ? 1 - post * post : pre > 0 ? 1 : 0;
  }

  /** Probability of class 1. */
  predict(x1: number, x2: number): number {
    let a = [x1, x2];
    for (let l = 0; l < this.layers.length; l++) {
      const { w, b } = this.layers[l];
      const out = new Array<number>(w.length);
      const last = l === this.layers.length - 1;
      for (let j = 0; j < w.length; j++) {
        let z = b[j];
        for (let i = 0; i < a.length; i++) z += w[j][i] * a[i];
        out[j] = last ? 1 / (1 + Math.exp(-z)) : this.act(z);
      }
      a = out;
    }
    return a[0];
  }

  /** One full-batch gradient step; returns the mean BCE loss BEFORE the step. */
  trainStep(data: Sample[], lr: number): number {
    const L = this.layers.length;
    // accumulators
    const gw = this.layers.map((l) => l.w.map((row) => row.map(() => 0)));
    const gb = this.layers.map((l) => l.b.map(() => 0));
    let loss = 0;

    for (const s of data) {
      // forward, caching pre/post activations
      const acts: number[][] = [[s.x1, s.x2]];
      const pres: number[][] = [];
      for (let l = 0; l < L; l++) {
        const { w, b } = this.layers[l];
        const pre = new Array<number>(w.length);
        const post = new Array<number>(w.length);
        const last = l === L - 1;
        for (let j = 0; j < w.length; j++) {
          let z = b[j];
          for (let i = 0; i < acts[l].length; i++) z += w[j][i] * acts[l][i];
          pre[j] = z;
          post[j] = last ? 1 / (1 + Math.exp(-z)) : this.act(z);
        }
        pres.push(pre);
        acts.push(post);
      }
      const p = Math.min(Math.max(acts[L][0], 1e-7), 1 - 1e-7);
      loss += s.label === 1 ? -Math.log(p) : -Math.log(1 - p);

      // backward; sigmoid + BCE gives delta = p - y at the output
      let delta = [p - s.label];
      for (let l = L - 1; l >= 0; l--) {
        const { w } = this.layers[l];
        for (let j = 0; j < w.length; j++) {
          gb[l][j] += delta[j];
          for (let i = 0; i < acts[l].length; i++) gw[l][j][i] += delta[j] * acts[l][i];
        }
        if (l > 0) {
          const prev = new Array<number>(acts[l].length).fill(0);
          for (let i = 0; i < acts[l].length; i++) {
            let s2 = 0;
            for (let j = 0; j < w.length; j++) s2 += w[j][i] * delta[j];
            prev[i] = s2 * this.actGrad(pres[l - 1][i], acts[l][i]);
          }
          delta = prev;
        }
      }
    }

    const n = data.length;
    for (let l = 0; l < L; l++) {
      for (let j = 0; j < this.layers[l].w.length; j++) {
        this.layers[l].b[j] -= (lr * gb[l][j]) / n;
        for (let i = 0; i < this.layers[l].w[j].length; i++) {
          this.layers[l].w[j][i] -= (lr * gw[l][j][i]) / n;
        }
      }
    }
    return loss / n;
  }

  /** True if any weight became NaN/Infinity (diverged training). */
  diverged(): boolean {
    return this.layers.some(
      (l) => l.b.some((v) => !Number.isFinite(v)) || l.w.some((r) => r.some((v) => !Number.isFinite(v)))
    );
  }
}

export function bceLoss(nn: TinyNN, data: Sample[]): number {
  if (data.length === 0) return 0;
  let s = 0;
  for (const d of data) {
    const p = Math.min(Math.max(nn.predict(d.x1, d.x2), 1e-7), 1 - 1e-7);
    s += d.label === 1 ? -Math.log(p) : -Math.log(1 - p);
  }
  return s / data.length;
}

export function accuracy(nn: TinyNN, data: Sample[]): number {
  if (data.length === 0) return 0;
  let ok = 0;
  for (const d of data) {
    if ((nn.predict(d.x1, d.x2) >= 0.5 ? 1 : 0) === d.label) ok++;
  }
  return ok / data.length;
}
