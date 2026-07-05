import { useEffect, useMemo, useState } from "react";
import generatedData from "../../content/generated/day1/m2_context_switch.json";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import type { GenM2 } from "../../lib/generated";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const data = generatedData as GenM2;

/**
 * One prompt at a time. A big flip button swaps the context; the SAME
 * candidate bars update in place, so the flip is impossible to miss.
 * Probabilities come from the offline GPT-2 run (static JSON).
 */
export default function ContextLens({ onResult, resetSignal }: ModuleComponentProps) {
  const [pairIndex, setPairIndex] = useState(0);
  const [side, setSide] = useState<"a" | "b">("a");

  const pair = data.pairs[pairIndex];
  const active = pair[side];
  const otherLabel = side === "a" ? pair.labelB : pair.labelA;

  // Stable candidate order across the flip: sort by the max of the two sides.
  const order = useMemo(() => {
    const maxP: Record<string, number> = {};
    for (const c of pair.candidates) {
      const pa = pair.a.options.find((o) => o.label === c)?.probability ?? 0;
      const pb = pair.b.options.find((o) => o.label === c)?.probability ?? 0;
      maxP[c] = Math.max(pa, pb);
    }
    return [...pair.candidates].sort((x, y) => maxP[y] - maxP[x]).concat("other");
  }, [pair]);

  const distribution = useMemo(() => {
    const d: Record<string, number> = { other: active.other };
    for (const o of active.options) d[o.label] = o.probability;
    return d;
  }, [active]);

  useEffect(() => {
    setPairIndex(0);
    setSide("a");
  }, [resetSignal]);

  useEffect(() => {
    onResult(`pair '${pair.id}', context: ${side === "a" ? pair.labelA : pair.labelB}`);
  }, [pair, side, onResult]);

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <label className="statPill" style={{ gap: 10 }}>
          Case
          <select
            value={pairIndex}
            onChange={(e) => {
              setPairIndex(Number(e.target.value));
              setSide("a");
            }}
            aria-label="Choose a context pair"
            style={{
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--blue)",
              cursor: "pointer"
            }}
          >
            {data.pairs.map((p, i) => (
              <option key={p.id} value={i}>
                {i + 1}. {p.title}
              </option>
            ))}
          </select>
        </label>
        <button className="btn primary" onClick={() => setSide(side === "a" ? "b" : "a")}>
          🔄 Flip to “{otherLabel}”
        </button>
      </div>

      <div className="vizStage" style={{ padding: 18 }}>
        <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <span className="panelTitle" style={{ marginBottom: 0 }}>
            Context: {side === "a" ? pair.labelA : pair.labelB}
          </span>
        </div>
        <p className="promptDisplay" style={{ fontSize: "clamp(18px, 2.4vw, 23px)" }}>
          {active.prompt} <span className="blank">____</span>
        </p>
        <div style={{ marginTop: 14 }}>
          <ProbabilityBars
            distribution={distribution}
            order={order}
            color={side === "a" ? "blue" : "amber"}
            maxBars={6}
          />
        </div>
      </div>

      <p className="hintText" style={{ marginTop: 12 }}>
        Same word, different context, different next-token distribution. Flip a few times and
        watch which bars trade places. Probabilities from {data.model}, computed offline.
      </p>

      <div className="revealBox" style={{ marginTop: 12 }}>
        {pair.explanation}
      </div>
    </div>
  );
}
