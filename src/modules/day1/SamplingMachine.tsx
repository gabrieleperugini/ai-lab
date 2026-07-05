import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { samplingFamilies } from "../../content/day1-llm/samplingTrees";
import { endsSentence, nextTokenDistribution } from "../../lib/samplingTree";
import { applyTemperature, applyTopK, sample } from "../../lib/sampling";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import { Slider } from "../../components/controls/Slider";
import { Segmented } from "../../components/controls/Segmented";
import { TokenChips } from "../../components/viz/TokenChips";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const MAX_TOKENS = 30;

export default function SamplingMachine({ onResult, resetSignal }: ModuleComponentProps) {
  const [familyId, setFamilyId] = useState(samplingFamilies[0].id);
  const [temperature, setTemperature] = useState(1.0);
  const [topK, setTopK] = useState<number>(0); // 0 = all
  const [generated, setGenerated] = useState<string[]>([]);
  const [lastPicked, setLastPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const runningRef = useRef(false);
  const genRef = useRef<string[]>([]);

  const family = samplingFamilies.find((f) => f.id === familyId)!;

  const reset = useCallback(() => {
    runningRef.current = false;
    genRef.current = [];
    setGenerated([]);
    setLastPicked(null);
    setFinished(false);
  }, []);

  useEffect(() => {
    setFamilyId(samplingFamilies[0].id);
    setTemperature(1.0);
    setTopK(0);
    reset();
  }, [resetSignal, reset]);

  // The distribution over the next token, after temperature and top-k.
  const shaped = useMemo(() => {
    const { dist } = nextTokenDistribution(family, generated);
    return applyTopK(applyTemperature(dist, temperature), topK);
  }, [family, generated, temperature, topK]);

  const stepOnce = useCallback((): string | null => {
    const prev = genRef.current;
    if (prev.length >= MAX_TOKENS) return null;
    const { dist } = nextTokenDistribution(family, prev);
    const shapedDist = applyTopK(applyTemperature(dist, temperature), topK);
    const token = sample(shapedDist);
    genRef.current = [...prev, token];
    setGenerated(genRef.current);
    setLastPicked(token);
    if (endsSentence(token) || genRef.current.length >= MAX_TOKENS) setFinished(true);
    return token;
  }, [family, temperature, topK]);

  const runToPunctuation = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    const tick = () => {
      if (!runningRef.current) return;
      const token = stepOnce();
      if (token === null || endsSentence(token)) {
        runningRef.current = false;
        return;
      }
      setTimeout(tick, 260);
    };
    tick();
  }, [stepOnce]);

  useEffect(() => {
    if (generated.length > 0) {
      onResult(
        `family '${family.id}', T=${temperature.toFixed(1)}, top-k=${topK === 0 ? "all" : topK}: "${family.start} ${generated.join(" ")}"`
      );
    }
  }, [generated, family, temperature, topK, onResult]);

  const extremeWarning =
    temperature >= 1.7
      ? "🌶️ Extreme temperature: the distribution is nearly flat — expect chaos."
      : temperature <= 0.3 && topK === 1
        ? "🧊 Maximum boredom: the model will now say the same thing every single time."
        : null;

  return (
    <div className="panel">
      <div className="controlRow" style={{ marginBottom: 6 }}>
        <span className="panelTitle" style={{ marginBottom: 0 }}>Starting prompt</span>
      </div>
      <div className="controlRow" style={{ marginBottom: 16 }}>
        <Segmented
          ariaLabel="Prompt family"
          options={samplingFamilies.map((f) => ({ value: f.id, label: `${f.emoji} ${f.label}` }))}
          value={familyId}
          onChange={(id) => {
            setFamilyId(id);
            reset();
          }}
        />
      </div>

      <div className="vizStage" style={{ padding: 18 }}>
        <p className="promptDisplay" style={{ fontSize: "clamp(17px, 2.2vw, 21px)" }}>
          <span style={{ color: "var(--ink-faint)" }}>{family.start}</span>
        </p>
        <div style={{ marginTop: 10, minHeight: 44 }}>
          {generated.length > 0 ? (
            <TokenChips tokens={generated} />
          ) : (
            <span className="hintText">Press "One token" and watch the machine sample…</span>
          )}
        </div>
        {finished && (
          <p className="hintText" style={{ marginTop: 8 }}>
            🏁 Sentence finished. Generate again with different settings and compare!
          </p>
        )}
      </div>

      <div className="controlRow" style={{ marginTop: 18, alignItems: "flex-end" }}>
        <Slider
          label="Temperature — how adventurous is the sampler?"
          value={temperature}
          min={0.2}
          max={2}
          step={0.1}
          onChange={setTemperature}
          format={(v) => v.toFixed(1)}
          lowHint="0.2 · boring"
          highHint="2.0 · chaotic"
        />
        <div>
          <div className="sliderHead" style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6 }}>
            Top-k — how many tokens stay in the race?
          </div>
          <Segmented
            ariaLabel="Top-k"
            options={[
              { value: 0, label: "all" },
              { value: 1, label: "1" },
              { value: 3, label: "3" },
              { value: 5, label: "5" }
            ]}
            value={topK}
            onChange={setTopK}
          />
        </div>
      </div>

      {extremeWarning && <p className="warnText" style={{ marginTop: 12 }}>{extremeWarning}</p>}

      <div className="controlRow" style={{ marginTop: 16 }}>
        <button className="btn primary" onClick={stepOnce} disabled={finished}>
          🎲 One token
        </button>
        <button className="btn accent" onClick={runToPunctuation} disabled={finished}>
          ⏩ Finish the sentence
        </button>
        <button className="btn subtle" onClick={reset}>
          ↺ New attempt
        </button>
      </div>

      <hr className="divider" />

      <div className="panelTitle">
        Next-token probabilities after your settings{" "}
        {lastPicked && !finished ? "(green = just sampled)" : ""}
      </div>
      <ProbabilityBars distribution={shaped} picked={finished ? null : lastPicked} maxBars={9} />
      <p className="hintText" style={{ marginTop: 10 }}>
        The math is real: probabilities are raised to 1/T and renormalized, then only the top-k
        stay in the race. Only the story tree is hand-made.
      </p>
    </div>
  );
}
