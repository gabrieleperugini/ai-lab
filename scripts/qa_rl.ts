/** Numeric QA for the Learning by Consequences section.
 * Run: npx tsx scripts/qa_rl.ts
 * Verifies: map reachability, Q-learning convergence, every reward-hacking
 * loophole AND its fix, the maze challenge thresholds, and the rocket. */

import { DEFAULT_REWARDS, parseGrid, stepWorld } from "../src/lib/rl/gridworld";
import type { RewardConfig, World } from "../src/lib/rl/gridworld";
import { DEFAULT_PARAMS, makeQ, runEpisode, greedyRollout } from "../src/lib/rl/qLearning";
import type { AgentParams } from "../src/lib/rl/qLearning";
import { mapPresets } from "../src/content/learning-consequences/maps";
import { rlScenarios } from "../src/content/learning-consequences/scenarios";
import { simulate, randomSearch } from "../src/lib/rl/rocket";
import { makeRng } from "../src/lib/learning/rng";

function bfsReachable(world: World): boolean {
  const seen = new Set<string>([`${world.start.r},${world.start.c}`]);
  const queue = [world.start];
  while (queue.length) {
    const { r, c } = queue.shift()!;
    if (r === world.goal.r && c === world.goal.c) return true;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const k = `${nr},${nc}`;
      if (nr < 0 || nr >= world.rows || nc < 0 || nc >= world.cols) continue;
      if (world.walls[nr][nc] || world.traps[nr][nc] || seen.has(k)) continue;
      seen.add(k);
      queue.push({ r: nr, c: nc });
    }
  }
  return false;
}

type TrainResult = {
  success20: number; // success rate over last 20 episodes
  avgCoins20: number;
  avgNearGoal20: number;
  avgBumps20: number;
  timeout20: number;
  prize20: number;
};

function train(
  world: World,
  rw: RewardConfig,
  p: AgentParams,
  episodes: number,
  seed: number
): TrainResult {
  const q = makeQ(world);
  const rng = makeRng(seed);
  const recent: { outcome: string; coins: number; nearGoalSteps: number; wallBumps: number }[] = [];
  for (let e = 0; e < episodes; e++) {
    const st = runEpisode(world, rw, q, p, rng);
    recent.push(st);
    if (recent.length > 20) recent.shift();
  }
  const n = recent.length;
  return {
    success20: recent.filter((x) => x.outcome === "goal").length / n,
    avgCoins20: recent.reduce((a, x) => a + x.coins, 0) / n,
    avgNearGoal20: recent.reduce((a, x) => a + x.nearGoalSteps, 0) / n,
    avgBumps20: recent.reduce((a, x) => a + x.wallBumps, 0) / n,
    timeout20: recent.filter((x) => x.outcome === "timeout").length / n,
    prize20: recent.filter((x) => x.outcome === "prize").length / n
  };
}

/** Average a metric over several seeds for robustness. */
function avgOver(seeds: number[], f: (seed: number) => number): number {
  return seeds.reduce((a, s) => a + f(s), 0) / seeds.length;
}
const SEEDS = [1, 2, 3, 4, 5];

console.log("== map reachability ==");
for (const m of mapPresets) console.log(`${m.id}: ${bfsReachable(m.world) ? "OK" : "UNREACHABLE!"}`);
for (const s of rlScenarios) console.log(`${s.id}: ${bfsReachable(s.world) ? "OK" : "UNREACHABLE!"}`);

console.log("\n== Maze Learner: convergence at defaults (easy maze) ==");
{
  const w = mapPresets[0].world;
  for (const eps of [50, 100, 150, 200]) {
    const s = avgOver(SEEDS, (seed) => train(w, DEFAULT_REWARDS, DEFAULT_PARAMS, eps, seed).success20);
    console.log(`after ${eps} episodes: success(last20) = ${(s * 100).toFixed(0)}%`);
  }
}

console.log("\n== Challenge: exploration low / medium / high (exploration trap map, 150 eps) ==");
{
  const preset = mapPresets.find((m) => m.id === "exploration")!;
  const w = preset.world;
  const rw = { ...DEFAULT_REWARDS, ...preset.rewards };
  for (const eps of [0.02, 0.1, 0.2, 0.5, 1.0]) {
    const p = { ...DEFAULT_PARAMS, epsilon: eps };
    const goal = avgOver(SEEDS, (seed) => train(w, rw, p, 120, seed).success20);
    console.log(`epsilon=${eps}: goal=${(goal * 100).toFixed(0)}%  (want: ~0% at 0.02, high in the middle, low at 1.0)`);
  }
}

console.log("\n== Challenge: swamp shortcut route flips with step cost (300 eps) ==");
{
  const w = mapPresets.find((m) => m.id === "risky")!.world;
  for (const step of [-0.1, -1]) {
    const rw = { ...DEFAULT_REWARDS, step };
    let short = 0;
    for (const seed of SEEDS) {
      const q = makeQ(w);
      const rng = makeRng(seed);
      for (let e = 0; e < 300; e++) runEpisode(w, rw, q, DEFAULT_PARAMS, rng);
      const roll = greedyRollout(w, rw, q, 60);
      if (roll.outcome === "goal" && roll.mudVisited) short++;
    }
    console.log(`step=${step}: greedy route goes through swamp in ${short}/${SEEDS.length} seeds`);
  }
}

console.log("\n== Coin detour: route visits coin at step -0.1, skips at -1 (300 eps) ==");
{
  const w = mapPresets.find((m) => m.id === "coin")!.world;
  for (const step of [-0.1, -1]) {
    const rw = { ...DEFAULT_REWARDS, step };
    let visits = 0;
    for (const seed of SEEDS) {
      const q = makeQ(w);
      const rng = makeRng(seed);
      for (let e = 0; e < 300; e++) runEpisode(w, rw, q, DEFAULT_PARAMS, rng);
      const roll = greedyRollout(w, rw, q, 60);
      const coin = w.coins[0];
      if (roll.outcome === "goal" && roll.path.some((p2) => p2.r === coin.r && p2.c === coin.c)) visits++;
    }
    console.log(`step=${step}: greedy route collects the coin in ${visits}/${SEEDS.length} seeds`);
  }
}

console.log("\n== Reward hacking scenarios: loophole THEN fix (300 eps, avg of 5 seeds) ==");
for (const sc of rlScenarios) {
  const p = { ...DEFAULT_PARAMS, epsilon: sc.epsilon };
  const broken = SEEDS.map((seed) => train(sc.world, sc.rewards, p, 300, seed));
  const bs = avgOver(SEEDS, (i) => broken[i - 1].success20);
  const extra =
    sc.id === "coin-loop"
      ? `coins/ep=${avgOver(SEEDS, (i) => broken[i - 1].avgCoins20).toFixed(1)}`
      : sc.id === "almost-goal"
        ? `nearGoalSteps/ep=${avgOver(SEEDS, (i) => broken[i - 1].avgNearGoal20).toFixed(1)}`
        : sc.id === "wall-hugger"
          ? `wallBumps/ep=${avgOver(SEEDS, (i) => broken[i - 1].avgBumps20).toFixed(1)}`
          : `timeouts=${(avgOver(SEEDS, (i) => broken[i - 1].timeout20) * 100).toFixed(0)}%`;
  console.log(`${sc.id} BROKEN: success=${(bs * 100).toFixed(0)}%  ${extra}`);

  // the canonical fix
  let fixedRw = { ...sc.rewards };
  let fixedEps = sc.epsilon;
  if (sc.id === "coin-loop") fixedRw = { ...fixedRw, coinsRespawn: false, step: -0.2 };
  if (sc.id === "almost-goal") fixedRw = { ...fixedRw, nearGoalBonus: 0, goal: 10, step: -0.1 };
  if (sc.id === "coward") fixedRw = { ...fixedRw, trap: -10 };
  if (sc.id === "wall-hugger") fixedRw = { ...fixedRw, rightBonus: 0, step: -0.1 };
  const pf = { ...DEFAULT_PARAMS, epsilon: fixedEps };
  const fs = avgOver(SEEDS, (seed) => train(sc.world, fixedRw, pf, 300, seed).success20);
  console.log(`${sc.id} FIXED : success=${(fs * 100).toFixed(0)}%`);
}

console.log("\n== Rocket: random search finds safe landings; fuel penalty shifts the style ==");
{
  for (const fuelPenalty of [0, 0.3, 1.5, 2]) {
    const { bestRun } = randomSearch({ fuelPenalty }, 200, 7);
    console.log(
      `fuelPenalty=${fuelPenalty}: outcome=${bestRun.outcome}, touchdown v=${bestRun.touchdownSpeed.toFixed(2)} (safe<3), fuel left=${bestRun.fuelLeft.toFixed(0)}%, score=${bestRun.score}`
    );
  }
  // a sensible hand-tuned policy
  const hand = simulate({ brakeAlt: 40, touchSpeed: 2, gain: 0.8 }, { fuelPenalty: 0.3 });
  console.log(`hand policy (40, 2, 0.8): ${hand.outcome}, v=${hand.touchdownSpeed.toFixed(2)}, fuel=${hand.fuelLeft.toFixed(0)}%`);
  // default sliders should NOT land safely (there must be something to do)
  const naive = simulate({ brakeAlt: 20, touchSpeed: 5, gain: 0.3 }, { fuelPenalty: 0.3 });
  console.log(`naive policy (20, 5, 0.3): ${naive.outcome}, v=${naive.touchdownSpeed.toFixed(2)}`);
}
