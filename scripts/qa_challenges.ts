/** Scratch QA: solvability of Gradient Explorer + Fool the Network challenges.
 * Run: npx tsx scripts/qa_challenges.ts */
import { fEasy, f1d, f2d, deriv, grad2 } from "../src/lib/learning/gradients";
import { classify } from "../src/lib/learning/detectorClassifier";
import { cleanTemplate, DIGIT_LABELS } from "../src/content/learning-machines/digitTemplates";
import type { DigitGrid } from "../src/content/learning-machines/digitTemplates";

console.log("== 1D flat spot: min |slope| on the 0.05 slider grid ==");
for (const [name, f] of [["easy", fEasy], ["full", f1d]] as const) {
  let best = { x: 0, s: Infinity };
  for (let x = -5; x <= 5.0001; x += 0.05) {
    const s = Math.abs(deriv(f, x));
    if (s < best.s) best = { x, s };
  }
  console.log(`${name}: min |slope|=${best.s.toFixed(4)} at x=${best.x.toFixed(2)} (target < 0.05)`);
}

console.log("\n== 1D walk into valley: from x=4, steps to |slope|<0.05 ==");
for (const lr of [0.1, 0.3, 0.5, 1.0]) {
  let x = 4;
  let n = 0;
  while (n < 200 && Math.abs(deriv(f1d, x)) >= 0.05) {
    x = Math.max(-5, Math.min(5, x - lr * deriv(f1d, x)));
    n++;
  }
  console.log(`lr=${lr}: ${n < 200 ? `${n} steps, x=${x.toFixed(2)}` : "NOT within 200 steps, x=" + x.toFixed(2)}`);
}

console.log("\n== 1D overshoot on warm-up (f increases on a step), lr<=1 ==");
{
  let found = "";
  outer: for (const lr of [0.6, 0.8, 1.0]) {
    for (let x0 = -3; x0 <= 3.0001; x0 += 0.25) {
      let x = x0;
      for (let i = 0; i < 15; i++) {
        const nx = Math.max(-5, Math.min(5, x - lr * deriv(fEasy, x)));
        if (fEasy(nx) > fEasy(x) + 1e-9) {
          found = `lr=${lr}, start x=${x0.toFixed(2)}, at step ${i + 1}`;
          break outer;
        }
        x = nx;
      }
    }
  }
  console.log(found || "NOT FOUND with lr<=1");
}

console.log("\n== 2D overshoot: f increases on a step within 20 steps ==");
for (const lr of [1, 1.5, 2, 3]) {
  let found = "";
  for (const start of [[2.6, 2.2], [0, 0], [-1, 2], [2, -2]] as const) {
    let [a, b] = start;
    for (let i = 0; i < 20; i++) {
      const g = grad2(f2d, a, b);
      const na = Math.max(-3.5, Math.min(3.5, a - lr * g.d1));
      const nb = Math.max(-3.5, Math.min(3.5, b - lr * g.d2));
      if (f2d(na, nb) > f2d(a, b) + 1e-9) {
        found = `start (${start[0]},${start[1]}) step ${i + 1}`;
        break;
      }
      a = na;
      b = nb;
    }
    if (found) break;
  }
  console.log(`lr=${lr}: ${found || "no overshoot"}`);
}

console.log("\n== 2D smooth landing: 20 steps from reset, no increase, final |grad|<0.05 ==");
for (const lr of [0.2, 0.3, 0.5, 0.8, 1.0, 1.5]) {
  let [a, b] = [2.6, 2.2];
  let increased = false;
  for (let i = 0; i < 20; i++) {
    const g = grad2(f2d, a, b);
    const na = Math.max(-3.5, Math.min(3.5, a - lr * g.d1));
    const nb = Math.max(-3.5, Math.min(3.5, b - lr * g.d2));
    if (f2d(na, nb) > f2d(a, b) + 1e-9) increased = true;
    a = na;
    b = nb;
  }
  const gEnd = grad2(f2d, a, b);
  const gn = Math.hypot(gEnd.d1, gEnd.d2);
  console.log(
    `lr=${lr}: final |grad|=${gn.toFixed(3)} at (${a.toFixed(2)},${b.toFixed(2)}), increased=${increased} -> ${!increased && gn < 0.05 ? "SOLVED" : "not solved"}`
  );
}

console.log("\n== M9 smallest flip: greedy pixel search, <=4 edits ==");
function greedyFlip(label: string, maxEdits: number): { edits: number; to: string } | null {
  let grid: DigitGrid = cleanTemplate(label).grid.map((r) => [...r]);
  for (let e = 1; e <= maxEdits; e++) {
    let best: { r: number; c: number; conf: number; top: string } | null = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        grid[r][c] = grid[r][c] ? 0 : 1;
        const s = classify(grid);
        const own = s.find((x) => x.label === label)!.confidence;
        if (!best || own < best.conf) best = { r, c, conf: own, top: s[0].label };
        grid[r][c] = grid[r][c] ? 0 : 1;
      }
    }
    grid[best!.r][best!.c] = grid[best!.r][best!.c] ? 0 : 1;
    const top = classify(grid)[0];
    if (top.label !== label) return { edits: e, to: top.label };
  }
  return null;
}
for (const l of DIGIT_LABELS) {
  const r = greedyFlip(l, 4);
  console.log(`${l}: ${r ? `flips to ${r.to} in ${r.edits} edits` : "NOT flippable in 4 greedy edits"}`);
}

console.log("\n== M9 confidently wrong: full conversion 4 -> 9 template ==");
{
  const s = classify(cleanTemplate("9").grid); // drawing an exact 9 starting from 4
  console.log(`exact 9 drawing: top=${s[0].label} ${(s[0].confidence * 100).toFixed(1)}% (need >=60%)`);
  const s3 = classify(cleanTemplate("8").grid);
  console.log(`exact 8 drawing: top=${s3[0].label} ${(s3[0].confidence * 100).toFixed(1)}%`);
}
