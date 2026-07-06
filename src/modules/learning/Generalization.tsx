import { useEffect, useMemo, useState } from "react";
import {
  generalizationPresets,
  samplePoints
} from "../../content/learning-machines/generalizationDatasets";
import { polyFit, polyMse, polyEval } from "../../lib/learning/regression";
import { RegressionPlot } from "../../components/learning/RegressionPlot";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import { Slider } from "../../components/controls/Slider";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const COMPLEXITY_LABEL = (deg: number) =>
  deg <= 1 ? "straight line" : deg <= 3 ? "gentle curve" : deg <= 7 ? "flexible curve" : "very wiggly curve";

export default function Generalization({ onResult, resetSignal }: ModuleComponentProps) {
  const [presetId, setPresetId] = useState(generalizationPresets[0].id);
  const preset = generalizationPresets.find((p) => p.id === presetId)!;
  const [degree, setDegree] = useState(3);
  const [noise, setNoise] = useState(preset.defaultNoise);
  const [trainSize, setTrainSize] = useState(preset.defaultTrainSize);
  const [showTest, setShowTest] = useState(true);
  const [beatIt, setBeatIt] = useState<{ deg: number; test: number } | null>(null);

  useEffect(() => {
    setPresetId(generalizationPresets[0].id);
    setDegree(3);
    setNoise(generalizationPresets[0].defaultNoise);
    setTrainSize(generalizationPresets[0].defaultTrainSize);
    setShowTest(true);
    setBeatIt(null);
  }, [resetSignal]);

  const train = useMemo(
    () => samplePoints(preset, trainSize, noise, 1),
    [preset, trainSize, noise]
  );
  const test = useMemo(() => samplePoints(preset, 40, noise, 2), [preset, noise]);

  const coeffs = useMemo(() => polyFit(train, degree), [train, degree]);
  const trainLoss = useMemo(() => polyMse(train, coeffs), [train, coeffs]);
  const testLoss = useMemo(() => polyMse(test, coeffs), [test, coeffs]);
  const gap = testLoss - trainLoss;

  useEffect(() => {
    setBeatIt((prev) => (prev === null || testLoss < prev.test ? { deg: degree, test: testLoss } : prev));
  }, [testLoss, degree]);

  useEffect(() => {
    onResult(
      `preset '${preset.id}', complexity ${degree} (${COMPLEXITY_LABEL(degree)}): train ${trainLoss.toFixed(3)}, test ${testLoss.toFixed(3)}`
    );
  }, [preset, degree, trainLoss, testLoss, onResult]);

  const overfitting = trainLoss < 0.05 && testLoss > 0.3 && testLoss > trainLoss * 6;

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Dataset"
          options={generalizationPresets.map((p) => ({ value: p.id, label: p.label }))}
          value={presetId}
          onChange={(id) => {
            const p = generalizationPresets.find((x) => x.id === id)!;
            setPresetId(id);
            setNoise(p.defaultNoise);
            setTrainSize(p.defaultTrainSize);
            setBeatIt(null);
          }}
        />
        <button className="btn subtle small" onClick={() => setShowTest((s) => !s)}>
          {showTest ? "Hide test points" : "Show test points"}
        </button>
      </div>

      <div className="vizStage" style={{ padding: 12 }}>
        <RegressionPlot
          points={train}
          testPoints={showTest ? test : undefined}
          curve={(x) => polyEval(coeffs, x)}
          yRange={2.2}
        />
      </div>
      <p className="hintText" style={{ marginTop: 8 }}>
        Filled dots: training examples (the model sees these). Hollow violet circles: test points
        (new, unseen data from the same source).
      </p>

      <div className="controlRow" style={{ marginTop: 12, alignItems: "flex-end" }}>
        <Slider
          label={`Model complexity: ${COMPLEXITY_LABEL(degree)}`}
          value={degree}
          min={1}
          max={12}
          step={1}
          onChange={setDegree}
          format={(v) => `${v}`}
          lowHint="rigid"
          highHint="wiggly"
        />
        <Slider
          label="Noise in the data"
          value={noise}
          min={0.05}
          max={0.6}
          step={0.05}
          onChange={setNoise}
          format={(v) => v.toFixed(2)}
        />
        <Slider
          label="Training examples"
          value={trainSize}
          min={6}
          max={60}
          step={2}
          onChange={setTrainSize}
          format={(v) => `${v}`}
        />
      </div>

      <div className="controlRow" style={{ marginTop: 12 }}>
        <span className="statPill">
          training loss <span className="statValue">{trainLoss.toFixed(3)}</span>
        </span>
        <span className="statPill">
          test loss <span className="statValue">{testLoss.toFixed(3)}</span>
        </span>
        <span className="statPill">
          gap <span className="statValue">{gap >= 0 ? "+" : ""}{gap.toFixed(3)}</span>
        </span>
        <span className="statPill">
          your best test <span className="statValue">{beatIt ? `${beatIt.test.toFixed(3)} (complexity ${beatIt.deg})` : "-"}</span>
        </span>
        {overfitting && <span className="warnText" style={{ padding: "4px 12px" }}>📸 memorizing, not learning!</span>}
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "win-test",
            title: "Win on test data",
            goal: "Find the complexity with the LOWEST test loss, not the lowest training loss."
          },
          {
            id: "disaster",
            title: "Overfitting disaster",
            goal: "On 'Few examples', make training loss almost zero while test loss becomes terrible (raise the noise if you need help).",
            done: presetId === "few" && overfitting
          },
          {
            id: "more-data",
            title: "More data helps",
            goal: "Raise the number of training examples. Does the best complexity change? Why?"
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        Perfect training accuracy is not always victory. The real test is new data.
      </p>
    </div>
  );
}
