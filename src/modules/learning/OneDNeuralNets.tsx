import { useEffect, useMemo, useRef, useState } from "react";
import {
  neuron,
  stepTarget,
  bumpTarget,
  neuralnet,
  curveMse,
  descentStep,
  sampleBinaryPoints,
  X_MIN,
  X_MAX
} from "../../lib/learning/oneDNets";
import type { NetParams } from "../../lib/learning/oneDNets";
import { makeRng } from "../../lib/learning/rng";
import { Slider } from "../../components/controls/Slider";
import { Segmented } from "../../components/controls/Segmented";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const W = 600;
const H = 260;
const PAD = 10;
const sx = (x: number) => PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD);
const sy = (y: number) => H - 24 - y * (H - 48);

function curvePath(f: (x: number) => number, n = 120): string {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = X_MIN + ((X_MAX - X_MIN) * i) / n;
    return `${sx(x)},${sy(Math.max(-0.15, Math.min(1.15, f(x))))}`;
  }).join(" ");
}

function CurvePlot({
  model,
  target,
  samples,
  extras
}: {
  model: (x: number) => number;
  target: (x: number) => number;
  samples: { x: number; y: number }[];
  extras?: { f: (x: number) => number; color: string }[];
}) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Target and model curves" style={{ display: "block" }}>
      <rect x={0} y={0} width={W} height={H} fill="var(--paper-2)" rx={10} />
      {/* y = 0 and y = 1 guides */}
      <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="var(--line)" strokeWidth={1.4} />
      <line x1={PAD} y1={sy(1)} x2={W - PAD} y2={sy(1)} stroke="var(--line)" strokeWidth={1.4} strokeDasharray="4 4" />
      <text x={W - PAD - 4} y={sy(0) - 5} textAnchor="end" fontSize={11} fill="var(--ink-faint)">y = 0</text>
      <text x={W - PAD - 4} y={sy(1) - 5} textAnchor="end" fontSize={11} fill="var(--ink-faint)">y = 1</text>
      {/* sample points drawn from the target probability */}
      {samples.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.4} fill="var(--blue-mid)" opacity={0.35} />
      ))}
      {/* target curve */}
      <polyline points={curvePath(target)} fill="none" stroke="var(--blue)" strokeWidth={2.4} strokeDasharray="7 5" opacity={0.75} />
      {/* optional hidden-neuron curves */}
      {extras?.map((e, i) => (
        <polyline key={i} points={curvePath(e.f)} fill="none" stroke={e.color} strokeWidth={1.8} opacity={0.65} />
      ))}
      {/* model curve */}
      <polyline points={curvePath(model)} fill="none" stroke="var(--amber-deep)" strokeWidth={3.2} strokeLinecap="round" />
      <text x={PAD + 4} y={H - 6} fontSize={11} fill="var(--ink-faint)">x from {X_MIN} to {X_MAX}</text>
    </svg>
  );
}

function NetDiagram({ five }: { five: boolean }) {
  return (
    <svg viewBox="0 0 220 90" width={190} role="img" aria-label="Network diagram">
      {five ? (
        <>
          <line x1={30} y1={45} x2={95} y2={22} stroke="var(--ink-faint)" strokeWidth={1.6} />
          <line x1={30} y1={45} x2={95} y2={68} stroke="var(--ink-faint)" strokeWidth={1.6} />
          <line x1={95} y1={22} x2={170} y2={45} stroke="var(--violet)" strokeWidth={2} />
          <line x1={95} y1={68} x2={170} y2={45} stroke="var(--teal)" strokeWidth={2} />
          <circle cx={30} cy={45} r={13} fill="var(--paper-2)" stroke="var(--ink-faint)" strokeWidth={1.5} />
          <circle cx={95} cy={22} r={13} fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth={1.8} />
          <circle cx={95} cy={68} r={13} fill="var(--teal-soft)" stroke="var(--teal)" strokeWidth={1.8} />
          <circle cx={170} cy={45} r={13} fill="var(--amber-soft)" stroke="var(--amber-deep)" strokeWidth={1.8} />
          <text x={30} y={49} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--ink)">x</text>
          <text x={95} y={26} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--ink)">b1</text>
          <text x={95} y={72} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--ink)">b2</text>
          <text x={170} y={49} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--ink)">b3</text>
          <text x={135} y={22} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--violet)">w1</text>
          <text x={135} y={72} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--teal)">w2</text>
        </>
      ) : (
        <>
          <line x1={55} y1={45} x2={145} y2={45} stroke="var(--ink-faint)" strokeWidth={1.6} />
          <circle cx={55} cy={45} r={13} fill="var(--paper-2)" stroke="var(--ink-faint)" strokeWidth={1.5} />
          <circle cx={145} cy={45} r={13} fill="var(--amber-soft)" stroke="var(--amber-deep)" strokeWidth={1.8} />
          <text x={55} y={49} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--ink)">x</text>
          <text x={145} y={49} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--ink)">b</text>
        </>
      )}
    </svg>
  );
}

const GOOD: NetParams = { w1: 10, w2: -10, b1: -2.1, b2: 5, b3: 5 };
const ALMOST: NetParams = { w1: 7, w2: -6, b1: -1, b2: 4, b3: 4 };
const FLAT: NetParams = { w1: 0, w2: 0, b1: 0, b2: 0, b3: 0 };
const OPT_LR = 3;
const OPT_MAX_STEPS = 450;

export default function OneDNeuralNets({ onResult, resetSignal }: ModuleComponentProps) {
  const [tab, setTab] = useState<"one" | "five">("one");

  // Activity A: one neuron
  const [b, setB] = useState(-4);

  // Activity B: five parameters
  const [params, setParams] = useState<NetParams>({ ...ALMOST });
  const [showHidden, setShowHidden] = useState(false);
  const [running, setRunning] = useState(false);
  const [optSteps, setOptSteps] = useState(0);
  const [usedOptimizer, setUsedOptimizer] = useState(false);
  const [handBest, setHandBest] = useState<number | null>(null);
  const [randomSeed, setRandomSeed] = useState(11);
  const timerRef = useRef<number | null>(null);

  const samplesA = useMemo(() => sampleBinaryPoints(stepTarget, 60, 21), []);
  const samplesB = useMemo(() => sampleBinaryPoints(bumpTarget, 60, 22), []);

  const lossA = useMemo(() => curveMse((x) => neuron(x, b), stepTarget), [b]);
  const lossB = useMemo(() => curveMse((x) => neuralnet(x, params), bumpTarget), [params]);

  const stopOpt = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  };

  const loadPreset = (p: NetParams) => {
    stopOpt();
    setParams({ ...p });
    setOptSteps(0);
    setUsedOptimizer(false);
    setHandBest(null);
  };

  const randomPreset = () => {
    const rng = makeRng(randomSeed * 77);
    setRandomSeed((s) => s + 1);
    loadPreset({
      w1: -10 + 20 * rng(),
      w2: -10 + 20 * rng(),
      b1: -8 + 16 * rng(),
      b2: -8 + 16 * rng(),
      b3: -10 + 20 * rng()
    });
  };

  const runOptimization = () => {
    if (running) {
      stopOpt();
      return;
    }
    setRunning(true);
    setUsedOptimizer(true);
    let p = { ...paramsRef.current };
    let steps = 0;
    timerRef.current = window.setInterval(() => {
      let prevLoss = curveMse((x) => neuralnet(x, p), bumpTarget);
      for (let i = 0; i < 15; i++) {
        const r = descentStep(p, bumpTarget, OPT_LR);
        p = r.params;
        steps++;
      }
      const newLoss = curveMse((x) => neuralnet(x, p), bumpTarget);
      setParams({ ...p });
      setOptSteps(steps);
      if (steps >= OPT_MAX_STEPS || Math.abs(prevLoss - newLoss) < 1e-8) stopOpt();
    }, 40);
  };

  // Keep the latest params visible to the optimizer without restarting it.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => stopOpt, []);

  useEffect(() => {
    setTab("one");
    setB(-4);
    loadPreset(ALMOST);
    setShowHidden(false);
  }, [resetSignal]);

  // Track the best loss reached WITHOUT the optimizer (for the hand-fit challenge).
  useEffect(() => {
    if (!usedOptimizer) setHandBest((prev) => (prev === null || lossB < prev ? lossB : prev));
  }, [lossB, usedOptimizer]);

  useEffect(() => {
    onResult(
      tab === "one"
        ? `one neuron: b=${b.toFixed(1)}, loss=${lossA.toFixed(4)}`
        : `five knobs: loss=${lossB.toFixed(4)}${usedOptimizer ? ` (optimizer, ${optSteps} steps)` : " (by hand)"}`
    );
  }, [tab, b, lossA, lossB, usedOptimizer, optSteps, onResult]);

  const setParam = (k: keyof NetParams) => (v: number) => {
    stopOpt();
    setParams((p) => ({ ...p, [k]: v }));
  };

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Activity"
          options={[
            { value: "one", label: "1 neuron, 1 knob" },
            { value: "five", label: "2 hidden neurons, 5 knobs" }
          ]}
          value={tab}
          onChange={(v) => setTab(v as "one" | "five")}
        />
        <span className="hintText">
          {tab === "one"
            ? "The dashed blue curve is the target. Dots are data sampled from it."
            : "Same idea, but now the target is a bump and you have five knobs."}
        </span>
      </div>

      {tab === "one" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <div className="vizStage" style={{ padding: 12, flex: "1 1 420px", width: "auto" }}>
            <CurvePlot model={(x) => neuron(x, b)} target={stepTarget} samples={samplesA} />
          </div>
          <div style={{ flex: "1 1 260px", minWidth: 260 }}>
            <div className="controlRow" style={{ justifyContent: "center", marginBottom: 4 }}>
              <NetDiagram five={false} />
            </div>
            <Slider label="threshold b" value={b} min={-8} max={8} step={0.1} onChange={setB} format={(v) => v.toFixed(1)} />
            <div className="controlRow" style={{ marginTop: 10 }}>
              <span className="statPill">
                loss (MSE) <span className="statValue">{lossA.toFixed(4)}</span>
              </span>
              <button className="btn subtle small" onClick={() => setB(-4)}>↺ Reset</button>
              <button className="btn accent small" onClick={() => setB(2.1)}>🤖 Show optimum</button>
            </div>
            <p className="hintText" style={{ marginTop: 10 }}>
              The orange curve is one sigmoid neuron: a soft step. The knob b slides the step left
              and right. Match the data as well as you can.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div className="vizStage" style={{ padding: 12 }}>
              <CurvePlot
                model={(x) => neuralnet(x, params)}
                target={bumpTarget}
                samples={samplesB}
                extras={
                  showHidden
                    ? [
                        { f: (x) => neuron(x, params.b1), color: "var(--violet)" },
                        { f: (x) => neuron(x, params.b2), color: "var(--teal)" }
                      ]
                    : undefined
                }
              />
            </div>
            <div className="controlRow" style={{ marginTop: 10 }}>
              <span className="statPill">
                loss (MSE) <span className="statValue">{lossB.toFixed(4)}</span>
              </span>
              <span className="statPill">
                best by hand <span className="statValue">{handBest === null ? "-" : handBest.toFixed(4)}</span>
              </span>
              {optSteps > 0 && (
                <span className="statPill">
                  optimizer steps <span className="statValue">{optSteps}</span>
                </span>
              )}
              <label className="hintText" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
                show the two hidden neurons
              </label>
            </div>
          </div>
          <div style={{ flex: "1 1 280px", minWidth: 270 }}>
            <div className="controlRow" style={{ justifyContent: "center", marginBottom: 4 }}>
              <NetDiagram five />
            </div>
            <Slider label="w1 (hidden 1 → output)" value={params.w1} min={-10} max={10} step={0.1} onChange={setParam("w1")} format={(v) => v.toFixed(1)} />
            <Slider label="w2 (hidden 2 → output)" value={params.w2} min={-10} max={10} step={0.1} onChange={setParam("w2")} format={(v) => v.toFixed(1)} />
            <Slider label="b1 (hidden 1 threshold)" value={params.b1} min={-8} max={8} step={0.1} onChange={setParam("b1")} format={(v) => v.toFixed(1)} />
            <Slider label="b2 (hidden 2 threshold)" value={params.b2} min={-8} max={8} step={0.1} onChange={setParam("b2")} format={(v) => v.toFixed(1)} />
            <Slider label="b3 (output threshold)" value={params.b3} min={-10} max={10} step={0.1} onChange={setParam("b3")} format={(v) => v.toFixed(1)} />
            <div className="controlRow" style={{ marginTop: 10 }}>
              <button className="btn subtle small" onClick={randomPreset}>🎲 Random start</button>
              <button className="btn subtle small" onClick={() => loadPreset(ALMOST)}>Almost good</button>
              <button className="btn subtle small" onClick={() => loadPreset(FLAT)}>Flat (trap)</button>
              <button className="btn subtle small" onClick={() => loadPreset(GOOD)}>Good preset</button>
              <button className={"btn small " + (running ? "subtle" : "accent")} onClick={runOptimization}>
                {running ? "⏸ Stop" : "🤖 Run optimization"}
              </button>
            </div>
          </div>
        </div>
      )}

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      {tab === "one" ? (
        <ChallengeCards
          challenges={[
            {
              id: "match-step",
              title: "Match the step",
              goal: "Move the threshold until the orange curve matches the data. Get the loss below 0.001.",
              done: lossA < 0.001
            },
            {
              id: "what-b-does",
              title: "What does b do?",
              goal: "Slide b from -8 to 8 and describe in one sentence what the knob controls."
            }
          ]}
        />
      ) : (
        <ChallengeCards
          challenges={[
            {
              id: "hand-bump",
              title: "Fit the bump by hand",
              goal: "Tune the five knobs yourself (no optimization button). Get the loss below 0.08.",
              done: (handBest ?? 1) < 0.08
            },
            {
              id: "machine-bump",
              title: "Now let the machine try",
              goal: "Press run optimization. Did it find a better setting than you? (Below 0.01 counts as yes.)",
              done: usedOptimizer && lossB < 0.01
            },
            {
              id: "trap",
              title: "The trap start",
              goal: "Load 'Flat (trap)' and run the optimization. It gets stuck! Why might a perfectly symmetric start be a problem?"
            }
          ]}
        />
      )}

    </div>
  );
}
