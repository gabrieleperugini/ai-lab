/** Scratch QA for oneDNets (run: npx tsx scripts/qa_onednets.ts). */
import {
  neuron,
  stepTarget,
  bumpTarget,
  neuralnet,
  curveMse,
  descentStep,
  type NetParams
} from "../src/lib/learning/oneDNets";

// Activity A: loss as a function of b
console.log("== one neuron vs stepTarget ==");
for (const b of [-4, 0, 1.5, 2.0, 2.1, 2.5, 4]) {
  console.log(`b=${b}: loss=${curveMse((x) => neuron(x, b), stepTarget).toFixed(4)}`);
}

// Activity B presets
const GOOD: NetParams = { w1: 10, w2: -10, b1: -2.1, b2: 5, b3: 5 };
const ALMOST: NetParams = { w1: 7, w2: -6, b1: -1, b2: 4, b3: 4 };
const RANDOM_BAD: NetParams = { w1: 2, w2: 3, b1: 1, b2: -3, b3: -2 };
const FLAT: NetParams = { w1: 0, w2: 0, b1: 0, b2: 0, b3: 0 };

const lossOf = (p: NetParams) => curveMse((x) => neuralnet(x, p), bumpTarget);
console.log("\n== five-parameter presets ==");
console.log("good:", lossOf(GOOD).toFixed(4));
console.log("almost:", lossOf(ALMOST).toFixed(4));
console.log("random bad:", lossOf(RANDOM_BAD).toFixed(4));
console.log("flat:", lossOf(FLAT).toFixed(4));

// Optimizer from each start
for (const [name, start] of Object.entries({ ALMOST, RANDOM_BAD, FLAT, GOOD })) {
  for (const lr of [1, 3, 8]) {
    let p = { ...start };
    let loss = lossOf(p);
    const track = [loss];
    for (let i = 0; i < 600; i++) {
      const r = descentStep(p, bumpTarget, lr);
      p = r.params;
      loss = r.loss;
      if (i % 150 === 149) track.push(loss);
    }
    console.log(
      `opt from ${name} lr=${lr}: ${track.map((l) => l.toFixed(4)).join(" -> ")}`
    );
  }
}
