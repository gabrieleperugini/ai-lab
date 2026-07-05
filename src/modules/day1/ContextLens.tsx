import { useEffect, useMemo, useState } from "react";
import { m2Data, DEFAULT_MODEL } from "../../content/models";
import type { ModelKey } from "../../content/models";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import { ModelPicker } from "../../components/controls/ModelPicker";
import type { ModuleComponentProps } from "../../lib/moduleProps";

/**
 * One prompt at a time. A big flip button swaps the context; the SAME
 * candidate bars update in place, so the flip is impossible to miss.
 * Probabilities come from the offline model runs (static JSON); the model
 * dropdown compares them on the same pair. Deep link: #/day1/context-lens/<pairId>.
 */
export default function ContextLens({ onResult, resetSignal, initialArg }: ModuleComponentProps) {
  const [modelKey, setModelKey] = useState<ModelKey>(DEFAULT_MODEL);
  const data = m2Data[modelKey];
  const initialPair = useMemo(() => {
    const i = data.pairs.findIndex((p) => p.id === initialArg);
    return i >= 0 ? i : 0;
    // pair ids and order are identical across models
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialArg]);
  const [pairIndex, setPairIndex] = useState(initialPair);
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
    setPairIndex(initialPair);
    setSide("a");
  }, [resetSignal, initialPair]);

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
        <div className="controlRow">
          <ModelPicker value={modelKey} onChange={setModelKey} />
          <a className="btn subtle small" href="#/day1/next-token-arena/context">
            ← Back to the Arena
          </a>
          <button className="btn primary" onClick={() => setSide(side === "a" ? "b" : "a")}>
            🔄 Flip to “{otherLabel}”
          </button>
        </div>
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
