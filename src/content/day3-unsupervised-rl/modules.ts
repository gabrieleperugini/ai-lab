import type { LabModule } from "../../lib/types";

/** Learning by Consequences (reinforcement learning): scaffolded
 * placeholders. Clustering and recommendations moved to the Hidden
 * Structure section, which is fully implemented. */

export const learningConsequencesModules: LabModule[] = [
  {
    id: "gridworld-rl",
    dayId: "learning-consequences",
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
    noticePoints: ["Nobody tells the agent the path; only rewards do."],
    takeaway: "Reinforcement learning trades instructions for incentives.",
    placeholder: true
  },
  {
    id: "reward-hacking",
    dayId: "learning-consequences",
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
