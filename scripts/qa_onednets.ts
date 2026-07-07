/** Scratch QA for oneDNets (run: npx tsx scripts/qa_onednets.ts).
 * The module fits sampled DATA points (not target curves), so the loss has
 * a nonzero floor set by the binary sampling noise. */
import {
  neuron,
  stepTarget,
  bumpTarget,
  neuralnet,
  pointsMse,
  bestNeuronB,
  descentStep,
  sampleBinaryPoints,
  type NetParams
} from "../src/lib/learning/oneDNets";

const A = sampleBinaryPoints(stepTarget, 60, 21);
const B = sampleBinaryPoints(bumpTarget, 80, 22);

console.log("== Activity A: one neuron vs data (goal < 0.08) ==");
const bestA = bestNeuronB(A);
console.log(`best b=${bestA.b}, floor loss=${bestA.loss.toFixed(4)}`);
let lo = 99, hi = -99;
for (let b = -8; b <= 8.001; b += 0.1) {
  if (pointsMse((x) => neuron(x, b), A) < 0.08) {
    lo = Math.min(lo, b);
    hi = Math.max(hi, b);
  }
}
console.log(`b range where loss < 0.08: [${lo.toFixed(1)}, ${hi.toFixed(1)}]`);

console.log("\n== Activity B: five knobs vs data (hand goal < 0.13, optimizer goal < 0.105) ==");
const lossOf = (p: NetParams) => pointsMse((x) => neuralnet(x, p), B);
const HAND: NetParams = { w1: 10, w2: -10, b1: -2, b2: 5, b3: 5 }; // a plausible good hand fit
console.log("plausible hand fit loss:", lossOf(HAND).toFixed(4));
let p = { ...HAND };
let loss = lossOf(p);
for (let i = 0; i < 450; i++) ({ params: p, loss } = descentStep(p, B, 3));
console.log("optimizer from that hand fit:", loss.toFixed(4));

// optimizer from a rougher hand attempt (bump in roughly the right place)
const ROUGH: NetParams = { w1: 6, w2: -5, b1: -1, b2: 3.5, b3: 3 };
console.log("rough hand fit loss:", lossOf(ROUGH).toFixed(4));
p = { ...ROUGH };
for (let i = 0; i < 450; i++) ({ params: p, loss } = descentStep(p, B, 3));
console.log("optimizer from the rough fit:", loss.toFixed(4));

// the flat trap stalls
p = { w1: 0, w2: 0, b1: 0, b2: 0, b3: 0 };
for (let i = 0; i < 450; i++) ({ params: p, loss } = descentStep(p, B, 3));
console.log("optimizer from the flat trap:", loss.toFixed(4), "(expected to stall well above 0.105)");
