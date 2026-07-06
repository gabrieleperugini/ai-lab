import { useEffect, useMemo, useState } from "react";
import { spectralDatasetIds, getClusterDataset } from "../../content/hidden-structure/clusterDatasets";
import { knnGraph, components, spectralCluster } from "../../lib/hidden/spectral";
import type { SpectralResult } from "../../lib/hidden/spectral";
import { ClusterPlot } from "../../components/hidden/ClusterPlot";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import { Slider } from "../../components/controls/Slider";
import type { ModuleComponentProps } from "../../lib/moduleProps";

export default function SpectralSprings({ onResult, resetSignal }: ModuleComponentProps) {
  const [datasetId, setDatasetId] = useState(spectralDatasetIds[0]);
  const [knn, setKnn] = useState(6);
  const [sigma, setSigma] = useState(0.25);
  const [k, setK] = useState(2);
  const [showEdges, setShowEdges] = useState(true);
  const [result, setResult] = useState<SpectralResult | null>(null);
  const [solvedDatasets, setSolvedDatasets] = useState<Set<string>>(new Set());

  const dataset = getClusterDataset(datasetId);
  const points = dataset.points;

  useEffect(() => {
    setDatasetId(spectralDatasetIds[0]);
    setKnn(6);
    setSigma(0.25);
    setK(2);
    setShowEdges(true);
    setResult(null);
    setSolvedDatasets(new Set());
  }, [resetSignal]);

  // the neighbor graph updates live; the spectral run is on demand
  const edges = useMemo(() => knnGraph(points, knn, sigma), [points, knn, sigma]);
  const comps = useMemo(() => components(points.length, edges), [points, edges]);
  const nComponents = useMemo(() => new Set(comps).size, [comps]);
  const avgDegree = (2 * edges.length) / points.length;

  useEffect(() => {
    setResult(null); // stale after any control change
  }, [datasetId, knn, sigma, k]);

  const run = () => {
    const r = spectralCluster(points, edges, k);
    setResult(r);
  };

  /** Heuristic quality: agreement with the hidden two-group structure. */
  const agreement = useMemo(() => {
    if (!result || dataset.hiddenGroups !== 2 || k !== 2) return null;
    let same = 0;
    points.forEach((p, i) => {
      if ((result.clusters[i] === 0) === (p.group === 0)) same++;
    });
    const frac = same / points.length;
    return Math.max(frac, 1 - frac);
  }, [result, points, dataset, k]);

  useEffect(() => {
    if (agreement !== null && agreement >= 0.9) {
      setSolvedDatasets((prev) => new Set(prev).add(datasetId));
    }
  }, [agreement, datasetId]);

  const graphStatus =
    nComponents > k
      ? { text: `⚠️ Graph too fragmented: ${nComponents} separate pieces (target: ${k}). Add more springs.`, tone: "warn" }
      : nComponents === k
        ? { text: `✅ Graph has exactly ${k} connected pieces: springs hold each group together.`, tone: "ok" }
        : avgDegree > 14
          ? { text: "⚠️ Too many cross-links: everything is connected to everything.", tone: "warn" }
          : { text: "One connected piece: separation must come from the spectral map.", tone: "idle" };

  useEffect(() => {
    onResult(
      `dataset '${dataset.id}', kNN=${knn}, sigma=${sigma}, pieces=${nComponents}${agreement !== null ? `, match ${(agreement * 100).toFixed(0)}%` : ""}`
    );
  }, [dataset, knn, sigma, nComponents, agreement, onResult]);

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Dataset"
          options={spectralDatasetIds.map((id) => {
            const d = getClusterDataset(id);
            return { value: id, label: `${d.emoji} ${d.label}` };
          })}
          value={datasetId}
          onChange={setDatasetId}
        />
        <div className="controlRow">
          <span className="hintText">clusters =</span>
          <Segmented ariaLabel="Number of clusters" options={[2, 3].map((v) => ({ value: v, label: `${v}` }))} value={k} onChange={setK} />
          <button className="btn subtle small" onClick={() => setShowEdges((s) => !s)}>
            {showEdges ? "Hide springs" : "Show springs"}
          </button>
        </div>
      </div>

      <div className="ctxGrid" style={{ gridTemplateColumns: "1fr 1fr 1fr", alignItems: "start", gap: 12 }}>
        <div className="vizStage" style={{ padding: 10 }}>
          <div className="panelTitle" style={{ paddingLeft: 4 }}>1 · Original space</div>
          <ClusterPlot points={points} ariaLabel="Original dataset" />
        </div>
        <div className="vizStage" style={{ padding: 10 }}>
          <div className="panelTitle" style={{ paddingLeft: 4 }}>2 · Neighbor springs</div>
          <ClusterPlot
            points={points}
            edges={showEdges ? edges : undefined}
            assignment={result ? result.clusters : undefined}
            ariaLabel="Neighbor graph with springs"
          />
        </div>
        <div className="vizStage" style={{ padding: 10 }}>
          <div className="panelTitle" style={{ paddingLeft: 4 }}>3 · Spectral map</div>
          {result ? (
            <ClusterPlot points={result.embedding} assignment={result.clusters} ariaLabel="Spectral embedding" />
          ) : (
            <div style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-faint)", fontSize: 14, fontWeight: 600, textAlign: "center", padding: 20 }}>
              Press "Run spectral clustering" to unfold the graph into a new map.
            </div>
          )}
        </div>
      </div>

      <div className="controlRow" style={{ marginTop: 14, alignItems: "flex-end" }}>
        <Slider
          label="Springs per point (k nearest neighbors)"
          value={knn}
          min={2}
          max={15}
          step={1}
          onChange={setKnn}
          format={(v) => `${v}`}
          lowHint="few springs"
          highHint="many springs"
        />
        <Slider
          label="Spring reach (similarity width sigma)"
          value={sigma}
          min={0.05}
          max={0.6}
          step={0.05}
          onChange={setSigma}
          format={(v) => v.toFixed(2)}
        />
        <button className="btn accent" onClick={run}>
          🧮 Run spectral clustering
        </button>
      </div>

      <div className="controlRow" style={{ marginTop: 12 }}>
        <span className="statPill">springs <span className="statValue">{edges.length}</span></span>
        <span className="statPill">connected pieces <span className="statValue">{nComponents}</span></span>
        {agreement !== null && (
          <span className="statPill">
            match with hidden pattern <span className="statValue">{(agreement * 100).toFixed(0)}%</span>
          </span>
        )}
      </div>
      <p
        className="hintText"
        style={{ marginTop: 8, fontWeight: 700, color: graphStatus.tone === "warn" ? "var(--red)" : graphStatus.tone === "ok" ? "var(--green)" : "var(--ink-faint)" }}
      >
        {graphStatus.text}
        {agreement !== null && agreement >= 0.9 && " 🏆 Good separation in spectral space!"}
      </p>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "moons",
            title: "Separate the moons",
            goal: "Tune the springs so each moon holds together without touching the other, then run.",
            done: solvedDatasets.has("moons")
          },
          {
            id: "few",
            title: "Too few springs",
            goal: "Drop to 2 springs per point. How many pieces does the graph shatter into?",
            done: nComponents > 4
          },
          {
            id: "many",
            title: "Too many springs",
            goal: "Max out the springs. What happens when everything connects to everything?"
          },
          {
            id: "rings",
            title: "Rings problem",
            goal: "Solve the concentric circles. Which settings keep the ring from touching the core?",
            done: solvedDatasets.has("circles")
          },
          {
            id: "bridge",
            title: "Bridge problem",
            goal: "On the bridge dataset, do the springs walk across the bridge and merge the groups?"
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        The spring picture is an intuition: nearby points pull on each other. Spectral clustering
        turns the neighbor graph into a new map where connected structures become easier to
        separate. Some structure is local: if we build a graph of nearby points, clusters can
        appear even when they are not round blobs.
      </p>
    </div>
  );
}
