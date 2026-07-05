import type { LabModule } from "../../lib/types";

/** Day 3 — scaffolded placeholders. */

export const day3Modules: LabModule[] = [
  {
    id: "clustering-detective",
    dayId: "day3",
    title: "Clustering Detective",
    subtitle: "Find groups nobody labeled",
    durationMin: 25,
    level: "intro",
    mission: "Watch K-means discover groups in unlabeled points — then make it fail.",
    studentInstructions: [
      "Scatter points on the canvas.",
      "Choose k and step through the K-means iterations.",
      "Design a dataset where K-means gets it wrong."
    ],
    component: "Placeholder",
    dataKey: "clustering-detective",
    reflectionQuestions: ["What does the algorithm 'see' that you don't — and vice versa?"],
    noticePoints: ["No labels were given: structure emerged from distances alone."],
    takeaway: "Unsupervised learning finds structure without answers — but its idea of structure is geometric.",
    placeholder: true
  },
  {
    id: "recommender",
    dayId: "day3",
    title: "Similarity and Recommendation",
    subtitle: "You are a vector",
    durationMin: 25,
    level: "core",
    mission: "Like and dislike items, watch your taste vector move, and see what gets recommended.",
    studentInstructions: [
      "Rate a few items with 👍 / 👎.",
      "Watch your user vector move on the map.",
      "Check the recommendations. Do they fit? Can you trap yourself in a bubble?"
    ],
    component: "Placeholder",
    dataKey: "recommender",
    reflectionQuestions: ["How could a recommender lock you into a bubble?"],
    noticePoints: ["Recommendation = nearest neighbors in taste space — geometry again!"],
    takeaway: "Recommendations are geometry: you are a point, and the system suggests what is nearby.",
    placeholder: true
  },
  {
    id: "gridworld-rl",
    dayId: "day3",
    title: "Gridworld RL",
    subtitle: "Learning by trial and error",
    durationMin: 35,
    level: "core",
    mission: "Train an agent to reach the goal by trial, error, and reward.",
    studentInstructions: [
      "Place the goal and the traps on the grid.",
      "Set rewards and the exploration slider.",
      "Run Q-learning and watch the policy arrows appear."
    ],
    component: "Placeholder",
    dataKey: "gridworld-rl",
    reflectionQuestions: ["Why does the agent need to explore before it can exploit?"],
    noticePoints: ["Nobody tells the agent the path — only rewards do."],
    takeaway: "Reinforcement learning trades instructions for incentives.",
    placeholder: true
  },
  {
    id: "reward-hacking",
    dayId: "day3",
    title: "Reward Hacking Challenge",
    subtitle: "Did it do what we wanted, or what we rewarded?",
    durationMin: 25,
    level: "challenge",
    mission: "Design a reward that backfires: make the agent do something legal but unintended.",
    studentInstructions: [
      "Configure rewards so the agent 'cheats'.",
      "Run training and watch the unintended behavior.",
      "Fix the reward so the agent does what you actually wanted."
    ],
    component: "Placeholder",
    dataKey: "reward-hacking",
    reflectionQuestions: ["Where else (school? apps? society?) do rewards produce unintended behavior?"],
    noticePoints: ["The agent optimizes the reward you wrote, not the goal you meant."],
    takeaway: "AI systems do what we reward, which is not always what we want. Specifying goals is hard.",
    placeholder: true
  }
];
