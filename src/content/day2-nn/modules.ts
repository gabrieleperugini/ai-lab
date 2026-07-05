import type { LabModule } from "../../lib/types";

/** Day 2 — scaffolded placeholders. Replace `placeholder: true` and the
 * `component` key with a real module component when built. */

export const day2Modules: LabModule[] = [
  {
    id: "loss-landscape",
    dayId: "day2",
    title: "Loss Landscape Explorer",
    subtitle: "Walk downhill on the error surface",
    durationMin: 25,
    level: "intro",
    mission:
      "Drop a ball on a landscape of mistakes and guide it downhill, one gradient step at a time.",
    studentInstructions: [
      "Place a starting point on the loss surface.",
      "Press 'Step' to take one gradient descent step.",
      "Change the learning rate and watch overshooting, slow descent, and local minima."
    ],
    component: "Placeholder",
    dataKey: "loss-landscape",
    reflectionQuestions: ["When did the ball get stuck? When did it explode?"],
    noticePoints: [
      "Learning = making the error smaller, step by step.",
      "Too-small steps are slow; too-large steps overshoot."
    ],
    takeaway: "Training a network is walking downhill on a landscape of mistakes.",
    placeholder: true
  },
  {
    id: "gradient-race",
    dayId: "day2",
    title: "Gradient Descent Race",
    subtitle: "Pick a learning rate, win the descent",
    durationMin: 20,
    level: "core",
    mission: "Race different learning rates and initializations down the same landscape.",
    studentInstructions: [
      "Choose a learning rate and a starting point for each racer.",
      "Start the race and compare trajectories.",
      "Explain why too small and too large both lose."
    ],
    component: "Placeholder",
    dataKey: "gradient-race",
    reflectionQuestions: ["Which learning rate won? Which crashed?"],
    noticePoints: ["The same landscape can be easy or impossible depending on the step size."],
    takeaway: "The learning rate is a personality: cautious, bold, or reckless.",
    placeholder: true
  },
  {
    id: "tiny-network",
    dayId: "day2",
    title: "Tiny Neural Network Playground",
    subtitle: "Watch a decision boundary learn",
    durationMin: 35,
    level: "core",
    mission: "Train a tiny neural network on 2D points and watch its decision boundary bend.",
    studentInstructions: [
      "Pick a dataset (moons, circles, spirals).",
      "Choose neurons, layers, and learning rate.",
      "Train and watch the boundary and the loss curve."
    ],
    component: "Placeholder",
    dataKey: "tiny-network",
    reflectionQuestions: ["How many neurons does the spiral need?"],
    noticePoints: ["More neurons bend the boundary more — for better and worse."],
    takeaway: "A neural network is a flexible boundary-bending machine trained by gradient descent.",
    placeholder: true
  },
  {
    id: "overfitting",
    dayId: "day2",
    title: "Overfitting and Generalization",
    subtitle: "When memorizing beats learning",
    durationMin: 25,
    level: "challenge",
    mission: "Add noise, train too long, and catch the network memorizing instead of learning.",
    studentInstructions: [
      "Add label noise to the dataset.",
      "Train a big network until training loss is tiny.",
      "Compare training vs test accuracy. Who wins?"
    ],
    component: "Placeholder",
    dataKey: "overfitting",
    reflectionQuestions: ["How can a model be perfect on training data and bad on new data?"],
    noticePoints: ["Wiggly boundaries that chase every point are a warning sign."],
    takeaway: "A model that memorizes the past can fail the future. Generalization is the real goal.",
    placeholder: true
  }
];
