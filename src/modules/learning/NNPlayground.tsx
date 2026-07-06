import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { classificationDatasets } from "../../content/learning-machines/classificationDatasets";
import { budgetChallenges } from "../../content/learning-machines/nnBudgetChallenges";
import { TinyNN, bceLoss, accuracy } from "../../lib/learning/tinyNN";
import type { Activation } from "../../lib/learning/tinyNN";
import { MiniChart } from "../../components/learning/MiniChart";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const PLOT = 380; // css px of the boundary square
const GRID = 64; // boundary resolution
const STEPS_PER_TICK = 12;

const LR_OPTIONS = [
  { value: 0.03, label: "0.03" },
  { value: 0.3, label: "0.3" },
  { value: 1, label: "1" },
  { value: 5, label: "5 (danger)" }
];

function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

const AMBER: [number, number, number] = [245, 166, 35];
const BLUE: [number, number, number] = [59, 100, 192];
const WHITE: [number, number, number] = [252, 251, 248];

export default function NNPlayground({ onResult, resetSignal }: ModuleComponentProps) {
  const [datasetId, setDatasetId] = useState(classificationDatasets[0].id);
  const [hidden, setHidden] = useState(1);
  const [neurons, setNeurons] = useState(4);
  const [activation, setActivation] = useState<Activation>("tanh");
  const [lr, setLr] = useState(0.3);
  const [running, setRunning] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [showTest, setShowTest] = useState(true);
  const [metrics, setMetrics] = useState({ trainLoss: 0, testLoss: 0, trainAcc: 0, testAcc: 0 });
  const [history, setHistory] = useState<{ trainLoss: number[]; testLoss: number[] }>({ trainLoss: [], testLoss: [] });
  const [diverged, setDiverged] = useState(false);
  const [bestByDataset, setBestByDataset] = useState<Record<string, number>>({});
  /** Budget challenge wins: challenge id -> parameter count of the winning net. */
  const [budgetWins, setBudgetWins] = useState<Record<string, number>>({});

  const nnRef = useRef<TinyNN | null>(null);
  const seedRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tickRef = useRef(0);

  const dataset = classificationDatasets.find((d) => d.id === datasetId)!;
  const layerSizes = useMemo(() => Array.from({ length: hidden }, () => neurons), [hidden, neurons]);

  const rebuild = useCallback(
    (newSeed: boolean) => {
      if (newSeed) seedRef.current += 1;
      nnRef.current = new TinyNN({ hiddenLayers: layerSizes, activation, seed: seedRef.current * 77 });
      setEpoch(0);
      setHistory({ trainLoss: [], testLoss: [] });
      setDiverged(false);
      setRunning(false);
      setMetrics({
        trainLoss: bceLoss(nnRef.current, dataset.train),
        testLoss: bceLoss(nnRef.current, dataset.test),
        trainAcc: accuracy(nnRef.current, dataset.train),
        testAcc: accuracy(nnRef.current, dataset.test)
      });
      tickRef.current++;
      drawBoundary();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layerSizes, activation, dataset]
  );

  const drawBoundary = useCallback(() => {
    const canvas = canvasRef.current;
    const nn = nnRef.current;
    if (!canvas || !nn) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cell = canvas.width / GRID;
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const x1 = -1 + (2 * (i + 0.5)) / GRID;
        const x2 = 1 - (2 * (j + 0.5)) / GRID;
        const p = nn.predict(x1, x2);
        const color =
          p >= 0.5 ? mix(WHITE, BLUE, Math.min((p - 0.5) * 2, 1) * 0.55) : mix(WHITE, AMBER, Math.min((0.5 - p) * 2, 1) * 0.55);
        ctx.fillStyle = color;
        ctx.fillRect(i * cell, j * cell, cell + 1, cell + 1);
      }
    }
  }, []);

  // rebuild on architecture/dataset/activation change and on module reset
  useEffect(() => {
    rebuild(false);
  }, [rebuild]);

  useEffect(() => {
    setDatasetId(classificationDatasets[0].id);
    setHidden(1);
    setNeurons(4);
    setActivation("tanh");
    setLr(0.3);
    setShowTest(true);
    setBestByDataset({});
    seedRef.current = 1;
  }, [resetSignal]);

  const doSteps = useCallback(
    (n: number) => {
      const nn = nnRef.current;
      if (!nn) return;
      for (let k = 0; k < n; k++) nn.trainStep(dataset.train, lr);
      if (nn.diverged()) {
        setDiverged(true);
        setRunning(false);
      }
      const m = {
        trainLoss: bceLoss(nn, dataset.train),
        testLoss: bceLoss(nn, dataset.test),
        trainAcc: accuracy(nn, dataset.train),
        testAcc: accuracy(nn, dataset.test)
      };
      setMetrics(m);
      setEpoch((e) => e + n);
      setHistory((h) => ({
        trainLoss: [...h.trainLoss.slice(-300), Math.min(m.trainLoss, 3)],
        testLoss: [...h.testLoss.slice(-300), Math.min(m.testLoss, 3)]
      }));
      setBestByDataset((prev) =>
        m.testAcc > (prev[dataset.id] ?? 0) ? { ...prev, [dataset.id]: m.testAcc } : prev
      );
      tickRef.current++;
      if (tickRef.current % 2 === 0) drawBoundary();
    },
    [dataset, lr, drawBoundary]
  );

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => doSteps(STEPS_PER_TICK), 55);
    return () => clearInterval(iv);
  }, [running, doSteps]);

  useEffect(() => {
    onResult(
      `dataset '${dataset.id}', arch [2,${layerSizes.join(",")}${layerSizes.length ? "," : ""}1] ${activation}, lr=${lr}: epoch ${epoch}, test acc ${(metrics.testAcc * 100).toFixed(0)}%`
    );
  }, [dataset, layerSizes, activation, lr, epoch, metrics, onResult]);

  const params = nnRef.current?.paramCount() ?? 0;
  const sizes = [2, ...layerSizes, 1];

  // Latch budget-challenge wins: right dataset, within budget, target reached.
  useEffect(() => {
    for (const c of budgetChallenges) {
      if (datasetId === c.datasetId && params <= c.budget && metrics.testAcc >= c.accTarget && epoch > 0) {
        setBudgetWins((prev) =>
          prev[c.id] === undefined || params < prev[c.id] ? { ...prev, [c.id]: params } : prev
        );
      }
    }
  }, [datasetId, params, metrics.testAcc, epoch]);

  const budgetStatus = (c: (typeof budgetChallenges)[number]): { text: string; tone: "ok" | "warn" | "idle" } => {
    if (budgetWins[c.id] !== undefined) return { text: `✅ solved with ${budgetWins[c.id]} parameters`, tone: "ok" };
    if (datasetId !== c.datasetId) return { text: "switch to this dataset to attempt", tone: "idle" };
    if (params > c.budget) return { text: `too large: ${params} > ${c.budget} parameters`, tone: "warn" };
    if (running) return { text: `training… test ${(metrics.testAcc * 100).toFixed(0)}% of ${(c.accTarget * 100).toFixed(0)}%`, tone: "idle" };
    if (epoch === 0) return { text: "within budget, not attempted yet", tone: "idle" };
    return { text: `not accurate yet: test ${(metrics.testAcc * 100).toFixed(0)}% of ${(c.accTarget * 100).toFixed(0)}%`, tone: "idle" };
  };

  return (
    <div className="panel">
      {/* controls */}
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <label className="statPill" style={{ gap: 8 }}>
          Dataset
          <select
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value)}
            aria-label="Choose a dataset"
            style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "var(--blue)", cursor: "pointer" }}
          >
            {classificationDatasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.emoji} {d.label}
              </option>
            ))}
          </select>
        </label>
        <div className="controlRow">
          <span className="hintText">Hidden layers</span>
          <Segmented ariaLabel="Hidden layers" options={[0, 1, 2, 3].map((v) => ({ value: v, label: `${v}` }))} value={hidden} onChange={setHidden} />
          <span className="hintText">Neurons</span>
          <Segmented ariaLabel="Neurons per layer" options={[1, 2, 4, 6, 8].map((v) => ({ value: v, label: `${v}` }))} value={neurons} onChange={setNeurons} />
          <span className="hintText">Activation</span>
          <Segmented
            ariaLabel="Activation"
            options={[
              { value: "tanh", label: "tanh" },
              { value: "relu", label: "ReLU" }
            ]}
            value={activation}
            onChange={(v) => setActivation(v as Activation)}
          />
          <span className="hintText">Learning rate</span>
          <Segmented ariaLabel="Learning rate" options={LR_OPTIONS} value={lr} onChange={setLr} />
        </div>
      </div>

      <div className="ctxGrid" style={{ gridTemplateColumns: "auto 1fr", alignItems: "start" }}>
        {/* boundary plot */}
        <div className="vizStage" style={{ padding: 12, width: PLOT + 24 }}>
          <div style={{ position: "relative", width: PLOT, height: PLOT }}>
            <canvas ref={canvasRef} width={320} height={320} style={{ width: PLOT, height: PLOT, borderRadius: 10 }} />
            <svg viewBox="0 0 320 320" width={PLOT} height={PLOT} style={{ position: "absolute", inset: 0 }} role="img" aria-label="Data points over decision boundary">
              {dataset.train.map((s, i) => (
                <circle key={`tr${i}`} cx={(s.x1 + 1) * 160} cy={(1 - s.x2) * 160} r={4} fill={s.label === 1 ? "var(--blue)" : "var(--amber-deep)"} stroke="#fff" strokeWidth={1.2} />
              ))}
              {showTest &&
                dataset.test.map((s, i) => (
                  <circle key={`te${i}`} cx={(s.x1 + 1) * 160} cy={(1 - s.x2) * 160} r={4} fill="none" stroke={s.label === 1 ? "var(--blue)" : "var(--amber-deep)"} strokeWidth={2} />
                ))}
            </svg>
          </div>
          <p className="hintText" style={{ marginTop: 8, fontSize: 12.5 }}>
            filled = training points, hollow = test points. Background = the network's current
            opinion.
          </p>
        </div>

        {/* right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {/* architecture diagram */}
          <div className="vizStage" style={{ padding: "10px 14px" }}>
            <svg viewBox="0 0 320 90" width="100%" role="img" aria-label="Network architecture">
              {sizes.map((n, li) => {
                const x = 24 + (li * 272) / (sizes.length - 1);
                return Array.from({ length: n }, (_, ni) => {
                  const y = 45 + (ni - (n - 1) / 2) * (72 / Math.max(n, 2));
                  return (
                    <g key={`${li}-${ni}`}>
                      {li < sizes.length - 1 &&
                        Array.from({ length: sizes[li + 1] }, (_, nj) => {
                          const x2 = 24 + ((li + 1) * 272) / (sizes.length - 1);
                          const y2 = 45 + (nj - (sizes[li + 1] - 1) / 2) * (72 / Math.max(sizes[li + 1], 2));
                          return <line key={nj} x1={x} y1={y} x2={x2} y2={y2} stroke="var(--line)" strokeWidth={0.8} />;
                        })}
                      <circle cx={x} cy={y} r={6.5} fill={li === 0 ? "var(--amber-deep)" : li === sizes.length - 1 ? "var(--green)" : "var(--blue)"} />
                    </g>
                  );
                });
              })}
            </svg>
            <p className="hintText" style={{ fontSize: 12.5 }}>
              {sizes.join(" → ")} · {params} adjustable parameters (weights and biases)
            </p>
          </div>

          {/* metrics + curves */}
          <div className="controlRow">
            <span className="statPill">epoch <span className="statValue">{epoch}</span></span>
            <span className="statPill">train acc <span className="statValue">{(metrics.trainAcc * 100).toFixed(0)}%</span></span>
            <span className="statPill">test acc <span className="statValue">{(metrics.testAcc * 100).toFixed(0)}%</span></span>
            <span className="statPill">train loss <span className="statValue">{metrics.trainLoss.toFixed(3)}</span></span>
            <span className="statPill">test loss <span className="statValue">{metrics.testLoss.toFixed(3)}</span></span>
          </div>
          <MiniChart
            series={[
              { label: "train loss", color: "var(--blue)", values: history.trainLoss },
              { label: "test loss", color: "var(--violet)", values: history.testLoss }
            ]}
            yLabel="loss"
            height={120}
          />

          {diverged && (
            <p className="warnText">💥 Training exploded (numbers became infinite). Lower the learning rate and reset the weights.</p>
          )}

          <div className="controlRow">
            <button className="btn accent" onClick={() => setRunning((r) => !r)} disabled={diverged}>
              {running ? "⏸ Pause" : "▶ Train"}
            </button>
            <button className="btn primary small" onClick={() => doSteps(1)} disabled={running || diverged}>
              👣 Step
            </button>
            <button className="btn subtle small" onClick={() => rebuild(true)}>
              🎲 Reset weights
            </button>
            <button className="btn subtle small" onClick={() => setShowTest((s) => !s)}>
              {showTest ? "Hide test points" : "Show test points"}
            </button>
          </div>

          {hidden === 0 && (
            <p className="hintText">
              With zero hidden layers the model is basically one adjustable boundary. It can
              separate some datasets, but not XOR, circles, or spirals.
            </p>
          )}
        </div>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          { id: "line", title: "The line", goal: "Solve 'Two groups' with the smallest model. Goal: 95% test accuracy. Try zero hidden layers!", done: (bestByDataset["linear"] ?? 0) >= 0.95 },
          { id: "xor", title: "XOR", goal: "Can one neuron solve XOR? Then add hidden neurons. Goal: 95% test accuracy with few parameters.", done: (bestByDataset["xor"] ?? 0) >= 0.95 },
          { id: "circle", title: "Circle", goal: "Separate inside from outside. Goal: 95% test accuracy.", done: (bestByDataset["circle"] ?? 0) >= 0.95 },
          { id: "spiral", title: "Spiral boss fight", goal: "Solve the spiral with the smallest network you can. High TEST accuracy, not just training.", done: (bestByDataset["spiral"] ?? 0) >= 0.9 },
          { id: "unstable", title: "Make training fail", goal: "Pick a learning rate or architecture that makes training unstable. What went wrong?", done: diverged },
          { id: "noisy", title: "Noisy data", goal: "On the noisy spiral, find a model that generalizes instead of memorizing noise. Watch the gap between train and test." }
        ]}
      />

      <hr className="divider" />
      <div className="panelTitle">💰 Parameter Budget Challenge</div>
      <p className="hintText" style={{ marginBottom: 10 }}>
        Your goal is not to build the biggest network. Your goal is to solve the task with a small
        enough network. Can you do more with less? Current architecture:{" "}
        <strong>{params} parameters</strong>.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
        {budgetChallenges.map((c) => {
          const st = budgetStatus(c);
          const ds = classificationDatasets.find((d) => d.id === c.datasetId)!;
          return (
            <div
              key={c.id}
              style={{
                background: st.tone === "ok" ? "var(--green-soft)" : "var(--paper-2)",
                border: `1.5px solid ${st.tone === "ok" ? "var(--green)" : st.tone === "warn" ? "var(--red)" : "var(--line)"}`,
                borderRadius: 12,
                padding: "10px 14px"
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 14 }}>
                {ds.emoji} {c.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                {ds.label} · test accuracy ≥ {(c.accTarget * 100).toFixed(0)}% · budget ≤ {c.budget}{" "}
                parameters
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  marginTop: 6,
                  fontWeight: 700,
                  color: st.tone === "ok" ? "var(--green)" : st.tone === "warn" ? "var(--red)" : "var(--ink-faint)"
                }}
              >
                {st.text}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 4 }}>💡 {c.hint}</div>
            </div>
          );
        })}
      </div>
      <p className="hintText" style={{ marginTop: 10 }}>
        Parameters are adjustable knobs inside the model. More knobs can make the model more
        flexible, but the best model is often the smallest one that generalizes well.
      </p>

      <p className="hintText" style={{ marginTop: 12 }}>
        A hidden layer lets the network combine simple boundaries into more complex shapes. The
        network trains with gradient descent on all its parameters at once, exactly like the line
        in the previous modules, just with many more knobs.
      </p>
    </div>
  );
}
