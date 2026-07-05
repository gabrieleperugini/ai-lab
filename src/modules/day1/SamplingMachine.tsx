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
  const [versions, setVersions] = useState<string[]>([]);
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
    setVersions([]);
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

  /** Run one silent, complete generation with the current settings. */
  const generateFull = useCallback((): string => {
    const tokens: string[] = [];
    for (let i = 0; i < MAX_TOKENS; i++) {
      const { dist } = nextTokenDistribution(family, tokens);
      const token = sample(applyTopK(applyTemperature(dist, temperature), topK));
      tokens.push(token);
      if (endsSentence(token)) break;
    }
    return tokens.join(" ");
  }, [family, temperature, topK]);

  const generateThree = useCallback(() => {
    setVersions([generateFull(), generateFull(), generateFull()]);
  }, [generateFull]);

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
      ? "🌶️ Extreme temperature: the distribution is nearly flat; expect chaos."
      : temperature <= 0.3 && topK === 1
        ? "🧊 Maximum boredom: the model will now say the same thing every single time."
        : null;

  return (
    <div className="panel">
      <div className="controlRow" style={{ marginBottom: 16, justifyContent: "space-between" }}>
        <label className="statPill" style={{ gap: 10 }}>
          Starting prompt
          <select
            value={familyId}
            onChange={(e) => {
              setFamilyId(e.target.value);
              setVersions([]);
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
              maxWidth: 240
            }}
          >
            {samplingFamilies.map((f) => (
              <option key={f.id} value={f.id}>
                {f.emoji} {f.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn ghost small"
          onClick={() => {
            let id = familyId;
            while (id === familyId && samplingFamilies.length > 1) {
              id = samplingFamilies[Math.floor(Math.random() * samplingFamilies.length)].id;
            }
            setFamilyId(id);
            setVersions([]);
            reset();
          }}
        >
          🎰 New prompt
        </button>
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
          label="Temperature: how adventurous is the sampler?"
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
            Top-k: how many tokens stay in the race?
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
        <button className="btn ghost" onClick={generateThree}>
          ⚡ Generate 3 versions
        </button>
        <button className="btn subtle" onClick={reset}>
          ↺ New attempt
        </button>
      </div>

      {versions.length > 0 && (
        <div className="fadeIn" style={{ marginTop: 16 }}>
          <div className="panelTitle">
            Three runs, same settings (T={temperature.toFixed(1)}, top-k={topK === 0 ? "all" : topK})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {versions.map((v, i) => (
              <div
                key={i}
                style={{
                  background: "var(--paper-2)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 15
                }}
              >
                <span style={{ color: "var(--ink-faint)", fontWeight: 700, marginRight: 8 }}>
                  {i + 1}.
                </span>
                <span style={{ color: "var(--ink-faint)" }}>{family.start}</span> {v}
              </div>
            ))}
          </div>
          <p className="hintText" style={{ marginTop: 8 }}>
            Identical runs? Lower top-k or temperature is squeezing out the randomness.
          </p>
        </div>
      )}

      <hr className="divider" />

      <div className="panelTitle">
        Next-token probabilities after your settings{" "}
        {lastPicked && !finished ? "(green = just sampled)" : ""}
      </div>
      <ProbabilityBars distribution={shaped} picked={finished ? null : lastPicked} maxBars={9} />

      <div className="revealBox" style={{ marginTop: 14, fontSize: 14.5 }}>
        <strong>Cheat sheet:</strong> Low temperature: safer, more repetitive. Medium temperature:
        varied but still coherent. High temperature: surprising, sometimes nonsense. Top-k = 1:
        always choose the most likely token.
      </div>

      <p className="hintText" style={{ marginTop: 10 }}>
        The math is real: probabilities are raised to 1/T and renormalized, then only the top-k
        stay in the race. Only the story tree is hand-made.
      </p>
    </div>
  );
}
