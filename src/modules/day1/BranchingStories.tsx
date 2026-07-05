import { useEffect, useState } from "react";
import { branchingExamples } from "../../content/day1-llm/branchingExamples";
import { Segmented } from "../../components/controls/Segmented";
import type { ModuleComponentProps } from "../../lib/moduleProps";

/**
 * SVG story tree: the root prompt on the left, candidate tokens as branches.
 * Clicking a token commits to it (branch turns solid, others fade) and the
 * continuation types itself out.
 */
export default function BranchingStories({ onResult, resetSignal }: ModuleComponentProps) {
  const [exampleId, setExampleId] = useState(branchingExamples[0].id);
  const [chosen, setChosen] = useState<string | null>(null);
  const [typed, setTyped] = useState("");

  const example = branchingExamples.find((e) => e.id === exampleId)!;
  const chosenBranch = example.branches.find((b) => b.token === chosen) ?? null;

  useEffect(() => {
    setExampleId(branchingExamples[0].id);
    setChosen(null);
    setTyped("");
  }, [resetSignal]);

  // Typewriter effect for the continuation.
  useEffect(() => {
    if (!chosenBranch) {
      setTyped("");
      return;
    }
    setTyped("");
    let i = 0;
    const iv = setInterval(() => {
      i += 2;
      setTyped(chosenBranch.continuation.slice(0, i));
      if (i >= chosenBranch.continuation.length) clearInterval(iv);
    }, 24);
    return () => clearInterval(iv);
  }, [chosenBranch]);

  const W = 860;
  const rowH = example.flavor === "proof" ? 92 : 78;
  const H = Math.max(example.branches.length * rowH + 40, 340);
  const rootX = 30;
  const rootY = H / 2;
  const branchX = 330;

  const pick = (token: string) => {
    setChosen(token);
    onResult(`example '${example.id}': committed to token '${token}'`);
  };

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <Segmented
          ariaLabel="Example"
          options={branchingExamples.map((e) => ({ value: e.id, label: e.label }))}
          value={exampleId}
          onChange={(id) => {
            setExampleId(id);
            setChosen(null);
          }}
        />
        <button
          className="btn subtle small"
          onClick={() => setChosen(null)}
          disabled={chosen === null}
        >
          ↺ Try another branch
        </button>
      </div>

      <p className="promptDisplay" style={{ fontSize: "clamp(18px, 2.4vw, 23px)" }}>
        {example.root} <span className="blank">{chosen ?? "____"}</span>
      </p>

      <div className="vizStage" style={{ marginTop: 16 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Branching tree of possible continuations">
          {/* root node */}
          <circle cx={rootX} cy={rootY} r={10} fill="var(--blue)" />
          <text x={rootX} y={rootY - 18} fontSize={13} fill="var(--ink-faint)" textAnchor="start" fontWeight={700}>
            story so far
          </text>

          {example.branches.map((b, i) => {
            const y = 34 + i * rowH + rowH / 2 - 10;
            const isChosen = chosen === b.token;
            const faded = chosen !== null && !isChosen;
            const strokeW = 2 + b.probability * 26;
            const midX = (rootX + branchX) / 2;
            return (
              <g
                key={b.token}
                opacity={faded ? 0.22 : 1}
                style={{ transition: "opacity 0.4s ease", cursor: "pointer" }}
                onClick={() => pick(b.token)}
              >
                <path
                  d={`M ${rootX + 10} ${rootY} C ${midX} ${rootY}, ${midX} ${y}, ${branchX - 12} ${y}`}
                  fill="none"
                  stroke={isChosen ? "var(--amber-deep)" : "var(--blue-mid)"}
                  strokeWidth={isChosen ? strokeW + 2 : strokeW}
                  strokeLinecap="round"
                  opacity={isChosen ? 1 : 0.55}
                />
                <rect
                  x={branchX - 10}
                  y={y - 22}
                  rx={18}
                  ry={18}
                  width={110}
                  height={42}
                  fill={isChosen ? "var(--amber)" : "#fff"}
                  stroke={isChosen ? "var(--amber-deep)" : "var(--line)"}
                  strokeWidth={2}
                />
                <text
                  x={branchX + 45}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={17}
                  fontWeight={750}
                  fill={isChosen ? "#4d3403" : "var(--ink)"}
                >
                  {b.token}
                </text>
                <text x={branchX + 116} y={y + 5} fontSize={13} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
                  {(b.probability * 100).toFixed(0)}%
                </text>
                {isChosen && (
                  <foreignObject x={branchX + 160} y={y - 34} width={W - branchX - 175} height={rowH + 10}>
                    <div
                      style={{
                        fontSize: 15.5,
                        lineHeight: 1.4,
                        color: "var(--ink)",
                        background: "var(--amber-soft)",
                        border: "1px solid #f3d9a4",
                        borderRadius: 12,
                        padding: "8px 12px",
                        height: "fit-content"
                      }}
                    >
                      {typed}
                      {typed.length < b.continuation.length && <span style={{ opacity: 0.5 }}>▌</span>}
                    </div>
                  </foreignObject>
                )}
                {!chosen && (
                  <foreignObject x={branchX + 160} y={y - 26} width={W - branchX - 175} height={rowH}>
                    <div style={{ fontSize: 13.5, color: "var(--ink-faint)", fontStyle: "italic" }}>
                      {example.flavor === "proof" ? "→ a rung of the proof ladder" : "→ a possible future"}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {chosenBranch && typed.length >= chosenBranch.continuation.length && (
        <div className="revealBox" style={{ marginTop: 16 }}>
          <strong>What you committed to:</strong> {chosenBranch.consequence}
          <br />
          <strong>Ask yourselves:</strong> what did this choice make impossible?
        </div>
      )}

      <p className="hintText" style={{ marginTop: 12 }}>
        {example.flavor === "proof"
          ? "This one is a ladder of commitments: each token narrows what mathematics allows next."
          : "Click a token to commit. Thicker branches are more probable."}
      </p>
    </div>
  );
}
