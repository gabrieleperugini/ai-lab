import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { breakDatasetIds, getClusterDataset } from "../../content/hidden-structure/clusterDatasets";
import { kmeansRun } from "../../lib/hidden/kmeans";
import { ClusterPlot } from "../../components/hidden/ClusterPlot";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import { makeRng } from "../../lib/learning/rng";
import type { ModuleComponentProps } from "../../lib/moduleProps";

type Phase = "predict" | "ran" | "revealed";

export default function BlobsBreak({ onResult, resetSignal }: ModuleComponentProps) {
  const [datasetId, setDatasetId] = useState(breakDatasetIds[0]);
  const [k, setK] = useState(2);
  const [phase, setPhase] = useState<Phase>("predict");
  const [prediction, setPrediction] = useState<"works" | "fails" | null>(null);
  const [assignment, setAssignment] = useState<number[] | null>(null);
  const [testedDatasets, setTestedDatasets] = useState<Set<string>>(new Set());
  const seedRef = useRef(1);

  const dataset = getClusterDataset(datasetId);
  const points = dataset.points;

  const resetFor = useCallback((id: string) => {
    setDatasetId(id);
    setPhase("predict");
    setPrediction(null);
    setAssignment(null);
    setK(getClusterDataset(id).hiddenGroups);
  }, []);

  useEffect(() => {
    resetFor(breakDatasetIds[0]);
    setTestedDatasets(new Set());
    seedRef.current = 1;
  }, [resetSignal, resetFor]);

  const runKmeans = () => {
    seedRef.current += 1;
    const rng = makeRng(seedRef.current * 313);
    const seeds = Array.from({ length: k }, () => points[Math.floor(rng() * points.length)]);
    setAssignment(kmeansRun(points, k, seeds));
    setPhase("ran");
    setTestedDatasets((prev) => new Set(prev).add(datasetId));
  };

  /** How well does the k-means result match the hidden human structure?
   * (best-case agreement over cluster relabelings, for 2 groups) */
  const agreement = useMemo(() => {
    if (!assignment || dataset.hiddenGroups !== 2 || k !== 2) return null;
    let same = 0;
    points.forEach((p, i) => {
      if ((assignment[i] === 0) === (p.group === 0)) same++;
    });
    const frac = same / points.length;
    return Math.max(frac, 1 - frac);
  }, [assignment, points, dataset, k]);

  const failed = agreement !== null && agreement < 0.9;

  useEffect(() => {
    onResult(
      `dataset '${dataset.id}', phase ${phase}${prediction ? `, predicted ${prediction}` : ""}${agreement !== null ? `, match with hidden pattern ${(agreement * 100).toFixed(0)}%` : ""}`
    );
  }, [dataset, phase, prediction, agreement, onResult]);

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Dataset"
          options={breakDatasetIds.map((id) => {
            const d = getClusterDataset(id);
            return { value: id, label: `${d.emoji} ${d.label}` };
          })}
          value={datasetId}
          onChange={resetFor}
        />
        <div className="controlRow">
          <span className="hintText">k =</span>
          <Segmented ariaLabel="Number of centers" options={[2, 3, 4].map((v) => ({ value: v, label: `${v}` }))} value={k} onChange={setK} />
        </div>
      </div>

      <div className="ctxGrid" style={{ gridTemplateColumns: "auto 1fr", alignItems: "start" }}>
        <div className="vizStage" style={{ padding: 10, width: 400 }}>
          <ClusterPlot
            points={points}
            assignment={
              phase === "revealed"
                ? points.map((p) => p.group)
                : assignment ?? undefined
            }
            ariaLabel="Dataset and clustering result"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {phase === "predict" && (
            <>
              <p style={{ fontWeight: 700, fontSize: 16 }}>
                Before running: will k-means find the pattern a human sees here?
              </p>
              <div className="controlRow">
                <button
                  className={"choiceChip" + (prediction === "works" ? " selected" : "")}
                  onClick={() => setPrediction("works")}
                >
                  🙂 It will work
                </button>
                <button
                  className={"choiceChip" + (prediction === "fails" ? " selected" : "")}
                  onClick={() => setPrediction("fails")}
                >
                  🤨 It will get confused
                </button>
              </div>
              <div className="controlRow">
                <button className="btn accent" onClick={runKmeans} disabled={prediction === null}>
                  ▶ Run k-means
                </button>
                {prediction === null && <span className="hintText">Commit to a prediction first!</span>}
              </div>
            </>
          )}

          {phase === "ran" && (
            <>
              <p style={{ fontWeight: 700, fontSize: 16 }}>
                That is what nearest-center thinking produces here.
              </p>
              {agreement !== null && (
                <span className="statPill">
                  match with the hidden pattern <span className="statValue">{(agreement * 100).toFixed(0)}%</span>
                </span>
              )}
              <div className="controlRow">
                <button className="btn primary" onClick={() => setPhase("revealed")}>
                  👁 Reveal the hidden pattern
                </button>
                <button className="btn subtle small" onClick={runKmeans}>
                  🎲 Run again (new start)
                </button>
              </div>
            </>
          )}

          {phase === "revealed" && (
            <>
              <p style={{ fontWeight: 700, fontSize: 16 }}>
                This is the structure a human would probably draw.
              </p>
              <div className="revealBox" style={{ fontSize: 14.5 }}>
                {failed || !dataset.blobby
                  ? "K-means had to split this with straight nearest-center boundaries, but the real groups are shaped by connection, not by closeness to a center. Why did nearest-centroid fail here?"
                  : "Here the groups really are compact blobs, so nearest-center thinking matches the human view."}
              </div>
              <div className="controlRow">
                <button className="btn subtle small" onClick={() => setPhase("ran")}>
                  ← Back to the k-means result
                </button>
                <button className="btn subtle small" onClick={() => resetFor(datasetId)}>
                  ↺ Try again
                </button>
              </div>
            </>
          )}

          <p className="hintText">
            Predicted: {prediction === null ? "nothing yet" : prediction === "works" ? "it will work" : "it will get confused"}
            {agreement !== null && phase !== "predict" && (
              <>
                {" "}· outcome: {failed ? "k-means missed the pattern" : "k-means matched it"}
                {prediction && ((prediction === "fails") === failed ? " · your prediction was right! 🎉" : " · surprised?")}
              </>
            )}
          </p>
        </div>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "tour",
            title: "Break it five ways",
            goal: "Test every dataset: predict, run, reveal. Which shapes confuse k-means the most?",
            done: testedDatasets.size >= 5
          },
          {
            id: "moons",
            title: "Moon mystery",
            goal: "On the two moons, where exactly does the boundary cut? Why there?"
          },
          {
            id: "density",
            title: "Density trap",
            goal: "On different densities, watch the big sparse cloud steal points... or lose them."
          },
          {
            id: "next",
            title: "A better idea",
            goal: "These groups are connected, not compact. The next module builds exactly that idea."
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        Different algorithms make different assumptions about what a cluster should look like.
      </p>
    </div>
  );
}
