/**
 * Detector-based digit classifier shared by the Feature Detector Lab and
 * Fool the Network. Activations are overlap scores between the input grid
 * and each detector template.
 *
 * Classification is nearest-prototype with several prototypes per class:
 * the activation vectors of the clean, shifted, and thickened variants of
 * each digit. Confidences are a softmax over the negative class distances,
 * so probabilities respond gradually to edits. Because shifted and thick
 * variants are prototypes, the model RESISTS those perturbations, while
 * noise and occlusion can still fool it. The noisy variants are deliberately
 * left out of the prototypes so noise remains an effective attack.
 * A simplified, fully transparent model: no training happens here.
 */

import { detectors } from "../../content/learning-machines/featureDetectors";
import { DIGIT_LABELS, digitTemplates } from "../../content/learning-machines/digitTemplates";
import type { DigitGrid } from "../../content/learning-machines/digitTemplates";

/** Fraction of the detector's zone that is inked, in [0, 1]. */
export function activation(grid: DigitGrid, template: DigitGrid): number {
  let hit = 0;
  let zone = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (template[r][c]) {
        zone++;
        if (grid[r][c]) hit++;
      }
    }
  }
  return zone === 0 ? 0 : hit / zone;
}

export function activationVector(grid: DigitGrid, detectorIds?: string[]): number[] {
  const sel = detectorIds
    ? detectors.filter((d) => detectorIds.includes(d.id))
    : detectors;
  return sel.map((d) => activation(grid, d.template));
}

const PROTOTYPE_VARIANTS = ["clean", "shifted", "thick"];

/** Per-class prototype activation vectors over ALL detectors. */
export const classPrototypes: Record<string, number[][]> = Object.fromEntries(
  DIGIT_LABELS.map((label) => [
    label,
    digitTemplates
      .filter((t) => t.label === label && PROTOTYPE_VARIANTS.includes(t.variant))
      .map((t) => activationVector(t.grid))
  ])
);

/** Confidence per digit (softmax over negative distances to the nearest
 * prototype of each class, restricted to the selected detectors). */
export function classify(
  grid: DigitGrid,
  detectorIds?: string[]
): { label: string; confidence: number }[] {
  const ids = detectorIds ?? detectors.map((d) => d.id);
  const idx = ids.map((id) => detectors.findIndex((d) => d.id === id));
  const a = activationVector(grid, ids);
  const scores = DIGIT_LABELS.map((label) => {
    let best = Infinity;
    for (const proto of classPrototypes[label]) {
      let d2 = 0;
      for (let k = 0; k < idx.length; k++) {
        const diff = a[k] - proto[idx[k]];
        d2 += diff * diff;
      }
      const d = Math.sqrt(d2 / Math.max(idx.length, 1));
      if (d < best) best = d;
    }
    return -best;
  });
  const T = 0.08; // sharpness of the confidence bars
  const mx = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - mx) / T));
  const total = exps.reduce((x, y) => x + y, 0);
  return DIGIT_LABELS.map((label, i) => ({ label, confidence: exps[i] / total })).sort(
    (x, y) => y.confidence - x.confidence
  );
}
