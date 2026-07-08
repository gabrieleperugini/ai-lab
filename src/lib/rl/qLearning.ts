/**
 * Tabular Q-learning for the gridworld modules. Plain arrays, seeded RNG,
 * small state spaces: fast enough to train hundreds of episodes per frame.
 *
 * Update rule:
 *   Q(s,a) <- Q(s,a) + alpha * [reward + gamma * max_a' Q(s',a') - Q(s,a)]
 */

import type { Action, RewardConfig, World } from "./gridworld";
import { stateIndex, stepWorld } from "./gridworld";

export type AgentParams = {
  alpha: number; // learning rate
  gamma: number; // discount factor
  epsilon: number; // exploration probability
  maxSteps: number; // per episode
};

export const DEFAULT_PARAMS: AgentParams = {
  alpha: 0.2,
  gamma: 0.9,
  epsilon: 0.2,
  maxSteps: 80
};

export function makeQ(world: World): Float64Array {
  return new Float64Array(world.nStates * 4);
}

/** Greedy action with FIXED-ORDER tie-breaking (up, right, down, left).
 * Deterministic on purpose: an agent with no exploration visibly repeats
 * its first idea forever, which is the point of the exploration lesson. */
function argmax(q: Float64Array, s: number): Action {
  const base = s * 4;
  let best: Action = 0;
  for (let a = 1 as Action; a < 4; a++) {
    if (q[base + a] > q[base + best]) best = a as Action;
  }
  return best;
}

export type Outcome = "goal" | "trap" | "prize" | "timeout";

export type EpisodeStats = {
  reward: number;
  steps: number;
  outcome: Outcome;
  path: { r: number; c: number }[];
  coins: number;
  nearGoalSteps: number;
  wallBumps: number;
};

/** Run one episode, learning in place (set alpha 0 to evaluate only). */
export function runEpisode(
  world: World,
  rw: RewardConfig,
  q: Float64Array,
  p: AgentParams,
  rng: () => number,
  learn = true
): EpisodeStats {
  let { r, c } = world.start;
  let mask = 0;
  let total = 0;
  let coins = 0;
  let nearGoalSteps = 0;
  let wallBumps = 0;
  const path: { r: number; c: number }[] = [{ r, c }];
  for (let t = 0; t < p.maxSteps; t++) {
    const s = stateIndex(world, r, c, mask);
    const a: Action = rng() < p.epsilon ? (Math.floor(rng() * 4) as Action) : argmax(q, s);
    const res = stepWorld(world, rw, r, c, mask, a, rng);
    const s2 = stateIndex(world, res.r, res.c, res.mask);
    if (learn) {
      const base2 = s2 * 4;
      const maxNext = res.done
        ? 0
        : Math.max(q[base2], q[base2 + 1], q[base2 + 2], q[base2 + 3]);
      const idx = s * 4 + a;
      q[idx] += p.alpha * (res.reward + p.gamma * maxNext - q[idx]);
    }
    total += res.reward;
    if (res.gotCoin) coins++;
    if (res.bumped) wallBumps++;
    if (Math.abs(res.r - world.goal.r) + Math.abs(res.c - world.goal.c) === 1) nearGoalSteps++;
    r = res.r;
    c = res.c;
    mask = res.mask;
    path.push({ r, c });
    if (res.done) {
      return { reward: total, steps: t + 1, outcome: res.outcome as Outcome, path, coins, nearGoalSteps, wallBumps };
    }
  }
  return { reward: total, steps: p.maxSteps, outcome: "timeout", path, coins, nearGoalSteps, wallBumps };
}

/** Greedy policy action for each cell at coin mask 0 (null on walls/terminal
 * cells or where the agent has never seen anything: all-zero Q). */
export function greedyPolicy(world: World, q: Float64Array): (Action | null)[][] {
  const out: (Action | null)[][] = [];
  for (let r = 0; r < world.rows; r++) {
    const row: (Action | null)[] = [];
    for (let c = 0; c < world.cols; c++) {
      if (
        world.walls[r][c] ||
        world.traps[r][c] ||
        world.prizes[r][c] ||
        (r === world.goal.r && c === world.goal.c)
      ) {
        row.push(null);
        continue;
      }
      const base = stateIndex(world, r, c, 0) * 4;
      let bestA = 0 as Action;
      let bestV = q[base];
      let allZero = true;
      for (let a = 0; a < 4; a++) {
        if (Math.abs(q[base + a]) > 1e-9) allZero = false;
        if (q[base + a] > bestV) {
          bestV = q[base + a];
          bestA = a as Action;
        }
      }
      row.push(allZero ? null : bestA);
    }
    out.push(row);
  }
  return out;
}

/** State values max_a Q(s,a) at coin mask 0, for the heatmap. */
export function stateValues(world: World, q: Float64Array): (number | null)[][] {
  const out: (number | null)[][] = [];
  for (let r = 0; r < world.rows; r++) {
    const row: (number | null)[] = [];
    for (let c = 0; c < world.cols; c++) {
      if (world.walls[r][c]) {
        row.push(null);
        continue;
      }
      const base = stateIndex(world, r, c, 0) * 4;
      row.push(Math.max(q[base], q[base + 1], q[base + 2], q[base + 3]));
    }
    out.push(row);
  }
  return out;
}

/** Deterministic greedy rollout (ties broken by fixed order), used to
 * inspect the learned route. */
export function greedyRollout(
  world: World,
  rw: RewardConfig,
  q: Float64Array,
  maxSteps: number
): { path: { r: number; c: number }[]; outcome: Outcome; mudVisited: boolean } {
  let { r, c } = world.start;
  let mask = 0;
  let mudVisited = false;
  const path = [{ r, c }];
  for (let t = 0; t < maxSteps; t++) {
    const base = stateIndex(world, r, c, mask) * 4;
    let a: Action = 0;
    for (let k = 1; k < 4; k++) if (q[base + k] > q[base + a]) a = k as Action;
    // no slip in the inspection rollout: we want the intended route
    const res = stepWorld(world, { ...rw, slip: 0 }, r, c, mask, a);
    r = res.r;
    c = res.c;
    mask = res.mask;
    path.push({ r, c });
    if (world.mud[r]?.[c]) mudVisited = true;
    if (res.done) return { path, outcome: res.outcome as Outcome, mudVisited };
  }
  return { path, outcome: "timeout", mudVisited };
}
