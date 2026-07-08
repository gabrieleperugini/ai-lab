/**
 * Reward Hacking Lab scenarios. Each one ships a map, a reward setup that
 * produces a recognizable loophole, and the controls students can use to
 * fix it. The loopholes and their fixes are verified by simulation in
 * scripts/qa_rl.ts.
 */

import { parseGrid, DEFAULT_REWARDS } from "../../lib/rl/gridworld";
import type { RewardConfig, World } from "../../lib/rl/gridworld";

export type FixControl =
  | { kind: "slider"; key: keyof RewardConfig; label: string; min: number; max: number; step: number }
  | { kind: "toggle"; key: "coinsRespawn"; label: string; invert?: boolean }
  | { kind: "stepCostToggle"; label: string; onValue: number };

export type RlScenario = {
  id: string;
  label: string;
  emoji: string;
  intendedGoal: string;
  ruleSummary: string[];
  predictPrompt: string;
  world: World;
  rewards: RewardConfig;
  epsilon: number;
  /** Controls shown in the "fix it" panel. */
  fixes: FixControl[];
  fixHint: string;
};

export const rlScenarios: RlScenario[] = [
  {
    id: "coin-loop",
    label: "Coin Loop",
    emoji: "🪙",
    intendedGoal: "We want the agent to walk to the goal. The coin was meant as a small encouragement on the way.",
    ruleSummary: ["Coin: +1, reappears instantly", "Goal: +5", "Steps: free"],
    predictPrompt: "The coin never disappears and steps cost nothing. What will the agent learn to do?",
    world: parseGrid([
      "S.C...",
      "......",
      "..##..",
      "......",
      "...#..",
      ".....G"
    ]),
    rewards: { ...DEFAULT_REWARDS, goal: 5, coin: 1, step: 0, wallBump: 0, coinsRespawn: true },
    epsilon: 0.2,
    fixes: [
      { kind: "toggle", key: "coinsRespawn", label: "Coin reappears after collection" },
      { kind: "slider", key: "step", label: "Step cost", min: -1, max: 0, step: 0.05 },
      { kind: "slider", key: "goal", label: "Goal reward", min: 0, max: 30, step: 1 }
    ],
    fixHint: "Make the coin disappear, make steps cost something, or make finishing clearly worth more."
  },
  {
    id: "almost-goal",
    label: "Almost There",
    emoji: "🎯",
    intendedGoal: "We want the agent to enter the goal quickly. To help it, we reward it for being NEXT to the goal.",
    ruleSummary: ["Each step next to the goal: +0.5", "Entering the goal: +1", "Steps: free"],
    predictPrompt: "Standing near the goal pays every step. Entering it pays once and ends the episode. What pays more?",
    world: parseGrid([
      ".....G",
      "..##..",
      "......",
      ".##.#.",
      "......",
      "S....."
    ]),
    rewards: { ...DEFAULT_REWARDS, goal: 1, coin: 0, step: 0, wallBump: 0, nearGoalBonus: 0.5 },
    epsilon: 0.2,
    fixes: [
      { kind: "slider", key: "nearGoalBonus", label: "Bonus for being near the goal", min: 0, max: 1, step: 0.05 },
      { kind: "slider", key: "goal", label: "Goal reward", min: 0, max: 30, step: 1 },
      { kind: "slider", key: "step", label: "Step cost", min: -1, max: 0, step: 0.05 }
    ],
    fixHint: "Watch the dance: the agent circles next to the goal to farm the bonus before finally entering. Reward the actual success, not the proxy: shrink the near-goal bonus or raise the terminal reward."
  },
  {
    id: "coward",
    label: "Coward Agent",
    emoji: "😱",
    intendedGoal: "We want the agent to cross the trap field and reach the goal. To keep it careful, traps are punished VERY hard.",
    ruleSummary: ["Trap: -100", "Goal: +10", "Steps: free", "Icy floor: 15% of moves slip randomly"],
    predictPrompt: "The floor is slippery, and one slip into a trap costs -100. Is walking near the traps worth +10 to this agent?",
    world: parseGrid([
      "S.....",
      "......",
      "TT.TT.",
      "......",
      "......",
      ".....G"
    ]),
    rewards: { ...DEFAULT_REWARDS, goal: 10, trap: -100, step: 0, coin: 0, wallBump: 0, slip: 0.15 },
    epsilon: 0.2,
    fixes: [
      { kind: "slider", key: "trap", label: "Trap penalty", min: -100, max: 0, step: 5 },
      { kind: "slider", key: "goal", label: "Goal reward", min: 0, max: 30, step: 1 }
    ],
    fixHint: "With a -100 penalty, hiding in the safe corner is genuinely the best strategy. Soften the punishment until crossing becomes worth it."
  },
  {
    id: "wall-hugger",
    label: "Wall Hugger",
    emoji: "➡️",
    intendedGoal: "We want the agent to reach the goal. Since the goal is on the right, we pay +0.3 for every RIGHT move.",
    ruleSummary: ["Every RIGHT move: +0.3 (even into a wall)", "Goal: +5", "Steps: free"],
    predictPrompt: "Pressing right against a wall still pays. Where will the agent spend its time?",
    world: parseGrid([
      "S....#",
      "...#.#",
      ".#...#",
      ".#.#.#",
      ".....#",
      "....G#"
    ]),
    rewards: { ...DEFAULT_REWARDS, goal: 5, coin: 0, step: 0, wallBump: 0, rightBonus: 0.3 },
    epsilon: 0.2,
    fixes: [
      { kind: "slider", key: "rightBonus", label: "Bonus per right move", min: 0, max: 0.5, step: 0.05 },
      { kind: "slider", key: "wallBump", label: "Wall bump penalty", min: -2, max: 0, step: 0.1 },
      { kind: "slider", key: "step", label: "Step cost", min: -1, max: 0, step: 0.05 }
    ],
    fixHint: "Remove the direction bonus, or make bumping and wasting time actually cost something."
  }
];
