/** Shared scatter + model plot for the regression modules (LM2-LM5).
 * Data lives in x ∈ [-1, 1]; y range is configurable. */

import type { Point } from "../../lib/learning/regression";

const W = 460;
const H = 340;

export function RegressionPlot({
  points,
  testPoints,
  line,
  curve,
  showErrors = false,
  yRange = 3.2
}: {
  points: Point[];
  testPoints?: Point[];
  line?: { m: number; b: number } | null;
  /** Arbitrary model curve, evaluated on a fine grid. */
  curve?: ((x: number) => number) | null;
  showErrors?: boolean;
  yRange?: number;
}) {
  const sx = (x: number) => ((x + 1.1) / 2.2) * (W - 20) + 10;
  const sy = (y: number) => H - (((y + yRange) / (2 * yRange)) * (H - 20) + 10);
  const clampY = (y: number) => Math.max(-yRange, Math.min(yRange, y));

  const predict = (x: number): number | null =>
    line ? line.m * x + line.b : curve ? curve(x) : null;

  const curvePath = () => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = -1.05 + (2.1 * i) / 100;
      const y = predict(x);
      if (y === null) return "";
      pts.push(`${sx(x)},${sy(clampY(y))}`);
    }
    return pts.join(" ");
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Data and model plot" style={{ display: "block" }}>
      <rect x={0} y={0} width={W} height={H} fill="var(--paper-2)" rx={10} />
      {/* axes */}
      <line x1={sx(-1.1)} y1={sy(0)} x2={sx(1.1)} y2={sy(0)} stroke="var(--line)" strokeWidth={1.4} />
      <line x1={sx(0)} y1={10} x2={sx(0)} y2={H - 10} stroke="var(--line)" strokeWidth={1.4} />

      {/* error segments */}
      {showErrors &&
        (line || curve) &&
        points.map((p, i) => {
          const yh = predict(p.x)!;
          return (
            <line
              key={`e${i}`}
              x1={sx(p.x)}
              y1={sy(clampY(p.y))}
              x2={sx(p.x)}
              y2={sy(clampY(yh))}
              stroke="var(--red)"
              strokeWidth={1.6}
              opacity={0.55}
            />
          );
        })}

      {/* model */}
      {(line || curve) && (
        <polyline points={curvePath()} fill="none" stroke="var(--blue)" strokeWidth={3} strokeLinecap="round" />
      )}

      {/* points */}
      {points.map((p, i) => (
        <circle key={`p${i}`} cx={sx(p.x)} cy={sy(clampY(p.y))} r={5} fill="var(--amber-deep)" stroke="#fff" strokeWidth={1.4} />
      ))}
      {testPoints?.map((p, i) => (
        <circle
          key={`t${i}`}
          cx={sx(p.x)}
          cy={sy(clampY(p.y))}
          r={4.5}
          fill="none"
          stroke="var(--violet)"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
