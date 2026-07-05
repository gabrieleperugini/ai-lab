import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import generatedData from "../../content/generated/day1/m4_sampling.json";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import { Segmented } from "../../components/controls/Segmented";
import type { GenM4 } from "../../lib/generated";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const data = generatedData as GenM4;

/**
 * Sampling Machine, real-model edition. Continuations were sampled OFFLINE
 * from GPT-2 at three randomness settings and cached as JSON; the classroom
 * site only replays them. A "recently shown" queue avoids immediate repeats.
 */
export default function SamplingMachine({ onResult, resetSignal }: ModuleComponentProps) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(1); // start at medium randomness
  const [current, setCurrent] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[] | null>(null);
  const [showFirstStep, setShowFirstStep] = useState(false);
  const recentRef = useRef<Record<string, string[]>>({});

  const prompt = data.prompts[promptIndex];
  const sampleSet = prompt.sampleSets[setIndex];

  const reset = useCallback(() => {
    setCurrent(null);
    setHistory([]);
    setCompare(null);
    setShowFirstStep(false);
  }, []);

  useEffect(() => {
    setPromptIndex(0);
    setSetIndex(1);
    recentRef.current = {};
    reset();
  }, [resetSignal, reset]);

  /** Pick a random cached sample, avoiding the most recently shown ones. */
  const drawSample = useCallback(
    (pIdx: number, sIdx: number): string => {
      const samples = data.prompts[pIdx].sampleSets[sIdx].samples;
      const key = `${pIdx}-${sIdx}`;
      const recent = recentRef.current[key] ?? [];
      let pool = samples.filter((s) => !recent.includes(s));
      if (pool.length === 0) {
        recentRef.current[key] = [];
        pool = samples;
      }
      const pick = pool[Math.floor(Math.random() * pool.length)];
      recentRef.current[key] = [...(recentRef.current[key] ?? []), pick].slice(
        -Math.max(1, samples.length - 1)
      );
      return pick;
    },
    []
  );

  const generate = () => {
    const s = drawSample(promptIndex, setIndex);
    setCurrent(s);
    setCompare(null);
    setHistory((prev) => [s, ...prev].slice(0, 4));
    onResult(`prompt '${prompt.id}', ${sampleSet.label}: "${prompt.prompt} ${s}"`);
  };

  const compareModes = () => {
    setCompare([0, 1, 2].map((i) => drawSample(promptIndex, i)));
    setCurrent(null);
    onResult(`prompt '${prompt.id}': compared the three randomness modes`);
  };

  const firstStepDist = useMemo(() => {
    const d: Record<string, number> = { other: prompt.firstStep.other };
    for (const o of prompt.firstStep.options) d[o.text.trim()] = o.probability;
    return d;
  }, [prompt]);
  const firstStepOrder = useMemo(
    () => [...prompt.firstStep.options.map((o) => o.text.trim()), "other"],
    [prompt]
  );

  return (
    <div className="panel">
      <div className="controlRow" style={{ marginBottom: 14, justifyContent: "space-between" }}>
        <label className="statPill" style={{ gap: 10 }}>
          Starting prompt
          <select
            value={promptIndex}
            onChange={(e) => {
              setPromptIndex(Number(e.target.value));
              reset();
            }}
            aria-label="Choose a starting prompt"
            style={{
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--blue)",
              cursor: "pointer",
              maxWidth: 320
            }}
          >
            {data.prompts.map((p, i) => (
              <option key={p.id} value={i}>
                {p.prompt}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn ghost small"
          onClick={() => {
            let i = promptIndex;
            while (i === promptIndex && data.prompts.length > 1) {
              i = Math.floor(Math.random() * data.prompts.length);
            }
            setPromptIndex(i);
            reset();
          }}
        >
          🎰 New prompt
        </button>
      </div>

      <div className="controlRow" style={{ marginBottom: 6 }}>
        <Segmented
          ariaLabel="Randomness"
          options={prompt.sampleSets.map((s, i) => ({ value: i, label: s.label }))}
          value={setIndex}
          onChange={(i) => {
            setSetIndex(i);
            setCompare(null);
          }}
        />
        <span className="hintText">
          T={sampleSet.temperature} · top-k={sampleSet.top_k} · top-p={sampleSet.top_p}
        </span>
      </div>

      <div className="vizStage" style={{ padding: 18, marginTop: 10 }}>
        <p className="promptDisplay" style={{ fontSize: "clamp(17px, 2.2vw, 21px)" }}>
          <span style={{ color: "var(--ink-faint)" }}>{prompt.prompt}</span>{" "}
          {current && <span className="fadeIn">{current}</span>}
          {!current && !compare && <span className="blank">____</span>}
        </p>

        {compare && (
          <div className="fadeIn" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {compare.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 15
                }}
              >
                <span
                  className="levelTag"
                  style={{
                    marginRight: 10,
                    background: ["var(--green-soft)", "var(--blue-soft)", "var(--violet-soft)"][i],
                    color: ["var(--green)", "var(--blue-mid)", "var(--violet)"][i],
                    textTransform: "none",
                    letterSpacing: 0
                  }}
                >
                  {prompt.sampleSets[i].label}
                </span>
                {s}
              </div>
            ))}
          </div>
        )}

        {history.length > 1 && !compare && (
          <div style={{ marginTop: 12 }}>
            <div className="panelTitle" style={{ marginBottom: 6 }}>
              Previous runs (same settings)
            </div>
            {history.slice(1).map((h, i) => (
              <p key={i} className="hintText" style={{ padding: "2px 0" }}>
                · {h}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="controlRow" style={{ marginTop: 14 }}>
        <button className="btn primary" onClick={generate}>
          🎲 Generate another continuation
        </button>
        <button className="btn accent" onClick={compareModes}>
          ⚖️ Compare the three modes
        </button>
        <button className="btn subtle small" onClick={() => setShowFirstStep((s) => !s)}>
          {showFirstStep ? "Hide first step" : "🔬 Inspect first step"}
        </button>
      </div>

      {showFirstStep && (
        <div className="fadeIn" style={{ marginTop: 14 }}>
          <div className="panelTitle">
            Real first-step token probabilities ({data.model})
          </div>
          <ProbabilityBars distribution={firstStepDist} order={firstStepOrder} maxBars={9} />
          <p className="hintText" style={{ marginTop: 8 }}>
            These are the model's actual most likely first tokens for this prompt. Sampling picks
            from (a reshaped version of) this distribution, then repeats after every token.
          </p>
        </div>
      )}

      <div className="revealBox" style={{ marginTop: 14, fontSize: 14.5 }}>
        <strong>Cheat sheet:</strong> Low randomness: safer, more repetitive (notice how few
        different continuations exist!). Medium: varied but still coherent. High: surprising,
        sometimes nonsense.
      </div>

      <p className="hintText" style={{ marginTop: 10 }}>
        Real models predict tokens, not always full words; here we display the generated text in
        normal writing. Continuations were sampled from {data.model} offline with the settings
        shown, and the site replays them: no model runs in your browser.
      </p>
    </div>
  );
}
