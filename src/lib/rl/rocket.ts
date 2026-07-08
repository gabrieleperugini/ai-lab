/**
 * Rocket Landing bonus demo: a tiny continuous-control problem.
 * No deep RL: the policy is three interpretable numbers, and "training"
 * is random search (sample policies, keep the best) done in the browser.
 *
 * Physics per tick (dt = 1):
 *   velocity += GRAVITY - thrust * THRUST_POWER   (velocity = downward speed)
 *   height   -= velocity
 *   fuel     -= thrust * FUEL_RATE
 * Thrust is 0..1 and costs fuel; no fuel means no thrust.
 */

import { makeRng } from "../learning/rng";

export const GRAVITY = 1.2;
export const THRUST_POWER = 3.0;
export const FUEL_RATE = 4.0;
export const START_HEIGHT = 100;
export const START_FUEL = 100;
export const SAFE_SPEED = 3.0; // touchdown speed below this is a safe landing
export const MAX_TICKS = 200;

export type RocketPolicy = {
  /** Height at which braking starts. */
  brakeAlt: number; // 10..100
  /** Target touchdown speed the policy aims for near the ground. */
  touchSpeed: number; // 0.5..6
  /** How aggressively thrust corrects speed errors. */
  gain: number; // 0.1..2
};

export type RocketConfig = {
  /** Score penalty per unit of fuel burned. */
  fuelPenalty: number; // 0..2
};

export type RocketRun = {
  heights: number[];
  velocities: number[];
  thrusts: number[];
  fuels: number[];
  ticks: number;
  landed: boolean;
  touchdownSpeed: number;
  fuelLeft: number;
  outcome: "safe" | "crash" | "timeout";
  score: number;
};

/** Desired downward speed at height h: touchSpeed at the ground, growing
 * linearly above it, no braking above brakeAlt. */
function targetSpeed(p: RocketPolicy, h: number): number {
  return p.touchSpeed + (h / p.brakeAlt) * 8;
}

export function policyThrust(p: RocketPolicy, h: number, v: number, fuel: number): number {
  if (fuel <= 0) return 0;
  if (h > p.brakeAlt) return 0;
  return Math.max(0, Math.min(1, p.gain * (v - targetSpeed(p, h))));
}

export function simulate(p: RocketPolicy, cfg: RocketConfig): RocketRun {
  let h = START_HEIGHT;
  let v = 0;
  let fuel = START_FUEL;
  const heights = [h];
  const velocities = [v];
  const thrusts = [0];
  const fuels = [fuel];
  let t = 0;
  while (t < MAX_TICKS) {
    const thrust = policyThrust(p, h, v, fuel);
    v += GRAVITY - thrust * THRUST_POWER;
    if (v < -2) v = -2; // gentle cap on upward speed: no flying away
    h -= v;
    fuel = Math.max(0, fuel - thrust * FUEL_RATE);
    t++;
    heights.push(Math.max(0, h));
    velocities.push(v);
    thrusts.push(thrust);
    fuels.push(fuel);
    if (h <= 0) {
      const landed = v <= SAFE_SPEED;
      const fuelUsed = START_FUEL - fuel;
      // Softness bonus rewards touching down well below the safety limit;
      // the fuel penalty pulls the other way. High fuel penalties make the
      // best policy cut the landing closer to the limit.
      const score = landed
        ? Math.round(100 + 6 * (SAFE_SPEED - Math.max(0, v)) - cfg.fuelPenalty * fuelUsed - 0.1 * t)
        : Math.round(-40 - 2 * Math.min(20, v - SAFE_SPEED));
      return {
        heights,
        velocities,
        thrusts,
        fuels,
        ticks: t,
        landed,
        touchdownSpeed: v,
        fuelLeft: fuel,
        outcome: landed ? "safe" : "crash",
        score
      };
    }
  }
  return {
    heights,
    velocities,
    thrusts,
    fuels,
    ticks: t,
    landed: false,
    touchdownSpeed: 0,
    fuelLeft: fuel,
    outcome: "timeout",
    score: -60
  };
}

export const POLICY_RANGES = {
  brakeAlt: { min: 10, max: 100 },
  touchSpeed: { min: 0.5, max: 6 },
  gain: { min: 0.1, max: 2 }
};

export function randomPolicy(rng: () => number): RocketPolicy {
  const R = POLICY_RANGES;
  return {
    brakeAlt: R.brakeAlt.min + (R.brakeAlt.max - R.brakeAlt.min) * rng(),
    touchSpeed: R.touchSpeed.min + (R.touchSpeed.max - R.touchSpeed.min) * rng(),
    gain: R.gain.min + (R.gain.max - R.gain.min) * rng()
  };
}

/** One round of random search: try n random policies, return the best
 * (by score) together with the score history. */
export function randomSearch(
  cfg: RocketConfig,
  n: number,
  seed: number
): { best: RocketPolicy; bestRun: RocketRun; tried: number[] } {
  const rng = makeRng(seed);
  let best: RocketPolicy | null = null;
  let bestRun: RocketRun | null = null;
  const tried: number[] = [];
  for (let i = 0; i < n; i++) {
    const p = randomPolicy(rng);
    const run = simulate(p, cfg);
    tried.push(run.score);
    if (!bestRun || run.score > bestRun.score) {
      best = p;
      bestRun = run;
    }
  }
  return { best: best!, bestRun: bestRun!, tried };
}
