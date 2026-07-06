/** Small line chart (SVG) for loss/accuracy histories. */

export function MiniChart({
  series,
  height = 110,
  yLabel,
  yMax
}: {
  series: { label: string; color: string; values: number[] }[];
  height?: number;
  yLabel?: string;
  yMax?: number;
}) {
  const W = 320;
  const H = height;
  const maxLen = Math.max(1, ...series.map((s) => s.values.length));
  const maxVal =
    yMax ??
    Math.max(0.001, ...series.flatMap((s) => s.values.filter((v) => Number.isFinite(v))));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={yLabel ?? "chart"}>
        <rect x={0} y={0} width={W} height={H} fill="var(--paper-2)" rx={8} />
        {series.map((s) => {
          if (s.values.length < 2) return null;
          const pts = s.values
            .map((v, i) => {
              const x = (i / (maxLen - 1)) * (W - 12) + 6;
              const clamped = Math.min(Math.max(v, 0), maxVal);
              const y = H - 8 - (clamped / maxVal) * (H - 16);
              return `${x},${y}`;
            })
            .join(" ");
          return <polyline key={s.label} points={pts} fill="none" stroke={s.color} strokeWidth={2.2} />;
        })}
        {yLabel && (
          <text x={8} y={14} fontSize={10.5} fontWeight={700} fill="var(--ink-faint)">
            {yLabel} (max {maxVal.toFixed(2)})
          </text>
        )}
      </svg>
      <div className="controlRow" style={{ gap: 10, marginTop: 4 }}>
        {series.map((s) => (
          <span key={s.label} style={{ fontSize: 12.5, fontWeight: 700, color: s.color }}>
            ● {s.label}
            {s.values.length > 0 && Number.isFinite(s.values[s.values.length - 1])
              ? `: ${s.values[s.values.length - 1].toFixed(3)}`
              : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
