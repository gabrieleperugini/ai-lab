import { useEffect, useMemo, useState } from "react";
import {
  biasPresets,
  testWorlds,
  trainSizes,
  noiseLevels,
  makeTrainingSet,
  makeTestSet
} from "../../content/learning-machines/dataDetective";
import type { ToyObject } from "../../content/learning-machines/dataDetective";
import {
  trainShortcutLearner,
  trainLinearLearner,
  toyAccuracy
} from "../../lib/learning/toyClassifier";
import type { ToyModel } from "../../lib/learning/toyClassifier";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import type { ModuleComponentProps } from "../../lib/moduleProps";

/** Small SVG card for one toy object. */
function ObjectCard({ o, predicted }: { o: ToyObject; predicted?: 0 | 1 }) {
  const fill = o.color === "blue" ? "var(--blue-mid)" : "var(--red)";
  const correct = predicted === undefined ? null : predicted === o.label;
  return (
    <div
      style={{
        background: "#fff",
        border: `2px solid ${correct === null ? "var(--line)" : correct ? "var(--green)" : "var(--red)"}`,
        borderRadius: 10,
        padding: 4,
        width: 54,
        textAlign: "center"
      }}
    >
      <svg viewBox="0 0 40 40" width={44} height={44} role="img" aria-label={`${o.color} ${o.shape}`}>
        {o.striped &&
          [6, 14, 22, 30, 38].map((y) => (
            <line key={y} x1={2} y1={y} x2={38} y2={y - 4} stroke="var(--ink-faint)" strokeWidth={1.4} />
          ))}
        {o.shape === "circle" && <circle cx={20} cy={20} r={12} fill={fill} />}
        {o.shape === "square" && <rect x={9} y={9} width={22} height={22} rx={2} fill={fill} />}
        {o.shape === "triangle" && <polygon points="20,7 33,32 7,32" fill={fill} />}
      </svg>
      <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--ink-soft)" }}>
        {o.label === 1 ? "A" : "B"}
        {predicted !== undefined && (
          <span style={{ color: correct ? "var(--green)" : "var(--red)" }}>
            {" "}
            → {predicted === 1 ? "A" : "B"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DataDetective({ onResult, resetSignal }: ModuleComponentProps) {
  const [biasId, setBiasId] = useState("strong");
  const [trainSize, setTrainSize] = useState(24);
  const [noiseId, setNoiseId] = useState("none");
  const [worldId, setWorldId] = useState("ordinary");
  const [learnerKind, setLearnerKind] = useState<"shortcut" | "linear">("shortcut");
  const [model, setModel] = useState<ToyModel | null>(null);
  const [fixedIt, setFixedIt] = useState(false);

  useEffect(() => {
    setBiasId("strong");
    setTrainSize(24);
    setNoiseId("none");
    setWorldId("ordinary");
    setLearnerKind("shortcut");
    setModel(null);
    setFixedIt(false);
  }, [resetSignal]);

  const noise = noiseLevels.find((n) => n.id === noiseId)!.p;
  const train = useMemo(
    () => makeTrainingSet(biasId, trainSize, noise, 42),
    [biasId, trainSize, noise]
  );
  const test = useMemo(() => makeTestSet(worldId, biasId, 77), [worldId, biasId]);
  const brokenTest = useMemo(() => makeTestSet("broken", biasId, 77), [biasId]);

  const trainModel = () => {
    const m = learnerKind === "shortcut" ? trainShortcutLearner(train) : trainLinearLearner(train);
    setModel(m);
    onResult(
      `bias '${biasId}', ${learnerKind} learner: ${m.descr}; broken-test acc ${(toyAccuracy(m, brokenTest) * 100).toFixed(0)}%`
    );
  };

  // model becomes stale when the training data changes
  useEffect(() => {
    setModel(null);
  }, [train, learnerKind]);

  const trainAcc = model ? toyAccuracy(model, train) : null;
  const testAcc = model ? toyAccuracy(model, test) : null;
  const brokenAcc = model ? toyAccuracy(model, brokenTest) : null;

  useEffect(() => {
    if (brokenAcc !== null && brokenAcc >= 0.8) setFixedIt(true);
  }, [brokenAcc]);

  return (
    <div className="panel">
      <div className="controlRow" style={{ marginBottom: 12, justifyContent: "space-between" }}>
        <div className="controlRow">
          <span className="hintText">Shortcut strength</span>
          <Segmented
            ariaLabel="Bias strength"
            options={biasPresets.map((b) => ({ value: b.id, label: b.label }))}
            value={biasId}
            onChange={setBiasId}
          />
        </div>
        <div className="controlRow">
          <span className="hintText">Examples</span>
          <Segmented ariaLabel="Training size" options={trainSizes.map((s) => ({ value: s, label: `${s}` }))} value={trainSize} onChange={setTrainSize} />
          <span className="hintText">Label noise</span>
          <Segmented ariaLabel="Label noise" options={noiseLevels.map((n) => ({ value: n.id, label: n.label }))} value={noiseId} onChange={setNoiseId} />
        </div>
      </div>

      <div className="vizStage" style={{ padding: 14 }}>
        <div className="panelTitle">
          Training world · true rule: Class A = round objects. Tempting shortcut: color.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {train.slice(0, 24).map((o, i) => (
            <ObjectCard key={i} o={o} predicted={model ? model.predict(o) : undefined} />
          ))}
          {train.length > 24 && <span className="hintText">…and {train.length - 24} more</span>}
        </div>
      </div>

      <div className="controlRow" style={{ marginTop: 12 }}>
        <Segmented
          ariaLabel="Learner"
          options={[
            { value: "shortcut", label: "Lazy learner (one feature)" },
            { value: "linear", label: "Linear model (all features)" }
          ]}
          value={learnerKind}
          onChange={(v) => setLearnerKind(v as "shortcut" | "linear")}
        />
        <button className="btn accent" onClick={trainModel}>
          🎓 Train the model
        </button>
        {model && <span className="hintText">Trained: the model {model.descr}.</span>}
      </div>

      {model && (
        <>
          <div className="ctxGrid" style={{ marginTop: 14, alignItems: "start" }}>
            <div className="vizStage" style={{ padding: 14 }}>
              <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span className="panelTitle" style={{ marginBottom: 0 }}>Test world</span>
                <Segmented
                  ariaLabel="Test world"
                  options={testWorlds.map((w) => ({ value: w.id, label: w.label }))}
                  value={worldId}
                  onChange={setWorldId}
                />
              </div>
              <p className="hintText" style={{ marginBottom: 8 }}>
                {testWorlds.find((w) => w.id === worldId)!.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {test.slice(0, 16).map((o, i) => (
                  <ObjectCard key={i} o={o} predicted={model.predict(o)} />
                ))}
              </div>
            </div>

            <div className="vizStage" style={{ padding: 14 }}>
              <div className="panelTitle">What is the model relying on?</div>
              {(["shape", "color", "background"] as const).map((f) => (
                <div key={f} className="probRow" style={{ gridTemplateColumns: "90px 1fr 52px" }}>
                  <span className="probLabel">{f}</span>
                  <div className="probTrack">
                    <div
                      className={"probFill" + (f === "shape" ? " picked" : "")}
                      style={{ width: `${model.reliance[f] * 100}%` }}
                    />
                  </div>
                  <span className="probValue">{(model.reliance[f] * 100).toFixed(0)}%</span>
                </div>
              ))}
              <p className="hintText" style={{ marginTop: 10 }}>
                Green bar = the intended feature (shape). The lazy learner is a simplified model
                that picks a single feature; the linear model shows its weight shares.
              </p>
              <hr className="divider" />
              <div className="controlRow">
                <span className="statPill">train <span className="statValue">{(trainAcc! * 100).toFixed(0)}%</span></span>
                <span className="statPill">this test <span className="statValue">{(testAcc! * 100).toFixed(0)}%</span></span>
                <span className="statPill">shortcut broken <span className="statValue">{(brokenAcc! * 100).toFixed(0)}%</span></span>
              </div>
            </div>
          </div>
        </>
      )}

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "spot",
            title: "Spot the shortcut",
            goal: "With the strong or extreme shortcut, train and check the 'shortcut broken' test. High training score, low real score?",
            done: model !== null && (biasId === "strong" || biasId === "extreme") && trainAcc !== null && trainAcc >= 0.85 && brokenAcc !== null && brokenAcc < 0.7
          },
          {
            id: "fix",
            title: "Fix the dataset",
            goal: "Change the DATA (not the model) so the shortcut-broken accuracy reaches 80%.",
            done: fixedIt
          },
          {
            id: "bad-labels",
            title: "Bad labels",
            goal: "Add label noise. What happens to the model's reliability, even on training data?"
          },
          {
            id: "shift",
            title: "Distribution shift",
            goal: "Compare 'ordinary test' and 'colors swapped'. Same model, very different scores. Why?"
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        A model learns from the data it sees. If the data contains shortcuts, the model may learn
        the shortcut instead of the idea we had in mind. Good training data is part of the
        algorithm.
      </p>
    </div>
  );
}
