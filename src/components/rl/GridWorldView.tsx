/** Shared gridworld renderer for the Learning by Consequences modules:
 * cells (walls, traps, mud, coins, prizes, start, goal), the agent, an
 * episode path trail, optional greedy-policy arrows and a value heatmap. */

import type { World, Action } from "../../lib/rl/gridworld";

const CELL = 52;

// value heatmap: red (bad) -> transparent (neutral) -> green (good)
function valueColor(v: number, lo: number, hi: number): string {
  if (hi - lo < 1e-9) return "transparent";
  const t = (v - lo) / (hi - lo);
  const mid = 0.5;
  if (t >= mid) {
    const k = (t - mid) / (1 - mid);
    return `rgba(44, 156, 106, ${0.12 + 0.38 * k})`;
  }
  const k = (mid - t) / mid;
  return `rgba(214, 69, 80, ${0.12 + 0.33 * k})`;
}

const ARROW_POINTS: Record<Action, string> = {
  0: "0,-7 6,4 -6,4", // up
  1: "7,0 -4,6 -4,-6", // right
  2: "0,7 6,-4 -6,-4", // down
  3: "-7,0 4,6 4,-6" // left
};

export function GridWorldView({
  world,
  agent,
  path,
  policy,
  values,
  coinMask = 0,
  showPolicy = false,
  showValues = false
}: {
  world: World;
  agent?: { r: number; c: number } | null;
  path?: { r: number; c: number }[];
  policy?: (Action | null)[][];
  values?: (number | null)[][];
  coinMask?: number;
  showPolicy?: boolean;
  showValues?: boolean;
}) {
  const W = world.cols * CELL;
  const H = world.rows * CELL;
  const cx = (c: number) => c * CELL + CELL / 2;
  const cy = (r: number) => r * CELL + CELL / 2;

  let vLo = 0;
  let vHi = 0;
  if (showValues && values) {
    for (const row of values) {
      for (const v of row) {
        if (v === null) continue;
        if (v < vLo) vLo = v;
        if (v > vHi) vHi = v;
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Gridworld"
      style={{ display: "block", maxWidth: world.cols * 60 }}
    >
      {/* cells */}
      {Array.from({ length: world.rows }, (_, r) =>
        Array.from({ length: world.cols }, (_, c) => {
          const wall = world.walls[r][c];
          const trap = world.traps[r][c];
          const mud = world.mud[r][c];
          const isGoal = r === world.goal.r && c === world.goal.c;
          const isStart = r === world.start.r && c === world.start.c;
          const prize = world.prizes[r][c];
          let fill = "var(--card)";
          if (wall) fill = "#3d4459";
          else if (trap) fill = "var(--red-soft)";
          else if (mud) fill = "#e8dcc0";
          else if (isGoal) fill = "var(--green-soft)";
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={c * CELL}
                y={r * CELL}
                width={CELL}
                height={CELL}
                fill={fill}
                stroke="var(--line)"
                strokeWidth={1}
              />
              {!wall && showValues && values && values[r][c] !== null && (
                <rect
                  x={c * CELL}
                  y={r * CELL}
                  width={CELL}
                  height={CELL}
                  fill={valueColor(values[r][c]!, vLo, vHi)}
                />
              )}
              {trap && (
                <text x={cx(c)} y={cy(r) + 7} textAnchor="middle" fontSize={22}>
                  🔥
                </text>
              )}
              {mud && (
                <text x={cx(c)} y={cy(r) + 6} textAnchor="middle" fontSize={19}>
                  🟤
                </text>
              )}
              {prize && (
                <text x={cx(c)} y={cy(r) + 7} textAnchor="middle" fontSize={20}>
                  🎁
                </text>
              )}
              {isGoal && (
                <text x={cx(c)} y={cy(r) + 8} textAnchor="middle" fontSize={24}>
                  ⭐
                </text>
              )}
              {isStart && !agent && (
                <text x={cx(c)} y={cy(r) + 6} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--blue)">
                  START
                </text>
              )}
              {isStart && agent && (
                <text x={c * CELL + 5} y={r * CELL + 14} fontSize={9.5} fontWeight={800} fill="var(--blue)">
                  START
                </text>
              )}
            </g>
          );
        })
      )}

      {/* coins (hidden once collected in the current episode) */}
      {world.coins.map((k, i) =>
        (coinMask >> i) & 1 ? null : (
          <text key={`coin${i}`} x={cx(k.c)} y={cy(k.r) + 7} textAnchor="middle" fontSize={20}>
            🪙
          </text>
        )
      )}

      {/* episode path trail */}
      {path && path.length > 1 && (
        <polyline
          points={path.map((p) => `${cx(p.c)},${cy(p.r)}`).join(" ")}
          fill="none"
          stroke="var(--blue)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 5"
          opacity={0.65}
        />
      )}

      {/* policy arrows */}
      {showPolicy &&
        policy &&
        policy.map((row, r) =>
          row.map((a, c) =>
            a === null ? null : (
              <polygon
                key={`p${r}-${c}`}
                points={ARROW_POINTS[a]}
                transform={`translate(${cx(c)}, ${cy(r)})`}
                fill="var(--blue)"
                opacity={0.75}
              />
            )
          )
        )}

      {/* agent */}
      {agent && (
        <g>
          <circle cx={cx(agent.c)} cy={cy(agent.r)} r={16} fill="var(--amber)" stroke="#fff" strokeWidth={2.5} />
          <text x={cx(agent.c)} y={cy(agent.r) + 6} textAnchor="middle" fontSize={16}>
            🤖
          </text>
        </g>
      )}
    </svg>
  );
}

/** Reward-per-episode chart that supports negative values (a zero line is
 * drawn) plus a smoothed recent average. */
export function RewardCurve({ rewards, height = 120 }: { rewards: number[]; height?: number }) {
  const W = 360;
  const H = height;
  if (rewards.length < 2) {
    return (
      <div className="hintText" style={{ padding: 8 }}>
        Train a few episodes to see the reward curve.
      </div>
    );
  }
  const smooth: number[] = [];
  for (let i = 0; i < rewards.length; i++) {
    const from = Math.max(0, i - 9);
    let s = 0;
    for (let j = from; j <= i; j++) s += rewards[j];
    smooth.push(s / (i - from + 1));
  }
  const lo = Math.min(...rewards, 0);
  const hi = Math.max(...rewards, 1);
  const sx = (i: number) => (i / (rewards.length - 1)) * (W - 12) + 6;
  const sy = (v: number) => H - 8 - ((v - lo) / (hi - lo + 1e-9)) * (H - 20);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Reward per episode">
      <rect x={0} y={0} width={W} height={H} fill="var(--paper-2)" rx={8} />
      <line x1={6} y1={sy(0)} x2={W - 6} y2={sy(0)} stroke="var(--line)" strokeWidth={1.2} />
      <polyline
        points={rewards.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")}
        fill="none"
        stroke="var(--blue-mid)"
        strokeWidth={1.4}
        opacity={0.45}
      />
      <polyline
        points={smooth.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")}
        fill="none"
        stroke="var(--blue)"
        strokeWidth={2.6}
      />
      <text x={8} y={13} fontSize={10.5} fontWeight={700} fill="var(--ink-faint)">
        reward per episode (dark line: average of last 10)
      </text>
    </svg>
  );
}
