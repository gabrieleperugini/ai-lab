import { useEffect, useState } from "react";
import { contextPairs } from "../../content/day1-llm/contextExamples";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import type { ModuleComponentProps } from "../../lib/moduleProps";
import type { ContextSide } from "../../content/day1-llm/contextExamples";

function HighlightedPrompt({ side, showHighlights }: { side: ContextSide; showHighlights: boolean }) {
  const words = side.prompt.split(" ");
  return (
    <p className="promptDisplay" style={{ fontSize: "clamp(18px, 2.4vw, 23px)" }}>
      {words.map((w, i) => {
        const clean = w.replace(/[.,]/g, "");
        const isHl = showHighlights && side.highlight.includes(clean);
        return (
          <span key={i}>
            {isHl ? <span className="hlWord">{w}</span> : w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}{" "}
      <span className="blank">____</span>
    </p>
  );
}

/**
 * One prompt at a time. A big flip button swaps the few context words and
 * the probability bars animate between the two worlds.
 */
export default function ContextLens({ onResult, resetSignal }: ModuleComponentProps) {
  const [pairIndex, setPairIndex] = useState(0);
  const [world, setWorld] = useState<"left" | "right">("left");
  const [showHighlights, setShowHighlights] = useState(false);

  const pair = contextPairs[pairIndex];
  const activeSide = pair[world];
  const otherLabel = world === "left" ? pair.rightLabel : pair.leftLabel;

  useEffect(() => {
    setPairIndex(0);
    setWorld("left");
    setShowHighlights(false);
  }, [resetSignal]);

  useEffect(() => {
    onResult(`pair '${pair.id}', world: ${world === "left" ? pair.leftLabel : pair.rightLabel}`);
  }, [pair, world, onResult]);

  const selectPair = (index: number) => {
    setPairIndex(index);
    setWorld("left");
    setShowHighlights(false);
  };

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <label className="statPill" style={{ gap: 10 }}>
          Case
          <select
            value={pairIndex}
            onChange={(e) => selectPair(Number(e.target.value))}
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
            {contextPairs.map((p, i) => (
              <option key={p.id} value={i}>
                {i + 1}. {p.title}
              </option>
            ))}
          </select>
        </label>
        <button className="btn primary" onClick={() => setWorld(world === "left" ? "right" : "left")}>
          🔄 Flip to “{otherLabel}”
        </button>
      </div>

      <div className="vizStage" style={{ padding: 18 }}>
        <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <span className="panelTitle" style={{ marginBottom: 0 }}>
            World: {world === "left" ? pair.leftLabel : pair.rightLabel}
          </span>
          <span className="hintText">The sentence is almost the same, but the world has changed.</span>
        </div>
        <HighlightedPrompt side={activeSide} showHighlights={showHighlights} />
        <div style={{ marginTop: 14 }}>
          <ProbabilityBars
            distribution={activeSide.probabilities}
            color={world === "left" ? "blue" : "amber"}
            maxBars={6}
          />
        </div>
      </div>

      <div className="controlRow" style={{ marginTop: 14 }}>
        <button className="btn accent small" onClick={() => setShowHighlights((s) => !s)}>
          {showHighlights ? "Hide the changed words" : "🔍 Reveal the changed words"}
        </button>
        <span className="hintText">Flip a few times before revealing. Which word does the work?</span>
      </div>

      {showHighlights && (
        <div className="revealBox" style={{ marginTop: 14 }}>
          <strong>Why:</strong> {pair.explanation}
          <br />
          <strong>Idea:</strong> {pair.takeaway}
        </div>
      )}
    </div>
  );
}
