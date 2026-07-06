import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { regressionDatasets } from "../../content/learning-machines/regressionDatasets";
import { mse, mseGradient } from "../../lib/learning/regression";
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

const STARTS: Record<string, { m: number; b: number }> = {
  easy: { m: 0.4, b: 1.4 },
  bad: { m: -2.8, b: -2.8 }
};

export default function GradientDescentRace({ onResult, resetSignal }: ModuleComponentProps) {
  const [datasetId, setDatasetId] = useState(regressionDatasets[0].id);
  const [lr, setLr] = useState(0.15);
  const [m, setM] = useState(STARTS.bad.m);
  const [b, setB] = useState(STARTS.bad.b);
  const [trajectory, setTrajectory] = useState<{ m: number; b: number }[]>([STARTS.bad]);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [escaped, setEscaped] = useState(false);
  const stateRef = useRef({ m: STARTS.bad.m, b: STARTS.bad.b });
  const randRef = useRef(makeRng(4242));

  const dataset = regressionDatasets.find((d) => d.id === datasetId)!;
  const loss = useMemo(() => mse(dataset.points, m, b), [dataset, m, b]);
  const steps = lossHistory.length;

  const setStart = useCallback((sm: number, sb: number) => {
    stateRef.current = { m: sm, b: sb };
    setM(sm);
    setB(sb);
    setTrajectory([{ m: sm, b: sb }]);
    setLossHistory([]);
    setRunning(false);
    setEscaped(false);
  }, []);

  useEffect(() => {
    setDatasetId(regressionDatasets[0].id);
    setLr(0.15);
    setStart(STARTS.bad.m, STARTS.bad.b);
  }, [resetSignal, setStart]);

  const stepOnce = useCallback((): boolean => {
    const { m: cm, b: cb } = stateRef.current;
    const l = mse(dataset.points, cm, cb);
    const { dm, db } = mseGradient(dataset.points, cm, cb);
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
    return out;
  }, [dataset, lr]);

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

  const reachedTarget = loss < 0.15;

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Dataset"
          options={regressionDatasets.map((d) => ({ value: d.id, label: d.label }))}
          value={datasetId}
          onChange={(id) => {
            setDatasetId(id);
            setStart(stateRef.current.m, stateRef.current.b);
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
          <div className="panelTitle" style={{ paddingLeft: 6 }}>The line learning</div>
          <RegressionPlot points={dataset.points} line={{ m, b }} showErrors />
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
        {reachedTarget && <span className="copiedFlash">🏁 below 0.15!</span>}
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "fast",
            title: "Fastest safe descent",
            goal: "Reach loss below 0.15 in as few steps as possible. What is your record?",
            done: reachedTarget
          },
          { id: "fail", title: "Make it fail", goal: "Choose a learning rate that makes the loss bounce or explode.", done: escaped },
          { id: "slow", title: "Slow learner", goal: "Make the model improve, but painfully slowly. How many steps would the valley take?" },
          { id: "rescue", title: "Bad start rescue", goal: "Start from the bad corner and still reach the valley. Which settings work?" }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        Each step: compute the slope of the landscape (the gradient), then move a little bit
        downhill. The learning rate controls the step size. Too small is slow. Too large can jump
        past the valley.
      </p>
    </div>
  );
}
