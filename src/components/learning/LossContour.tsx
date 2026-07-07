/** Loss landscape over (slope m, intercept b) for a regression dataset:
 * banded heatmap (quantized levels read as contours), draggable parameter
 * point, optional best-solution marker and gradient-descent trajectory. */

import { useMemo, useRef } from "react";
import { mse, bestFitLine } from "../../lib/learning/regression";
import type { Point } from "../../lib/learning/regression";

const W = 420;
const H = 420;
const RANGE = 3; // m, b in [-3, 3]
const GRID = 48;
const BANDS = 14;

// valley (low loss) -> ridge (high loss)
const COLORS = [
  "#1d7a50", "#2c9c6a", "#5cb98a", "#8ed0ab", "#c2e6cf",
  "#eef4dd", "#fdeed2", "#f9d9a0", "#f5c06e", "#f0a94a",
  "#e98a33", "#df6b28", "#c94f24", "#a83a20"
];

export function LossContour({
  points,
  m,
  b,
  onChange,
  trajectory,
  showBest = false,
  lossFn,
  bestPoint,
  mLabel = "slope m",
  bLabel = "intercept b"
}: {
  points: Point[];
  m: number;
  b: number;
  onChange?: (m: number, b: number) => void;
  trajectory?: { m: number; b: number }[];
  showBest?: boolean;
  /** Loss over (m, b); defaults to the line-model MSE on `points`. */
  lossFn?: (m: number, b: number) => number;
  /** Best-solution marker; defaults to the least-squares line. */
  bestPoint?: { m: number; b: number };
  mLabel?: string;
  bLabel?: string;
}) {
  const dragRef = useRef(false);

  const sx = (mm: number) => ((mm + RANGE) / (2 * RANGE)) * W;
  const sy = (bb: number) => H - ((bb + RANGE) / (2 * RANGE)) * H;
  const inv = (px: number, py: number) => ({
    m: (px / W) * 2 * RANGE - RANGE,
    b: ((H - py) / H) * 2 * RANGE - RANGE
  });

  const { cells, best } = useMemo(() => {
    const loss = lossFn ?? ((mm: number, bb: number) => mse(points, mm, bb));
    const losses: number[][] = [];
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < GRID; i++) {
      const row: number[] = [];
      for (let j = 0; j < GRID; j++) {
        const mm = -RANGE + (2 * RANGE * (i + 0.5)) / GRID;
        const bb = -RANGE + (2 * RANGE * (j + 0.5)) / GRID;
        const l = loss(mm, bb);
        row.push(l);
        if (l < lo) lo = l;
        if (l > hi) hi = l;
      }
      losses.push(row);
    }
    // sqrt scaling gives the valley more color resolution
    const scale = (l: number) => Math.sqrt((l - lo) / (hi - lo + 1e-9));
    const cells = losses.map((row, i) =>
      row.map((l, j) => ({
        i,
        j,
        band: Math.min(BANDS - 1, Math.floor(scale(l) * BANDS))
      }))
    );
    return { cells, best: bestPoint ?? bestFitLine(points) };
  }, [points, lossFn, bestPoint]);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const { m: nm, b: nb } = inv(px, py);
    onChange(Math.max(-RANGE, Math.min(RANGE, nm)), Math.max(-RANGE, Math.min(RANGE, nb)));
  };

  const cw = W / GRID;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Loss landscape over slope and intercept"
      style={{ touchAction: "none", cursor: onChange ? "crosshair" : "default", display: "block" }}
      onPointerDown={(e) => {
        dragRef.current = true;
        (e.currentTarget as SVGSVGElement).setPointerCapture?.(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => dragRef.current && move(e)}
      onPointerUp={() => (dragRef.current = false)}
      onPointerLeave={() => (dragRef.current = false)}
    >
      {cells.flat().map((c) => (
        <rect
          key={`${c.i}-${c.j}`}
          x={c.i * cw}
          y={H - (c.j + 1) * cw}
          width={cw + 0.6}
          height={cw + 0.6}
          fill={COLORS[c.band]}
        />
      ))}

      {/* axes labels */}
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--ink)">
        {mLabel} →
      </text>
      <text x={12} y={H / 2} fontSize={12} fontWeight={700} fill="var(--ink)" transform={`rotate(-90 12 ${H / 2})`} textAnchor="middle">
        {bLabel} →
      </text>

      {/* trajectory */}
      {trajectory && trajectory.length > 1 && (
        <>
          <polyline
            points={trajectory.map((t) => `${sx(t.m)},${sy(t.b)}`).join(" ")}
            fill="none"
            stroke="var(--blue)"
            strokeWidth={2.4}
            strokeDasharray="1 4"
            strokeLinecap="round"
          />
          {trajectory.map((t, i) => (
            <circle key={i} cx={sx(t.m)} cy={sy(t.b)} r={2.6} fill="var(--blue)" opacity={0.35 + (0.65 * i) / trajectory.length} />
          ))}
        </>
      )}

      {/* best solution */}
      {showBest && Math.abs(best.m) <= RANGE && Math.abs(best.b) <= RANGE && (
        <g>
          <circle cx={sx(best.m)} cy={sy(best.b)} r={9} fill="none" stroke="#fff" strokeWidth={2.5} />
          <text x={sx(best.m)} y={sy(best.b) - 13} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">
            ★ best
          </text>
        </g>
      )}

      {/* current point */}
      <circle cx={sx(m)} cy={sy(b)} r={9} fill="var(--blue)" stroke="#fff" strokeWidth={2.5} />
    </svg>
  );
}
