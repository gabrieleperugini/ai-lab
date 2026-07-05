import type { ModuleComponentProps } from "../lib/moduleProps";

/** Small decorative SVG previews so Day 2/3 placeholders feel alive. */
function PreviewArt({ dataKey }: { dataKey?: string }) {
  switch (dataKey) {
    case "loss-landscape":
    case "gradient-race":
      return (
        <svg viewBox="0 0 320 140" width="280" role="img" aria-label="Loss landscape preview">
          <path
            d="M10 40 C 60 120, 90 20, 140 90 S 240 130, 310 30"
            fill="none"
            stroke="var(--blue-mid)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {[
            [58, 84],
            [78, 62],
            [98, 46],
            [118, 62],
            [138, 86]
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={6 - i} fill="var(--amber-deep)" opacity={0.4 + i * 0.15} />
          ))}
        </svg>
      );
    case "tiny-network":
    case "overfitting":
      return (
        <svg viewBox="0 0 320 140" width="280" role="img" aria-label="Neural network preview">
          {[30, 160, 290].map((x, layer) =>
            [30, 70, 110].slice(0, layer === 1 ? 3 : 2).map((y, i) => (
              <circle key={`${layer}-${i}`} cx={x} cy={layer === 1 ? y : y + 20} r={11} fill="var(--blue)" opacity={0.85} />
            ))
          )}
          {[50, 90].map((y1) =>
            [30, 70, 110].map((y2) => (
              <line key={`a${y1}${y2}`} x1={41} y1={y1} x2={149} y2={y2} stroke="var(--blue-mid)" strokeWidth={1.4} opacity={0.5} />
            ))
          )}
          {[30, 70, 110].map((y1) =>
            [50, 90].map((y2) => (
              <line key={`b${y1}${y2}`} x1={171} y1={y1} x2={279} y2={y2} stroke="var(--amber-deep)" strokeWidth={1.4} opacity={0.5} />
            ))
          )}
        </svg>
      );
    case "clustering-detective":
    case "recommender":
      return (
        <svg viewBox="0 0 320 140" width="280" role="img" aria-label="Clustering preview">
          {[
            [60, 45, "var(--blue-mid)"],
            [75, 60, "var(--blue-mid)"],
            [50, 70, "var(--blue-mid)"],
            [160, 100, "var(--amber-deep)"],
            [180, 85, "var(--amber-deep)"],
            [170, 110, "var(--amber-deep)"],
            [260, 40, "var(--green)"],
            [275, 60, "var(--green)"],
            [250, 55, "var(--green)"]
          ].map(([x, y, c], i) => (
            <circle key={i} cx={Number(x)} cy={Number(y)} r={8} fill={String(c)} opacity={0.8} />
          ))}
          {[
            [62, 58],
            [170, 98],
            [262, 52]
          ].map(([x, y], i) => (
            <g key={`c${i}`}>
              <circle cx={x} cy={y} r={17} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeDasharray="4 4" />
            </g>
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 320 140" width="280" role="img" aria-label="Gridworld preview">
          {Array.from({ length: 5 }, (_, i) =>
            Array.from({ length: 3 }, (_, j) => (
              <rect
                key={`${i}${j}`}
                x={40 + i * 50}
                y={10 + j * 42}
                width={44}
                height={36}
                rx={6}
                fill={i === 4 && j === 0 ? "var(--green-soft)" : i === 2 && j === 1 ? "var(--red-soft)" : "#fff"}
                stroke="var(--line)"
              />
            ))
          )}
          <text x={258} y={34} fontSize={20}>🏆</text>
          <text x={158} y={76} fontSize={20}>🕳️</text>
          <text x={58} y={118} fontSize={20}>🤖</text>
          <path d="M 70 100 C 90 60, 140 40, 250 32" fill="none" stroke="var(--amber-deep)" strokeWidth={3} strokeDasharray="5 5" markerEnd="none" />
        </svg>
      );
  }
}

export default function PlaceholderModule({ module }: ModuleComponentProps) {
  return (
    <div className="panel" style={{ textAlign: "center" }}>
      <div className="bigEmoji">🧪</div>
      <h3 style={{ marginTop: 10, fontSize: 22, color: "var(--blue)" }}>
        This lab bench is being built
      </h3>
      <p style={{ color: "var(--ink-soft)", marginTop: 10, maxWidth: 520, marginInline: "auto" }}>
        <strong>{module.title}</strong> will arrive with the rest of{" "}
        {module.dayId === "day2" ? "Day 2" : "Day 3"}. Here is a sneak preview of what you will
        play with:
      </p>
      <div className="placeholderArt" style={{ marginTop: 16 }}>
        <PreviewArt dataKey={module.dataKey} />
      </div>
      <div className="revealBox" style={{ marginTop: 18, textAlign: "left" }}>
        <strong>The plan:</strong>
        <ul style={{ margin: "8px 0 0", paddingLeft: 22 }}>
          {module.studentInstructions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
