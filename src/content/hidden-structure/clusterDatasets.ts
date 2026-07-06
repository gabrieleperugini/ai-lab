/**
 * Seeded 2D toy datasets for the clustering modules (U2, U3, U4).
 * Coordinates in [-1, 1]. `group` is the hidden human-intended structure,
 * revealed only on request; algorithms never see it.
 */

import { makeRng, gaussian } from "../../lib/learning/rng";
import type { Rng } from "../../lib/learning/rng";
import type { P2 } from "../../lib/hidden/kmeans";

export type LabeledPoint = P2 & { group: number };

export type ClusterDataset = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** How many groups a human would see (used as the default k and reveal). */
  hiddenGroups: number;
  /** Suggested by U3: will k-means plausibly work here? */
  blobby: boolean;
  points: LabeledPoint[];
};

const clamp = (v: number) => Math.max(-0.98, Math.min(0.98, v));

function blob(rng: Rng, cx: number, cy: number, spread: number, n: number, group: number): LabeledPoint[] {
  return Array.from({ length: n }, () => ({
    x: clamp(cx + gaussian(rng) * spread),
    y: clamp(cy + gaussian(rng) * spread),
    group
  }));
}

function easyBlobs(): LabeledPoint[] {
  const rng = makeRng(310);
  return [
    ...blob(rng, -0.55, -0.4, 0.13, 34, 0),
    ...blob(rng, 0.55, -0.35, 0.13, 34, 1),
    ...blob(rng, 0.0, 0.55, 0.13, 34, 2)
  ];
}

function unequalBlobs(): LabeledPoint[] {
  const rng = makeRng(320);
  return [...blob(rng, -0.35, 0.0, 0.24, 72, 0), ...blob(rng, 0.68, 0.5, 0.07, 16, 1)];
}

function outlierBlobs(): LabeledPoint[] {
  const rng = makeRng(330);
  return [
    ...blob(rng, -0.5, -0.3, 0.12, 40, 0),
    ...blob(rng, 0.25, 0.35, 0.12, 40, 1),
    { x: 0.92, y: -0.9, group: 2 } // the far-away troublemaker
  ];
}

function twoMoons(): LabeledPoint[] {
  // standard two-moons construction (well separated, evenly spaced arcs)
  const rng = makeRng(340);
  const pts: LabeledPoint[] = [];
  const N = 55;
  for (let i = 0; i < N; i++) {
    const t = (Math.PI * i) / (N - 1);
    pts.push({
      x: clamp(0.72 * Math.cos(t) - 0.36 + gaussian(rng) * 0.03),
      y: clamp(0.72 * Math.sin(t) - 0.18 + gaussian(rng) * 0.03),
      group: 0
    });
    pts.push({
      x: clamp(0.72 - 0.72 * Math.cos(t) - 0.36 + gaussian(rng) * 0.03),
      y: clamp(0.36 - 0.72 * Math.sin(t) - 0.18 + gaussian(rng) * 0.03),
      group: 1
    });
  }
  return pts;
}

function circles(): LabeledPoint[] {
  // evenly spaced ring and core so neighbors chain smoothly along each circle
  const rng = makeRng(350);
  const pts: LabeledPoint[] = [];
  const N = 45;
  for (let i = 0; i < N; i++) {
    const a1 = (2 * Math.PI * i) / N;
    pts.push({
      x: clamp(Math.cos(a1) * 0.3 + gaussian(rng) * 0.025),
      y: clamp(Math.sin(a1) * 0.3 + gaussian(rng) * 0.025),
      group: 0
    });
    const a2 = (2 * Math.PI * i) / N + 0.07;
    pts.push({
      x: clamp(Math.cos(a2) * 0.82 + gaussian(rng) * 0.025),
      y: clamp(Math.sin(a2) * 0.82 + gaussian(rng) * 0.025),
      group: 1
    });
  }
  return pts;
}

function spiralArms(): LabeledPoint[] {
  // fewer turns and denser sampling keep along-arm neighbors closer than
  // the gap between arms, so a kNN graph can follow each arm
  const rng = makeRng(360);
  const pts: LabeledPoint[] = [];
  const perArm = 60;
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < perArm; i++) {
      const t = (i / (perArm - 1)) * 2.2 * Math.PI + 0.4;
      const r = 0.12 + (0.78 * i) / (perArm - 1);
      const a = t + arm * Math.PI;
      pts.push({
        x: clamp(r * Math.cos(a) + gaussian(rng) * 0.012),
        y: clamp(r * Math.sin(a) + gaussian(rng) * 0.012),
        group: arm
      });
    }
  }
  return pts;
}

function bridge(): LabeledPoint[] {
  const rng = makeRng(370);
  const pts: LabeledPoint[] = [
    ...blob(rng, -0.55, 0, 0.13, 42, 0),
    ...blob(rng, 0.55, 0, 0.13, 42, 1)
  ];
  // a thin bridge of points connecting the two blobs
  for (let i = 0; i < 12; i++) {
    pts.push({
      x: clamp(-0.35 + (0.7 * i) / 11 + gaussian(rng) * 0.02),
      y: clamp(gaussian(rng) * 0.025),
      group: 2
    });
  }
  return pts;
}

function densities(): LabeledPoint[] {
  const rng = makeRng(380);
  return [...blob(rng, -0.45, -0.1, 0.3, 60, 0), ...blob(rng, 0.62, 0.45, 0.06, 30, 1)];
}

export const clusterDatasets: ClusterDataset[] = [
  { id: "blobs", label: "Easy blobs", emoji: "🫧", description: "Three friendly compact groups.", hiddenGroups: 3, blobby: true, points: easyBlobs() },
  { id: "unequal", label: "Unequal sizes", emoji: "🐘", description: "One big group, one small group.", hiddenGroups: 2, blobby: true, points: unequalBlobs() },
  { id: "outlier", label: "Outlier trouble", emoji: "🎯", description: "Two compact groups plus one far-away point.", hiddenGroups: 2, blobby: true, points: outlierBlobs() },
  { id: "moons", label: "Two moons", emoji: "🌙", description: "Two interleaved crescents.", hiddenGroups: 2, blobby: false, points: twoMoons() },
  { id: "circles", label: "Concentric circles", emoji: "🎯", description: "A ring around a core.", hiddenGroups: 2, blobby: false, points: circles() },
  { id: "spiral", label: "Spiral arms", emoji: "🌀", description: "Two arms wrapped around each other.", hiddenGroups: 2, blobby: false, points: spiralArms() },
  { id: "bridge", label: "Bridge", emoji: "🌉", description: "Two groups connected by a thin bridge.", hiddenGroups: 2, blobby: false, points: bridge() },
  { id: "density", label: "Different densities", emoji: "💨", description: "A wide sparse cloud and a tight dense one.", hiddenGroups: 2, blobby: false, points: densities() }
];

/** Subsets used by the modules. */
export const kmeansDatasetIds = ["blobs", "unequal", "outlier", "bridge"];
export const breakDatasetIds = ["moons", "circles", "spiral", "bridge", "density"];
export const spectralDatasetIds = ["moons", "circles", "spiral", "bridge", "density"];

export function getClusterDataset(id: string): ClusterDataset {
  return clusterDatasets.find((d) => d.id === id)!;
}
