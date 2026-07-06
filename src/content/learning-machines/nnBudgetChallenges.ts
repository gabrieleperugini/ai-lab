/**
 * Parameter Budget Challenge presets for the NN Playground. Thresholds were
 * tuned against the playground's own training implementation (full-batch
 * gradient descent, tanh default): every preset is achievable.
 */

export type BudgetChallenge = {
  id: string;
  label: string;
  datasetId: string;
  accTarget: number; // test accuracy target in [0, 1]
  budget: number; // max parameter count
  hint: string;
};

export const budgetChallenges: BudgetChallenge[] = [
  {
    id: "tiny-xor",
    label: "Tiny XOR",
    datasetId: "xor",
    accTarget: 0.95,
    budget: 20,
    hint: "One hidden layer with very few neurons is enough."
  },
  {
    id: "circle-budget",
    label: "Circle on a Budget",
    datasetId: "circle",
    accTarget: 0.95,
    budget: 30,
    hint: "How many boundary pieces does a ring need?"
  },
  {
    id: "spiral-boss",
    label: "Spiral Boss Fight",
    datasetId: "spiral",
    accTarget: 0.9,
    budget: 120,
    hint: "Depth helps. Be patient: this one takes real training time."
  },
  {
    id: "noisy-small",
    label: "Noisy Data, Small Model",
    datasetId: "noisy-spiral",
    accTarget: 0.8,
    budget: 80,
    hint: "A huge net memorizes the noise. Watch the TEST accuracy."
  }
];
