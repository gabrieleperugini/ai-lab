import { useEffect, useMemo, useState } from "react";
import { regressionDatasets } from "../../content/learning-machines/regressionDatasets";
import { mse, bestFitLine } from "../../lib/learning/regression";
import { RegressionPlot } from "../../components/learning/RegressionPlot";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Slider } from "../../components/controls/Slider";
import { Segmented } from "../../components/controls/Segmented";
import type { ModuleComponentProps } from "../../lib/moduleProps";

export default function FitTheLine({ onResult, resetSignal }: ModuleComponentProps) {
  const [datasetId, setDatasetId] = useState(regressionDatasets[0].id);
  const [m, setM] = useState(0);
  const [b, setB] = useState(0);
  const [showErrors, setShowErrors] = useState(true);
  const [bestLoss, setBestLoss] = useState<number | null>(null);

  const dataset = regressionDatasets.find((d) => d.id === datasetId)!;
  const loss = useMemo(() => mse(dataset.points, m, b), [dataset, m, b]);
  const best = useMemo(() => bestFitLine(dataset.points), [dataset]);
  const bestPossible = useMemo(() => mse(dataset.points, best.m, best.b), [dataset, best]);

  useEffect(() => {
    setDatasetId(regressionDatasets[0].id);
    setM(0);
    setB(0);
    setShowErrors(true);
    setBestLoss(null);
  }, [resetSignal]);

  useEffect(() => {
    setBestLoss((prev) => (prev === null || loss < prev ? loss : prev));
  }, [loss]);

  useEffect(() => {
    onResult(`dataset '${dataset.id}': m=${m.toFixed(2)}, b=${b.toFixed(2)}, loss=${loss.toFixed(3)}`);
  }, [dataset, m, b, loss, onResult]);

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Dataset"
          options={regressionDatasets.map((d) => ({ value: d.id, label: d.label }))}
          value={datasetId}
          onChange={(id) => {
            setDatasetId(id);
            setBestLoss(null);
          }}
        />
        <span className="hintText">{dataset.description}</span>
      </div>

      <div className="vizStage" style={{ padding: 12 }}>
        <RegressionPlot points={dataset.points} line={{ m, b }} showErrors={showErrors} />
      </div>

      <div className="controlRow" style={{ marginTop: 14, alignItems: "flex-end" }}>
        <Slider label="Slope m" value={m} min={-3} max={3} step={0.05} onChange={setM} format={(v) => v.toFixed(2)} />
        <Slider label="Intercept b" value={b} min={-3} max={3} step={0.05} onChange={setB} format={(v) => v.toFixed(2)} />
      </div>

      <div className="controlRow" style={{ marginTop: 12 }}>
        <span className="statPill">
          loss (MSE) <span className="statValue">{loss.toFixed(3)}</span>
        </span>
        <span className="statPill">
          your best <span className="statValue">{bestLoss === null ? "-" : bestLoss.toFixed(3)}</span>
        </span>
        <button
          className="btn accent small"
          onClick={() => {
            setM(Math.max(-3, Math.min(3, best.m)));
            setB(Math.max(-3, Math.min(3, best.b)));
          }}
        >
          🤖 Let the computer find it
        </button>
        <button className="btn subtle small" onClick={() => setShowErrors((s) => !s)}>
          {showErrors ? "Hide errors" : "Show errors"}
        </button>
        <button
          className="btn subtle small"
          onClick={() => {
            setM(0);
            setB(0);
          }}
        >
          ↺ Reset line
        </button>
      </div>

      <p className="hintText" style={{ marginTop: 10 }}>
        The red segments are the model's mistakes. The loss is a score for how wrong the model is:
        lower is better. The best possible line here reaches {bestPossible.toFixed(3)}.
        {dataset.curved && " On this dataset even the best line stays bad: the model family is wrong."}
      </p>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "manual",
            title: "Manual fit",
            goal: "Get the loss below 0.20 by hand on the clean trend.",
            done: datasetId === "clean" && loss < 0.2
          },
          {
            id: "outlier",
            title: "Outlier trap",
            goal: "Switch to the outlier dataset. Can two strange points pull your line away from the other twenty?"
          },
          {
            id: "wrong-model",
            title: "Wrong model",
            goal: "Try the curved data. What is the best line unable to do, no matter the sliders?"
          }
        ]}
      />

    </div>
  );
}
