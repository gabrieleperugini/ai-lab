import { useEffect, useMemo, useRef, useState } from "react";
import {
  regressionDatasets,
  twoHillsDataset
} from "../../content/learning-machines/regressionDatasets";
import {
  mse,
  bestFitLine,
  bumpMse,
  bumpPredict,
  bestBumpFit
} from "../../lib/learning/regression";
import { RegressionPlot } from "../../components/learning/RegressionPlot";
import { LossContour } from "../../components/learning/LossContour";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import { makeRng } from "../../lib/learning/rng";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const datasets = [...regressionDatasets, twoHillsDataset];

export default function LossLandscape({ onResult, resetSignal }: ModuleComponentProps) {
  const [datasetId, setDatasetId] = useState(datasets[0].id);
  const [m, setM] = useState(-2.2);
  const [b, setB] = useState(2.4);
  const [showBest, setShowBest] = useState(false);
  const [moves, setMoves] = useState(0);
  const [valleysSeen, setValleysSeen] = useState({ deep: false, shallow: false });
  const randRef = useRef(makeRng(Date.now() % 100000));

  const dataset = datasets.find((d) => d.id === datasetId)!;
  const isBump = dataset.model === "bump";

  const lossOf = useMemo(
    () =>
      isBump
        ? (mm: number, bb: number) => bumpMse(dataset.points, mm, bb)
        : (mm: number, bb: number) => mse(dataset.points, mm, bb),
    [dataset, isBump]
  );
  const loss = useMemo(() => lossOf(m, b), [lossOf, m, b]);
  const best = useMemo(
    () => (isBump ? bestBumpFit(dataset.points) : bestFitLine(dataset.points)),
    [dataset, isBump]
  );
  const bestLoss = useMemo(() => lossOf(best.m, best.b), [lossOf, best]);
  const inValley = loss < bestLoss * 1.35 + 0.02;
  // The two-hills landscape has a second, shallower valley around (1, 0.7).
  const inShallowValley = isBump && loss < 0.88 && b > 0.3 && m > 0;

  useEffect(() => {
    setDatasetId(datasets[0].id);
    setM(-2.2);
    setB(2.4);
    setShowBest(false);
    setMoves(0);
    setValleysSeen({ deep: false, shallow: false });
  }, [resetSignal]);

  useEffect(() => {
    if (!isBump) return;
    if (inValley) setValleysSeen((v) => (v.deep ? v : { ...v, deep: true }));
    if (inShallowValley) setValleysSeen((v) => (v.shallow ? v : { ...v, shallow: true }));
  }, [isBump, inValley, inShallowValley]);

  useEffect(() => {
    onResult(`dataset '${dataset.id}': (m=${m.toFixed(2)}, b=${b.toFixed(2)}), loss=${loss.toFixed(3)}, moves=${moves}`);
  }, [dataset, m, b, loss, moves, onResult]);

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Dataset"
          options={datasets.map((d) => ({ value: d.id, label: d.label }))}
          value={datasetId}
          onChange={(id) => {
            setDatasetId(id);
            setMoves(0);
            setShowBest(false);
            setValleysSeen({ deep: false, shallow: false });
          }}
        />
        <div className="controlRow">
          <button className="btn subtle small" onClick={() => setShowBest((s) => !s)}>
            {showBest ? "Hide best" : "★ Show best solution"}
          </button>
          <button
            className="btn subtle small"
            onClick={() => {
              setM(-3 + 6 * randRef.current());
              setB(-3 + 6 * randRef.current());
              setMoves(0);
            }}
          >
            🎲 Random start
          </button>
        </div>
      </div>

      <div className="ctxGrid" style={{ gridTemplateColumns: "1.1fr 1fr", alignItems: "start" }}>
        <div className="vizStage" style={{ padding: 12 }}>
          <div className="panelTitle" style={{ paddingLeft: 6 }}>The data and your current model</div>
          {isBump ? (
            <RegressionPlot points={dataset.points} curve={(x) => bumpPredict(m, b, x)} showErrors />
          ) : (
            <RegressionPlot points={dataset.points} line={{ m, b }} showErrors />
          )}
        </div>
        <div className="vizStage" style={{ padding: 12 }}>
          <div className="panelTitle" style={{ paddingLeft: 6 }}>
            Parameter space: every pixel is one possible {isBump ? "bump" : "line"}
          </div>
          <LossContour
            points={dataset.points}
            m={m}
            b={b}
            showBest={showBest}
            lossFn={isBump ? lossOf : undefined}
            bestPoint={isBump ? best : undefined}
            mLabel={isBump ? "height m" : "slope m"}
            bLabel={isBump ? "center b" : "intercept b"}
            onChange={(nm, nb) => {
              setM(nm);
              setB(nb);
              setMoves((v) => v + 1);
            }}
          />
        </div>
      </div>

      <div className="controlRow" style={{ marginTop: 12 }}>
        <span className="statPill">
          m <span className="statValue">{m.toFixed(2)}</span>
        </span>
        <span className="statPill">
          b <span className="statValue">{b.toFixed(2)}</span>
        </span>
        <span className="statPill">
          loss <span className="statValue">{loss.toFixed(3)}</span>
        </span>
        <span className="statPill">
          drags <span className="statValue">{moves}</span>
        </span>
        {inValley && <span className="copiedFlash">🏞 You are in the deepest valley!</span>}
        {inShallowValley && !inValley && (
          <span className="copiedFlash">⚠️ A valley... but is it THE valley?</span>
        )}
      </div>

      <p className="hintText" style={{ marginTop: 10 }}>
        {isBump
          ? "New model family for this dataset: a single movable bump with a height knob m and a center knob b. The data has TWO hills, so the landscape has two separate green valleys: one per hill. Only one of them is the best."
          : "Drag the blue dot on the map: green is the valley (low loss), orange is high ground. Each position of the dot IS a line on the left. The star is the best possible line."}
      </p>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "valley10",
            title: "Valley in 10",
            goal: "From a random start, reach the valley dragging fewer than 10 times.",
            done: inValley && moves > 0 && moves < 10
          },
          {
            id: "bad-on-purpose",
            title: "Sabotage",
            goal: "Move to the worst corner on purpose. What does the model on the left look like?"
          },
          {
            id: "compare",
            title: "Moving valleys",
            goal: "Compare the clean data and the outlier trap. How did the valley move? Who moved it?"
          },
          {
            id: "two-valleys",
            title: "Two valleys",
            goal: "On the Two hills dataset, visit BOTH green pockets. Look at the model in each: which hill did it grab, and which valley is deeper?",
            done: valleysSeen.deep && valleysSeen.shallow
          }
        ]}
      />
    </div>
  );
}
