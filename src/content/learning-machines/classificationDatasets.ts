/**
 * 2D binary classification datasets for the LM6 Neural Network Playground.
 * All deterministic (seeded), coordinates in [-1, 1], split into train/test.
 */

import { makeRng, gaussian } from "../../lib/learning/rng";
import type { Rng } from "../../lib/learning/rng";
import type { Sample } from "../../lib/learning/tinyNN";

export type ClassificationDataset = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  train: Sample[];
  test: Sample[];
};

function clamp(v: number): number {
  return Math.max(-1, Math.min(1, v));
}

function split(points: Sample[], rng: Rng): { train: Sample[]; test: Sample[] } {
  const shuffled = [...points];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const cut = Math.floor(shuffled.length * 0.7);
  return { train: shuffled.slice(0, cut), test: shuffled.slice(cut) };
}

function blobs(seed: number): Sample[] {
  const rng = makeRng(seed);
  const pts: Sample[] = [];
  for (let i = 0; i < 90; i++) {
    const label = (i % 2) as 0 | 1;
    const cx = label === 1 ? 0.45 : -0.45;
    const cy = label === 1 ? 0.35 : -0.35;
    pts.push({ x1: clamp(cx + gaussian(rng) * 0.22), x2: clamp(cy + gaussian(rng) * 0.22), label });
  }
  return pts;
}

function xor(seed: number): Sample[] {
  const rng = makeRng(seed);
  const pts: Sample[] = [];
  for (let i = 0; i < 120; i++) {
    const qx = rng() < 0.5 ? -1 : 1;
    const qy = rng() < 0.5 ? -1 : 1;
    const label = (qx * qy > 0 ? 1 : 0) as 0 | 1;
    pts.push({
      x1: clamp(qx * (0.15 + 0.75 * rng())),
      x2: clamp(qy * (0.15 + 0.75 * rng())),
      label
    });
  }
  return pts;
}

function circle(seed: number): Sample[] {
  const rng = makeRng(seed);
  const pts: Sample[] = [];
  for (let i = 0; i < 130; i++) {
    const inner = i % 2 === 0;
    const r = inner ? 0.35 * Math.sqrt(rng()) : 0.6 + 0.3 * rng();
    const a = 2 * Math.PI * rng();
    pts.push({
      x1: clamp(r * Math.cos(a) + gaussian(rng) * 0.02),
      x2: clamp(r * Math.sin(a) + gaussian(rng) * 0.02),
      label: (inner ? 1 : 0) as 0 | 1
    });
  }
  return pts;
}

function moons(seed: number): Sample[] {
  const rng = makeRng(seed);
  const pts: Sample[] = [];
  for (let i = 0; i < 130; i++) {
    const top = i % 2 === 0;
    const t = Math.PI * rng();
    const x = top ? Math.cos(t) * 0.7 : 0.35 + Math.cos(Math.PI + t) * 0.7;
    const y = top ? Math.sin(t) * 0.7 - 0.15 : 0.25 + Math.sin(Math.PI + t) * 0.7;
    pts.push({
      x1: clamp(x + gaussian(rng) * 0.06),
      x2: clamp(y + gaussian(rng) * 0.06),
      label: (top ? 1 : 0) as 0 | 1
    });
  }
  return pts;
}

function spiral(seed: number, jitter: number, labelNoise: number): Sample[] {
  const rng = makeRng(seed);
  const pts: Sample[] = [];
  const perArm = 90;
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < perArm; i++) {
      const t = (i / perArm) * 3.2 * Math.PI + 0.4;
      const r = 0.05 + (0.85 * i) / perArm;
      const angle = t + arm * Math.PI;
      let label = arm as 0 | 1;
      if (rng() < labelNoise) label = (1 - label) as 0 | 1;
      pts.push({
        x1: clamp(r * Math.cos(angle) + gaussian(rng) * jitter),
        x2: clamp(r * Math.sin(angle) + gaussian(rng) * jitter),
        label
      });
    }
  }
  return pts;
}

function build(id: string, label: string, emoji: string, description: string, seed: number, gen: () => Sample[]): ClassificationDataset {
  const { train, test } = split(gen(), makeRng(seed + 999));
  return { id, label, emoji, description, train, test };
}

export const classificationDatasets: ClassificationDataset[] = [
  build("linear", "Two groups", "🟦", "Two clouds a straight boundary can separate.", 101, () => blobs(101)),
  build("xor", "XOR", "🧩", "Opposite corners belong together. One line is not enough.", 202, () => xor(202)),
  build("circle", "Circle", "⭕", "Inside versus outside a ring.", 303, () => circle(303)),
  build("moons", "Two moons", "🌙", "Two interleaved crescents.", 404, () => moons(404)),
  build("spiral", "Spiral", "🌀", "The boss fight: two interlocking spiral arms.", 505, () => spiral(505, 0.015, 0)),
  build("noisy-spiral", "Noisy spiral", "🌪️", "The spiral with noisy labels: beware of memorizing.", 606, () => spiral(606, 0.035, 0.08))
];
