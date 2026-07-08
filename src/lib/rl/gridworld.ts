/**
 * Gridworld environment for the Learning by Consequences section.
 * Maps are ASCII specs ('S' start, 'G' goal, '#' wall, 'T' trap, 'C' coin,
 * 'M' mud: painful but survivable, 'P' small prize: a terminal decoy,
 * '.' empty). Movement is deterministic unless `slip` is set, in which
 * case each move is replaced by a random one with that probability
 * (icy floor: this is what makes walking near traps genuinely risky).
 *
 * State = (row, col, coinMask). The coin mask tracks which non-respawning
 * coins were already collected this episode, so tabular Q-learning stays
 * exact even with disappearing coins.
 */

export type Action = 0 | 1 | 2 | 3; // up, right, down, left
export const ACTION_DELTAS: { dr: number; dc: number }[] = [
  { dr: -1, dc: 0 },
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 }
];
export const ACTION_ARROWS = ["↑", "→", "↓", "←"];

export type RewardConfig = {
  goal: number;
  trap: number;
  step: number; // per-move cost (usually negative or zero)
  coin: number;
  wallBump: number; // extra penalty for walking into a wall (usually <= 0)
  mud: number; // penalty for entering a mud cell (non-terminal)
  /** Coins reappear instantly (can be farmed). */
  coinsRespawn: boolean;
  /** Reward per move that ENDS on a cell orthogonally adjacent to the goal
   * (a proxy for "being close"). */
  nearGoalBonus: number;
  /** Reward for every attempted RIGHT move (a naive "make progress" reward). */
  rightBonus: number;
  /** Reward of the small terminal decoy prize ('P' cells). */
  prize: number;
  /** Probability that a move is replaced by a random one (icy floor). */
  slip: number;
};

export const DEFAULT_REWARDS: RewardConfig = {
  goal: 10,
  trap: -10,
  step: -0.1,
  coin: 1,
  wallBump: -0.5,
  mud: -2,
  coinsRespawn: false,
  nearGoalBonus: 0,
  rightBonus: 0,
  prize: 1,
  slip: 0
};

export type World = {
  rows: number;
  cols: number;
  start: { r: number; c: number };
  goal: { r: number; c: number };
  walls: boolean[][];
  traps: boolean[][];
  mud: boolean[][];
  prizes: boolean[][];
  coins: { r: number; c: number }[]; // at most ~4 for a small state space
  nStates: number; // rows * cols * 2^coins
};

export function parseGrid(spec: string[]): World {
  const rows = spec.length;
  const cols = spec[0].length;
  const walls = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const traps = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const mud = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const prizes = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const coins: { r: number; c: number }[] = [];
  let start = { r: 0, c: 0 };
  let goal = { r: rows - 1, c: cols - 1 };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = spec[r][c];
      if (ch === "#") walls[r][c] = true;
      else if (ch === "T") traps[r][c] = true;
      else if (ch === "M") mud[r][c] = true;
      else if (ch === "P") prizes[r][c] = true;
      else if (ch === "C") coins.push({ r, c });
      else if (ch === "S") start = { r, c };
      else if (ch === "G") goal = { r, c };
    }
  }
  return {
    rows,
    cols,
    start,
    goal,
    walls,
    traps,
    mud,
    prizes,
    coins,
    nStates: rows * cols * (1 << coins.length)
  };
}

export function stateIndex(world: World, r: number, c: number, mask: number): number {
  return (r * world.cols + c) * (1 << world.coins.length) + mask;
}

export type StepResult = {
  r: number;
  c: number;
  mask: number;
  reward: number;
  done: boolean;
  outcome: "goal" | "trap" | "prize" | "";
  bumped: boolean;
  gotCoin: boolean;
};

export function stepWorld(
  world: World,
  rw: RewardConfig,
  r: number,
  c: number,
  mask: number,
  a: Action,
  rng?: () => number
): StepResult {
  if (rw.slip > 0 && rng && rng() < rw.slip) {
    a = Math.floor(rng() * 4) as Action;
  }
  let reward = rw.step;
  let bumped = false;
  let gotCoin = false;
  if (a === 1) reward += rw.rightBonus;
  const { dr, dc } = ACTION_DELTAS[a];
  let nr = r + dr;
  let nc = c + dc;
  if (nr < 0 || nr >= world.rows || nc < 0 || nc >= world.cols || world.walls[nr][nc]) {
    nr = r;
    nc = c;
    bumped = true;
    reward += rw.wallBump;
  }
  let nmask = mask;
  if (world.traps[nr][nc]) {
    return { r: nr, c: nc, mask: nmask, reward: reward + rw.trap, done: true, outcome: "trap", bumped, gotCoin };
  }
  if (nr === world.goal.r && nc === world.goal.c) {
    return { r: nr, c: nc, mask: nmask, reward: reward + rw.goal, done: true, outcome: "goal", bumped, gotCoin };
  }
  if (world.prizes[nr][nc]) {
    return { r: nr, c: nc, mask: nmask, reward: reward + rw.prize, done: true, outcome: "prize", bumped, gotCoin };
  }
  if (world.mud[nr][nc]) reward += rw.mud;
  const coinIdx = world.coins.findIndex((k) => k.r === nr && k.c === nc);
  if (coinIdx >= 0) {
    const collected = (mask >> coinIdx) & 1;
    if (rw.coinsRespawn || !collected) {
      reward += rw.coin;
      gotCoin = true;
      if (!rw.coinsRespawn) nmask = mask | (1 << coinIdx);
    }
  }
  if (rw.nearGoalBonus !== 0) {
    const d = Math.abs(nr - world.goal.r) + Math.abs(nc - world.goal.c);
    if (d === 1) reward += rw.nearGoalBonus;
  }
  return { r: nr, c: nc, mask: nmask, reward, done: false, outcome: "", bumped, gotCoin };
}
