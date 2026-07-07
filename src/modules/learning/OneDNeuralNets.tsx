import { useEffect, useMemo, useRef, useState } from "react";
import {
  neuron,
  stepTarget,
  bumpTarget,
  neuralnet,
  pointsMse,
  bestNeuronB,
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
  samples,
  extras
}: {
  model: (x: number) => number;
  samples: { x: number; y: number }[];
  extras?: { f: (x: number) => number; color: string }[];
}) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Data and model curve" style={{ display: "block" }}>
      <rect x={0} y={0} width={W} height={H} fill="var(--paper-2)" rx={10} />
      {/* y = 0 and y = 1 guides */}
      <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="var(--line)" strokeWidth={1.4} />
      <line x1={PAD} y1={sy(1)} x2={W - PAD} y2={sy(1)} stroke="var(--line)" strokeWidth={1.4} strokeDasharray="4 4" />
      <text x={W - PAD - 4} y={sy(0) - 5} textAnchor="end" fontSize={11} fill="var(--ink-faint)">y = 0</text>
      <text x={W - PAD - 4} y={sy(1) - 5} textAnchor="end" fontSize={11} fill="var(--ink-faint)">y = 1</text>
      {/* error bars: the model's mistake on every data point */}
      {samples.map((p, i) => (
        <line
          key={`e${i}`}
          x1={sx(p.x)}
          y1={sy(p.y)}
          x2={sx(p.x)}
          y2={sy(Math.max(-0.15, Math.min(1.15, model(p.x))))}
          stroke="var(--red)"
          strokeWidth={1.5}
          opacity={0.4}
        />
      ))}
      {/* optional hidden-neuron curves */}
      {extras?.map((e, i) => (
        <polyline key={i} points={curvePath(e.f)} fill="none" stroke={e.color} strokeWidth={1.8} opacity={0.65} />
      ))}
      {/* model curve */}
      <polyline points={curvePath(model)} fill="none" stroke="var(--amber-deep)" strokeWidth={3.2} strokeLinecap="round" />
      {/* data points */}
      {samples.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.6} fill="var(--blue-mid)" opacity={0.75} />
      ))}
      <text x={PAD + 4} y={H - 6} fontSize={11} fill="var(--ink-faint)">x from {X_MIN} to {X_MAX}</text>
    </svg>
  );
}

/** Loss as a function of the single knob b: a 1D loss landscape. */
function BLossPlot({
  b,
  samples,
  onDrag
}: {
  b: number;
  samples: { x: number; y: number }[];
  onDrag: (b: number) => void;
}) {
  const HL = 150;
  const dragRef = useRef(false);
  const lossAt = (bb: number) => pointsMse((x) => neuron(x, bb), samples);

  const { pts, lo, hi } = useMemo(() => {
    const arr: { b: number; l: number }[] = [];
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i <= 160; i++) {
      const bb = X_MIN + ((X_MAX - X_MIN) * i) / 160;
      const l = lossAt(bb);
      arr.push({ b: bb, l });
      if (l < lo) lo = l;
      if (l > hi) hi = l;
    }
    return { pts: arr, lo, hi };
    // samples are fixed for the module's lifetime
  }, [samples]);

  const ly = (l: number) => HL - 22 - ((l - lo) / (hi - lo + 1e-9)) * (HL - 44);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    onDrag(
      Math.round(
        Math.max(X_MIN, Math.min(X_MAX, ((px - PAD) / (W - 2 * PAD)) * (X_MAX - X_MIN) + X_MIN)) * 10
      ) / 10
    );
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${HL}`}
      width="100%"
      role="img"
      aria-label="Loss as a function of the threshold b"
      style={{ touchAction: "none", cursor: "crosshair", display: "block" }}
      onPointerDown={(e) => {
        dragRef.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => dragRef.current && move(e)}
      onPointerUp={() => (dragRef.current = false)}
      onPointerLeave={() => (dragRef.current = false)}
    >
      <rect x={0} y={0} width={W} height={HL} fill="var(--paper-2)" rx={10} />
      <polyline
        points={pts.map((p) => `${sx(p.b)},${ly(p.l)}`).join(" ")}
        fill="none"
        stroke="var(--blue)"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <circle cx={sx(b)} cy={ly(lossAt(b))} r={7.5} fill="var(--amber-deep)" stroke="#fff" strokeWidth={2.2} />
      <text x={PAD + 4} y={16} fontSize={11.5} fontWeight={700} fill="var(--ink)">
        the loss landscape: one point per possible b
      </text>
      <text x={W - PAD - 4} y={HL - 8} textAnchor="end" fontSize={11} fill="var(--ink-faint)">
        threshold b →
      </text>
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

const FLAT: NetParams = { w1: 0, w2: 0, b1: 0, b2: 0, b3: 0 };
const OPT_LR = 3;
const OPT_MAX_STEPS = 450;
// Loss floors are set by the binary sampling noise (see scripts/qa_onednets.ts):
// activity A bottoms out near 0.077, activity B near 0.098.
const A_GOAL = 0.08;
const B_HAND_GOAL = 0.13;
const B_OPT_GOAL = 0.105;

export default function OneDNeuralNets({ onResult, resetSignal }: ModuleComponentProps) {
  const [tab, setTab] = useState<"one" | "five">("one");

  const samplesA = useMemo(() => sampleBinaryPoints(stepTarget, 60, 21), []);
  const samplesB = useMemo(() => sampleBinaryPoints(bumpTarget, 80, 22), []);
  const bestA = useMemo(() => bestNeuronB(samplesA), [samplesA]);

  // Activity A: one neuron
  const [b, setB] = useState(-4);

  // Activity B: five parameters. Always starts from a random setting: the
  // point is hand-tuning, so there are no "good preset" shortcuts.
  const randomParams = (seed: number): NetParams => {
    const rng = makeRng(seed * 77);
    return {
      w1: -10 + 20 * rng(),
      w2: -10 + 20 * rng(),
      b1: -8 + 16 * rng(),
      b2: -8 + 16 * rng(),
      b3: -10 + 20 * rng()
    };
  };
  const seedRef = useRef(12);
  const [params, setParams] = useState<NetParams>(() => randomParams(11));
  const [showHidden, setShowHidden] = useState(false);
  const [running, setRunning] = useState(false);
  const [optSteps, setOptSteps] = useState(0);
  const [usedOptimizer, setUsedOptimizer] = useState(false);
  const [optRevealed, setOptRevealed] = useState(false);
  const [handBest, setHandBest] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const lossA = useMemo(() => pointsMse((x) => neuron(x, b), samplesA), [b, samplesA]);
  const lossB = useMemo(() => pointsMse((x) => neuralnet(x, params), samplesB), [params, samplesB]);

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
    loadPreset(randomParams(seedRef.current));
    seedRef.current += 1;
  };

  const paramsRef = useRef(params);
  paramsRef.current = params;

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
      const prevLoss = pointsMse((x) => neuralnet(x, p), samplesB);
      for (let i = 0; i < 15; i++) {
        const r = descentStep(p, samplesB, OPT_LR);
        p = r.params;
        steps++;
      }
      const newLoss = pointsMse((x) => neuralnet(x, p), samplesB);
      setParams({ ...p });
      setOptSteps(steps);
      if (steps >= OPT_MAX_STEPS || Math.abs(prevLoss - newLoss) < 1e-8) stopOpt();
    }, 40);
  };

  useEffect(() => stopOpt, []);

  useEffect(() => {
    if (resetSignal === 0) return; // initial params already randomized
    setTab("one");
    setB(-4);
    randomPreset();
    setShowHidden(false);
    setOptRevealed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            ? "Blue dots are data: y is 0 or 1. Fit them with one soft step."
            : "Same data idea, but the pattern needs five knobs. No shortcuts: tune!"}
        </span>
      </div>

      {tab === "one" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div className="vizStage" style={{ padding: 12 }}>
              <CurvePlot model={(x) => neuron(x, b)} samples={samplesA} />
            </div>
            <div className="vizStage" style={{ padding: 12, marginTop: 10 }}>
              <BLossPlot b={b} samples={samplesA} onDrag={setB} />
            </div>
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
              <button className="btn accent small" onClick={() => setB(bestA.b)}>🤖 Show optimum</button>
            </div>
            <p className="hintText" style={{ marginTop: 10 }}>
              The red bars are the model's mistakes on each point. The lower plot is this
              activity's whole loss landscape: one knob, one axis. The orange dot on it is YOU.
              Notice the loss never reaches zero: the data is noisy, so even the best b keeps some
              error.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div className="vizStage" style={{ padding: 12 }}>
              <CurvePlot
                model={(x) => neuralnet(x, params)}
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
            <p className="hintText" style={{ marginTop: 8 }}>
              The dots rise, then fall: a bump. One step cannot make a bump, but two steps
              combined can. Tip: place one hidden threshold where the data rises and one where it
              falls, then balance w1, w2 and b3.
            </p>
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
              <button className="btn subtle small" onClick={randomPreset}>🎲 New random start</button>
              <button className="btn subtle small" onClick={() => loadPreset(FLAT)}>Flat (trap)</button>
            </div>
            <div className="controlRow" style={{ marginTop: 8 }}>
              {optRevealed ? (
                <button className={"btn small " + (running ? "subtle" : "accent")} onClick={runOptimization}>
                  {running ? "⏸ Stop" : "🤖 Run optimization"}
                </button>
              ) : (
                <button
                  className="btn subtle small"
                  style={{ opacity: 0.75 }}
                  onClick={() => setOptRevealed(true)}
                >
                  🔒 There is an automatic optimizer... reveal it only AFTER your best hand attempt
                </button>
              )}
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
              title: "Fit the data",
              goal: `Move the threshold until the step matches the data. Get the loss below ${A_GOAL}.`,
              done: lossA < A_GOAL
            },
            {
              id: "read-landscape",
              title: "Read the landscape",
              goal: "Before touching the slider, look at the lower plot and predict the best b. Then check yourself."
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
              goal: `Tune the five knobs yourself. Get the loss below ${B_HAND_GOAL}.`,
              done: (handBest ?? 1) < B_HAND_GOAL
            },
            {
              id: "machine-bump",
              title: "Then let the machine refine",
              goal: `After your best hand attempt, reveal the optimizer and run it FROM your settings. Does it beat you? (Below ${B_OPT_GOAL} counts.)`,
              done: usedOptimizer && lossB < B_OPT_GOAL
            },
            {
              id: "trap",
              title: "The trap start",
              goal: "Load 'Flat (trap)' and run the optimizer. It gets stuck! Why might a perfectly symmetric start be a problem?"
            }
          ]}
        />
      )}
    </div>
  );
}
