import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  regressionDatasets,
  twoHillsDataset
} from "../../content/learning-machines/regressionDatasets";
import {
  mse,
  mseGradient,
  bumpMse,
  bumpMseGradient,
  bumpPredict,
  bestBumpFit
} from "../../lib/learning/regression";
import { RegressionPlot } from "../../components/learning/RegressionPlot";
import { LossContour } from "../../components/learning/LossContour";
import { MiniChart } from "../../components/learning/MiniChart";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import { Slider } from "../../components/controls/Slider";
import { makeRng } from "../../lib/learning/rng";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const LR_PRESETS = [
  { label: "Too small", value: 0.005 },
  { label: "Good", value: 0.15 },
  { label: "Too large", value: 0.95 },
  { label: "Extreme", value: 2.2 }
];

const datasets = [...regressionDatasets, twoHillsDataset];

// The two-hills starts are chosen so "bad" rolls into the shallow valley
// (the local minimum) and "easy" rolls into the deep one.
const STARTS_LINE = { easy: { m: 0.4, b: 1.4 }, bad: { m: -2.8, b: -2.8 } };
// (easy reaches the deep valley at the "Good" preset lr; larger rates
// overshoot the narrow valley, which is honest learning-rate behavior)
const STARTS_BUMP = { easy: { m: 2.2, b: -1.2 }, bad: { m: 1.2, b: 0.9 } };

/** Loss the race flag is set at: a bit above the best reachable loss of
 * each dataset, so the target is honest everywhere. */
const TARGET_LOSS: Record<string, number> = {
  clean: 0.05,
  noisy: 0.3,
  outlier: 0.75,
  curved: 0.75,
  "two-hills": 0.28
};

export default function GradientDescentRace({ onResult, resetSignal }: ModuleComponentProps) {
  const [datasetId, setDatasetId] = useState(datasets[0].id);
  const [lr, setLr] = useState(0.15);
  const [m, setM] = useState(STARTS_LINE.bad.m);
  const [b, setB] = useState(STARTS_LINE.bad.b);
  const [trajectory, setTrajectory] = useState<{ m: number; b: number }[]>([STARTS_LINE.bad]);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [escaped, setEscaped] = useState(false);
  const [trapped, setTrapped] = useState(false);
  const stateRef = useRef({ m: STARTS_LINE.bad.m, b: STARTS_LINE.bad.b });
  const randRef = useRef(makeRng(4242));

  const dataset = datasets.find((d) => d.id === datasetId)!;
  const isBump = dataset.model === "bump";
  const STARTS = isBump ? STARTS_BUMP : STARTS_LINE;
  const lossOf = useMemo(
    () =>
      isBump
        ? (mm: number, bb: number) => bumpMse(dataset.points, mm, bb)
        : (mm: number, bb: number) => mse(dataset.points, mm, bb),
    [dataset, isBump]
  );
  const loss = useMemo(() => lossOf(m, b), [lossOf, m, b]);
  const bestPoint = useMemo(() => (isBump ? bestBumpFit(dataset.points) : undefined), [dataset, isBump]);
  const steps = lossHistory.length;

  const setStart = useCallback((sm: number, sb: number) => {
    stateRef.current = { m: sm, b: sb };
    setM(sm);
    setB(sb);
    setTrajectory([{ m: sm, b: sb }]);
    setLossHistory([]);
    setRunning(false);
    setEscaped(false);
    setTrapped(false);
  }, []);

  useEffect(() => {
    setDatasetId(datasets[0].id);
    setLr(0.15);
    setStart(STARTS_LINE.bad.m, STARTS_LINE.bad.b);
  }, [resetSignal, setStart]);

  const stepOnce = useCallback((): boolean => {
    const { m: cm, b: cb } = stateRef.current;
    const l = lossOf(cm, cb);
    const { dm, db } = isBump
      ? bumpMseGradient(dataset.points, cm, cb)
      : mseGradient(dataset.points, cm, cb);
    let nm = cm - lr * dm;
    let nb = cb - lr * db;
    let out = false;
    if (!Number.isFinite(nm) || !Number.isFinite(nb) || Math.abs(nm) > 60 || Math.abs(nb) > 60) {
      out = true;
      nm = Math.max(-60, Math.min(60, Number.isFinite(nm) ? nm : 60));
      nb = Math.max(-60, Math.min(60, Number.isFinite(nb) ? nb : 60));
    }
    stateRef.current = { m: nm, b: nb };
    setM(nm);
    setB(nb);
    setTrajectory((t) => [...t.slice(-160), { m: nm, b: nb }]);
    setLossHistory((h) => [...h.slice(-400), Math.min(l, 99)]);
    if (out) setEscaped(true);
    // Two-hills: descent settled in the shallow valley = a local minimum.
    if (isBump && Math.abs(nb - 0.7) < 0.25 && nm > 0.5 && nm < 1.5) {
      const nl = lossOf(nm, nb);
      if (nl < 0.9 && nl > 0.4) setTrapped(true);
    }
    return out;
  }, [dataset, lr, lossOf, isBump]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const out = stepOnce();
      if (out) setRunning(false);
    }, 90);
    return () => clearInterval(iv);
  }, [running, stepOnce]);

  useEffect(() => {
    onResult(
      `dataset '${dataset.id}', lr=${lr}: step ${steps}, loss=${Number.isFinite(loss) ? loss.toFixed(3) : "diverged"}${escaped ? " (escaped the landscape)" : ""}`
    );
  }, [dataset, lr, steps, loss, escaped, onResult]);

  const targetLoss = TARGET_LOSS[datasetId] ?? 0.15;
  const reachedTarget = loss < targetLoss;

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Dataset"
          options={datasets.map((d) => ({ value: d.id, label: d.label }))}
          value={datasetId}
          onChange={(id) => {
            setDatasetId(id);
            const s = datasets.find((d) => d.id === id)?.model === "bump" ? STARTS_BUMP : STARTS_LINE;
            setStart(s.bad.m, s.bad.b);
          }}
        />
        <div className="controlRow">
          <span className="hintText">Start:</span>
          <button className="btn subtle small" onClick={() => setStart(STARTS.easy.m, STARTS.easy.b)}>
            😊 Easy
          </button>
          <button className="btn subtle small" onClick={() => setStart(STARTS.bad.m, STARTS.bad.b)}>
            😈 Bad
          </button>
          <button
            className="btn subtle small"
            onClick={() => setStart(-3 + 6 * randRef.current(), -3 + 6 * randRef.current())}
          >
            🎲 Random
          </button>
        </div>
      </div>

      <div className="ctxGrid" style={{ gridTemplateColumns: "1.1fr 1fr", alignItems: "start" }}>
        <div className="vizStage" style={{ padding: 12 }}>
          <div className="panelTitle" style={{ paddingLeft: 6 }}>
            The {isBump ? "bump" : "line"} learning
          </div>
          {isBump ? (
            <RegressionPlot points={dataset.points} curve={(x) => bumpPredict(m, b, x)} showErrors />
          ) : (
            <RegressionPlot points={dataset.points} line={{ m, b }} showErrors />
          )}
          <div style={{ padding: "10px 6px 4px" }}>
            <MiniChart
              series={[{ label: "loss", color: "var(--blue)", values: lossHistory }]}
              yLabel="loss over steps"
              height={100}
            />
          </div>
        </div>
        <div className="vizStage" style={{ padding: 12 }}>
          <div className="panelTitle" style={{ paddingLeft: 6 }}>
            Rolling downhill in parameter space (drag to place the start)
          </div>
          <LossContour
            points={dataset.points}
            m={Math.max(-3, Math.min(3, m))}
            b={Math.max(-3, Math.min(3, b))}
            trajectory={trajectory.map((t) => ({
              m: Math.max(-3, Math.min(3, t.m)),
              b: Math.max(-3, Math.min(3, t.b))
            }))}
            showBest
            lossFn={isBump ? lossOf : undefined}
            bestPoint={bestPoint}
            mLabel={isBump ? "height m" : "slope m"}
            bLabel={isBump ? "center b" : "intercept b"}
            onChange={(nm, nb) => {
              if (!running) setStart(nm, nb);
            }}
          />
        </div>
      </div>

      {escaped && (
        <p className="warnText" style={{ marginTop: 12 }}>
          💥 The model jumped out of the landscape. Try a smaller learning rate, then press reset.
        </p>
      )}

      <div className="controlRow" style={{ marginTop: 14, alignItems: "flex-end" }}>
        <Slider
          label="Learning rate: the step size"
          value={lr}
          min={0.005}
          max={2.4}
          step={0.005}
          onChange={setLr}
          format={(v) => v.toFixed(3)}
          lowHint="tiny steps"
          highHint="huge jumps"
        />
        <Segmented
          ariaLabel="Learning rate preset"
          options={LR_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
          value={LR_PRESETS.find((p) => Math.abs(p.value - lr) < 1e-9)?.value ?? -1}
          onChange={(v) => setLr(v)}
        />
      </div>

      <div className="controlRow" style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={() => stepOnce()} disabled={running}>
          👣 Step once
        </button>
        <button className="btn accent" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Run"}
        </button>
        <button className="btn subtle" onClick={() => setStart(trajectory[0]?.m ?? STARTS.bad.m, trajectory[0]?.b ?? STARTS.bad.b)}>
          ↺ Reset to start
        </button>
        <span className="statPill">
          steps <span className="statValue">{steps}</span>
        </span>
        <span className="statPill">
          loss <span className="statValue">{Number.isFinite(loss) ? loss.toFixed(3) : "∞"}</span>
        </span>
        {reachedTarget && <span className="copiedFlash">🏁 below {targetLoss}: deepest valley!</span>}
        {trapped && !reachedTarget && (
          <span className="copiedFlash">🕳 Settled in the SHALLOW valley: a local minimum!</span>
        )}
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "fast",
            title: "Fastest safe descent",
            goal: `Reach the target loss (below ${targetLoss} here) in as few steps as possible. What is your record?`,
            done: reachedTarget
          },
          { id: "fail", title: "Make it fail", goal: "Choose a learning rate that makes the loss bounce or explode.", done: escaped },
          { id: "slow", title: "Slow learner", goal: "Make the model improve, but painfully slowly. How many steps would the valley take?" },
          { id: "rescue", title: "Bad start rescue", goal: "Start from the bad corner and still reach the valley. Which settings work?" },
          {
            id: "trapped",
            title: "The trap valley",
            goal: "On Two hills, run from the 😈 start. The loss falls, then stops falling. Where did the ball settle? Compare with the star.",
            done: trapped
          },
          {
            id: "escape",
            title: "Escape the trap",
            goal: "Still on Two hills: from the same 😈 start, find settings (or a smarter start) that reach the DEEPEST valley.",
            done: isBump && reachedTarget
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        Each step: compute the slope of the landscape (the gradient), then move a little bit
        downhill. The learning rate controls the step size. Too small is slow. Too large can jump
        past the valley.
        {isBump &&
          " On this landscape there are TWO valleys: gradient descent only ever rolls downhill, so whichever valley it enters first is where it stays. Real neural network landscapes are full of valleys like this."}
      </p>
    </div>
  );
}
