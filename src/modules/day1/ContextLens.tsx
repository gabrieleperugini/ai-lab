import { useEffect, useState } from "react";
import { contextPairs } from "../../content/day1-llm/contextExamples";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import { Segmented } from "../../components/controls/Segmented";
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

export default function ContextLens({ onResult, resetSignal }: ModuleComponentProps) {
  const [pairIndex, setPairIndex] = useState(0);
  const [world, setWorld] = useState<"left" | "right">("left");
  const [showHighlights, setShowHighlights] = useState(false);
  const [sideBySide, setSideBySide] = useState(true);

  const pair = contextPairs[pairIndex];

  useEffect(() => {
    setPairIndex(0);
    setWorld("left");
    setShowHighlights(false);
    setSideBySide(true);
  }, [resetSignal]);

  useEffect(() => {
    onResult(`pair '${pair.id}', viewing: ${sideBySide ? "side by side" : pair[world].prompt}`);
  }, [pair, world, sideBySide, onResult]);

  const activeSide = pair[world];

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <span className="statPill">
          Pair <span className="statValue">{pairIndex + 1}</span> / {contextPairs.length} —{" "}
          {pair.title}
        </span>
        <Segmented
          ariaLabel="View"
          options={[
            { value: "both", label: "Side by side" },
            { value: "flip", label: "Flip between worlds" }
          ]}
          value={sideBySide ? "both" : "flip"}
          onChange={(v) => setSideBySide(v === "both")}
        />
      </div>

      {sideBySide ? (
        <div className="ctxGrid">
          {(["left", "right"] as const).map((s) => (
            <div key={s} className="vizStage" style={{ padding: 18 }}>
              <div className="panelTitle">{s === "left" ? pair.leftLabel : pair.rightLabel}</div>
              <HighlightedPrompt side={pair[s]} showHighlights={showHighlights} />
              <div style={{ marginTop: 14 }}>
                <ProbabilityBars
                  distribution={pair[s].probabilities}
                  color={s === "left" ? "blue" : "amber"}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="vizStage" style={{ padding: 18 }}>
          <div className="controlRow" style={{ marginBottom: 12 }}>
            <Segmented
              ariaLabel="World"
              options={[
                { value: "left", label: pair.leftLabel },
                { value: "right", label: pair.rightLabel }
              ]}
              value={world}
              onChange={setWorld}
            />
            <span className="hintText">Flip back and forth — watch the bars move.</span>
          </div>
          <HighlightedPrompt side={activeSide} showHighlights={showHighlights} />
          <div style={{ marginTop: 14 }}>
            <ProbabilityBars
              distribution={activeSide.probabilities}
              color={world === "left" ? "blue" : "amber"}
            />
          </div>
        </div>
      )}

      <hr className="divider" />

      <div className="controlRow">
        <button className="btn accent" onClick={() => setShowHighlights((s) => !s)}>
          {showHighlights ? "Hide the changed words" : "🔍 Reveal the changed words"}
        </button>
        <button
          className="btn primary"
          onClick={() => {
            setPairIndex((pairIndex + 1) % contextPairs.length);
            setShowHighlights(false);
            setWorld("left");
          }}
        >
          Next pair →
        </button>
      </div>

      {showHighlights && (
        <div className="revealBox" style={{ marginTop: 16 }}>
          <strong>Why:</strong> {pair.explanation}
          <br />
          <strong>Idea:</strong> {pair.takeaway}
        </div>
      )}
    </div>
  );
}
