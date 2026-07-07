/** Scratch QA for the multi-prototype detector classifier (run: npx tsx scripts/qa_classifier.ts). */
import { classify } from "../src/lib/learning/detectorClassifier";
import {
  DIGIT_LABELS,
  cleanTemplate,
  noisify,
  shiftGrid,
  thicken,
  coverHalf
} from "../src/content/learning-machines/digitTemplates";

const pct = (x: number) => (x * 100).toFixed(1) + "%";

console.log("labels:", DIGIT_LABELS.join(" "));
console.log("\n== clean digits ==");
for (const l of DIGIT_LABELS) {
  const s = classify(cleanTemplate(l).grid);
  const sum = s.reduce((a, b) => a + b.confidence, 0);
  console.log(
    `${l}: top=${s[0].label} ${pct(s[0].confidence)} 2nd=${s[1].label} ${pct(s[1].confidence)} sum=${sum.toFixed(6)}`
  );
}

console.log("\n== one-pixel edit (flip one ink pixel of the 7) ==");
{
  const g = cleanTemplate("7").grid.map((r) => [...r]);
  const before = classify(g)[0];
  g[0][0] = 1; // corner pixel on
  const after = classify(g);
  console.log(`before: ${before.label} ${pct(before.confidence)}`);
  console.log(`after : ${after[0].label} ${pct(after[0].confidence)}`);
}

console.log("\n== perturbation robustness (top prediction per variant) ==");
for (const l of DIGIT_LABELS) {
  const clean = cleanTemplate(l).grid;
  const row: string[] = [];
  row.push("shift:" + classify(shiftGrid(clean, 0, 1))[0].label);
  row.push("shiftL:" + classify(shiftGrid(clean, 0, -1))[0].label);
  row.push("thick:" + classify(thicken(clean))[0].label);
  row.push("noise3:" + classify(noisify(clean, 3, 42))[0].label);
  row.push("noise6:" + classify(noisify(clean, 6, 43))[0].label);
  row.push("coverT:" + classify(coverHalf(clean, "top"))[0].label);
  row.push("coverB:" + classify(coverHalf(clean, "bottom"))[0].label);
  console.log(`${l}: ${row.join("  ")}`);
}

console.log("\n== noise sweep on 5 (confidence in 5) ==");
{
  const clean = cleanTemplate("5").grid;
  for (const n of [0, 1, 2, 3, 4, 5, 6, 8, 10]) {
    const s = classify(n === 0 ? clean : noisify(clean, n, 7 + n));
    const c5 = s.find((x) => x.label === "5")!.confidence;
    console.log(`flips=${n}: top=${s[0].label} ${pct(s[0].confidence)}  P(5)=${pct(c5)}`);
  }
}

console.log("\n== empty and full grids ==");
{
  const empty = Array.from({ length: 8 }, () => new Array(8).fill(0));
  const full = Array.from({ length: 8 }, () => new Array(8).fill(1));
  const se = classify(empty);
  const sf = classify(full);
  console.log(`empty: top=${se[0].label} ${pct(se[0].confidence)}`);
  console.log(`full : top=${sf[0].label} ${pct(sf[0].confidence)}`);
}
