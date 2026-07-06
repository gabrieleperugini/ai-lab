import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { kmeansDatasetIds, getClusterDataset } from "../../content/hidden-structure/clusterDatasets";
import { assign, updateCentroids, inertia, converged } from "../../lib/hidden/kmeans";
import type { P2 } from "../../lib/hidden/kmeans";
import { ClusterPlot } from "../../components/hidden/ClusterPlot";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import { makeRng } from "../../lib/learning/rng";
import type { ModuleComponentProps } from "../../lib/moduleProps";

export default function KMeansGame({ onResult, resetSignal }: ModuleComponentProps) {
  const [datasetId, setDatasetId] = useState(kmeansDatasetIds[0]);
  const [k, setK] = useState(3);
  const [centroids, setCentroids] = useState<P2[]>([]);
  const [trails, setTrails] = useState<P2[][]>([]);
  const [iteration, setIteration] = useState(0);
  const [running, setRunning] = useState(false);
  const [showLines, setShowLines] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [isConverged, setIsConverged] = useState(false);
  const [triedKs, setTriedKs] = useState<Set<number>>(new Set([3]));
  const dragIdx = useRef<number | null>(null);
  const seedRef = useRef(1);

  const dataset = getClusterDataset(datasetId);
  const points = dataset.points;

  const initCentroids = useCallback(
    (mode: "random" | "bad") => {
      seedRef.current += 1;
      const rng = makeRng(seedRef.current * 131);
      let next: P2[];
      if (mode === "bad") {
        // all centroids bunched in one corner
        next = Array.from({ length: k }, () => ({
          x: -0.85 + rng() * 0.15,
          y: -0.85 + rng() * 0.15
        }));
      } else {
        next = Array.from({ length: k }, () => points[Math.floor(rng() * points.length)]);
      }
      setCentroids(next);
      setTrails(next.map((c) => [c]));
      setIteration(0);
      setRunning(false);
      setIsConverged(false);
    },
    [k, points]
  );

  useEffect(() => {
    setDatasetId(kmeansDatasetIds[0]);
    setK(3);
    setShowLines(false);
    setShowTrails(true);
    setTriedKs(new Set([3]));
    seedRef.current = 1;
  }, [resetSignal]);

  // re-init when dataset or k changes
  useEffect(() => {
    initCentroids("random");
  }, [initCentroids, datasetId]);

  const assignment = useMemo(
    () => (centroids.length ? assign(points, centroids) : []),
    [points, centroids]
  );
  const cost = useMemo(
    () => (centroids.length ? inertia(points, assignment, centroids) : 0),
    [points, assignment, centroids]
  );

  const stepOnce = useCallback(() => {
    setCentroids((prev) => {
      const next = updateCentroids(points, assign(points, prev), prev);
      if (converged(prev, next)) {
        setIsConverged(true);
        setRunning(false);
      }
      setTrails((t) => t.map((trail, i) => [...trail.slice(-30), next[i]]));
      setIteration((it) => it + 1);
      return next;
    });
  }, [points]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(stepOnce, 550);
    return () => clearInterval(iv);
  }, [running, stepOnce]);

  useEffect(() => {
    onResult(
      `dataset '${dataset.id}', k=${k}, iteration ${iteration}, cluster cost ${cost.toFixed(2)}${isConverged ? " (settled)" : ""}`
    );
  }, [dataset, k, iteration, cost, isConverged, onResult]);

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Dataset"
          options={kmeansDatasetIds.map((id) => {
            const d = getClusterDataset(id);
            return { value: id, label: `${d.emoji} ${d.label}` };
          })}
          value={datasetId}
          onChange={setDatasetId}
        />
        <div className="controlRow">
          <span className="hintText">k =</span>
          <Segmented
            ariaLabel="Number of centers"
            options={[2, 3, 4, 5].map((v) => ({ value: v, label: `${v}` }))}
            value={k}
            onChange={(v) => {
              setK(v);
              setTriedKs((prev) => new Set(prev).add(v));
            }}
          />
        </div>
      </div>

      <div className="ctxGrid" style={{ gridTemplateColumns: "auto 1fr", alignItems: "start" }}>
        <div className="vizStage" style={{ padding: 10, width: 400 }}>
          <ClusterPlot
            points={points}
            assignment={assignment}
            centroids={centroids}
            showLines={showLines}
            trails={showTrails ? trails : undefined}
            onPointerDownCentroid={(i, e) => {
              dragIdx.current = i;
              (e.currentTarget as Element).setPointerCapture?.((e as React.PointerEvent).pointerId);
            }}
            onSvgPointerMove={(x, y) => {
              if (dragIdx.current === null) return;
              const i = dragIdx.current;
              setCentroids((prev) => prev.map((c, j) => (j === i ? { x, y } : c)));
              setIsConverged(false);
            }}
            onSvgPointerUp={() => (dragIdx.current = null)}
            ariaLabel="K-means playground: points and draggable centers"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div className="controlRow">
            <button className="btn primary" onClick={stepOnce} disabled={running}>
              👣 One step
            </button>
            <button className="btn accent" onClick={() => setRunning((r) => !r)}>
              {running ? "⏸ Pause" : "▶ Run"}
            </button>
            <button className="btn subtle small" onClick={() => initCentroids("random")}>
              🎲 New random centers
            </button>
            <button className="btn subtle small" onClick={() => initCentroids("bad")}>
              😈 Bad start
            </button>
          </div>
          <div className="controlRow">
            <button className="btn subtle small" onClick={() => setShowLines((s) => !s)}>
              {showLines ? "Hide assignment lines" : "Show assignment lines"}
            </button>
            <button className="btn subtle small" onClick={() => setShowTrails((s) => !s)}>
              {showTrails ? "Hide center trails" : "Show center trails"}
            </button>
          </div>
          <div className="controlRow">
            <span className="statPill">iteration <span className="statValue">{iteration}</span></span>
            <span className="statPill">total distance to centers <span className="statValue">{cost.toFixed(2)}</span></span>
            {isConverged && <span className="copiedFlash">⚖️ settled: centers stopped moving</span>}
          </div>
          <p className="hintText">
            One step = two moves: every point joins its closest center, then every center jumps to
            the average of its points. You can DRAG the centers before (or instead of) running.
            {dataset.id === "bridge" && " A human might see two groups and a bridge here. What does k-means see?"}
          </p>
          <div className="revealBox" style={{ fontSize: 14 }}>
            {dataset.description}
          </div>
        </div>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "right-k",
            title: "Find the right k",
            goal: "On the easy blobs, try k = 2, 3, 4, 5. Which one feels honest? What happens to the extra centers?",
            done: datasetId === "blobs" && triedKs.size >= 3
          },
          {
            id: "bad-start",
            title: "Beat the bad start",
            goal: "Press 'Bad start', run, and watch it settle badly. Now rescue it: drag a center or reroll.",
            done: false
          },
          {
            id: "outlier",
            title: "Outlier trap",
            goal: "On 'Outlier trouble' with k = 2 or 3, watch what the far-away point does to a center."
          },
          {
            id: "break-it",
            title: "Make k-means fail",
            goal: "Convinced you understand the mechanism? Head to the next module and break it properly."
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        K-means is simple and useful, but it looks for compact groups around centers.
      </p>
    </div>
  );
}
