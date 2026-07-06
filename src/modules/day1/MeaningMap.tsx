import { useEffect, useMemo, useRef, useState } from "react";
import generatedData from "../../content/generated/day1/m6_embeddings.json";
import type { GenM6, GenEmbeddingPoint, GenEmbeddingPuzzle } from "../../lib/generated";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const data = generatedData as GenM6;
const points = data.points;
const puzzles = data.puzzles;

const W = 1100;
const H = 620;
const BASE_SCALE = 56;
const FOCAL = 30;
const START_YAW = -0.5;
const START_PITCH = 0.3;

const CATEGORY_COLORS: Record<string, string> = {
  "royalty & people": "#7b5cd6",
  places: "#1d9e9e",
  "food & drink": "#d97e00",
  animals: "#8a6d1a",
  transport: "#3a7ca5",
  emotions: "#d64550",
  school: "#123c8c",
  technology: "#b0399f",
  "river & money": "#2c9c6a"
};

const center = {
  x: points.reduce((s, p) => s + p.x, 0) / points.length,
  y: points.reduce((s, p) => s + p.y, 0) / points.length,
  z: points.reduce((s, p) => s + p.z, 0) / points.length
};

type XYZ = { x: number; y: number; z: number };

function project(p: XYZ, yaw: number, pitch: number, zoom: number) {
  const cx = p.x - center.x;
  const cy = p.y - center.y;
  const cz = p.z - center.z;
  const x1 = cx * Math.cos(yaw) + cz * Math.sin(yaw);
  const z1 = -cx * Math.sin(yaw) + cz * Math.cos(yaw);
  const y2 = cy * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = cy * Math.sin(pitch) + z1 * Math.cos(pitch);
  const scale = (FOCAL / (FOCAL + z2)) * zoom;
  return {
    px: W / 2 + x1 * BASE_SCALE * scale,
    py: H / 2 - y2 * BASE_SCALE * scale,
    depth: z2,
    scale
  };
}

const byLabel = new Map(points.map((p) => [p.label, p]));

export default function MeaningMap({ onResult, resetSignal }: ModuleComponentProps) {
  const [yaw, setYaw] = useState(START_YAW);
  const [pitch, setPitch] = useState(START_PITCH);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hiddenCats, setHiddenCats] = useState<Set<string>>(new Set());
  const [puzzleIndex, setPuzzleIndex] = useState<number | null>(null);
  const [guess, setGuess] = useState<string | null>(null);
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const resetCamera = () => {
    setYaw(START_YAW);
    setPitch(START_PITCH);
    setZoom(1);
  };

  useEffect(() => {
    resetCamera();
    setSelected(null);
    setSearch("");
    setHiddenCats(new Set());
    setPuzzleIndex(null);
    setGuess(null);
  }, [resetSignal]);

  // Wheel zoom needs a non-passive listener so preventDefault works.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.max(0.5, Math.min(3.5, z * (e.deltaY < 0 ? 1.1 : 0.9))));
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const puzzle: GenEmbeddingPuzzle | null = puzzleIndex === null ? null : puzzles[puzzleIndex];

  const relevant = useMemo(() => {
    if (!puzzle) return null;
    const set = new Set<string>(puzzle.highlight?.filter((l) => byLabel.has(l)) ?? []);
    if (set.size === 0 && puzzle.kind === "analogy") {
      [puzzle.a, puzzle.b, puzzle.c].forEach((l) => l && set.add(l));
    }
    if (guess && byLabel.has(guess)) set.add(guess);
    return set.size > 0 ? set : null;
  }, [puzzle, guess]);

  const visible = useMemo(
    () => points.filter((p) => !hiddenCats.has(p.category)),
    [hiddenCats]
  );

  const projected = useMemo(() => {
    const list = visible.map((p) => ({ p, ...project(p, yaw, pitch, zoom) }));
    list.sort((a, b) => b.depth - a.depth);
    return list;
  }, [visible, yaw, pitch, zoom]);

  const projByLabel = useMemo(() => {
    const m = new Map<string, { px: number; py: number }>();
    projected.forEach((pr) => m.set(pr.p.label, { px: pr.px, py: pr.py }));
    return m;
  }, [projected]);

  const searchLower = search.trim().toLowerCase();
  const searchHits = searchLower
    ? visible.filter((p) => p.label.toLowerCase().includes(searchLower))
    : [];

  const selectedPoint = selected ? byLabel.get(selected) : null;

  const answerWith = (label: string) => {
    if (!puzzle || puzzle.kind === "explore") return;
    setGuess(label);
    onResult(
      `puzzle '${puzzle.id}': answered '${label}' (${label === puzzle.answer ? "correct" : "not quite"})`
    );
  };

  const clickPoint = (p: GenEmbeddingPoint) => {
    // Analogy: any clicked point is the student's answer. Question puzzles:
    // only clicking an actual option answers; other clicks open the neighbor
    // card (needed e.g. to inspect 'bank' in the ambiguity puzzle).
    if (puzzle && puzzle.kind === "analogy") {
      answerWith(p.label);
      return;
    }
    if (puzzle && puzzle.kind !== "explore" && puzzle.options?.includes(p.label)) {
      answerWith(p.label);
      return;
    }
    setSelected(p.label === selected ? null : p.label);
    onResult(`explored '${p.label}' (neighbors: ${p.neighbors.map((n) => n.label).join(", ")})`);
  };

  // Analogy "X - Y + Z": the relation is (X - Y), so the solid arrow runs
  // Y -> X, and the dashed ghost reuses that displacement from Z, landing on
  // Z + (X - Y), which is exactly the analogy target.
  const arrows = useMemo(() => {
    if (!puzzle || puzzle.kind !== "analogy") return null;
    const a = byLabel.get(puzzle.a!);
    const b = byLabel.get(puzzle.b!);
    const c = byLabel.get(puzzle.c!);
    if (!a || !b || !c) return null;
    const ghost: XYZ = { x: c.x + (a.x - b.x), y: c.y + (a.y - b.y), z: c.z + (a.z - b.z) };
    return {
      a1: project(b, yaw, pitch, zoom),
      a2: project(a, yaw, pitch, zoom),
      b1: project(c, yaw, pitch, zoom),
      b2: project(ghost, yaw, pitch, zoom)
    };
  }, [puzzle, yaw, pitch, zoom]);

  const startPuzzle = (i: number) => {
    setPuzzleIndex(i);
    setGuess(null);
    setSelected(null);
  };

  return (
    <div className="panel">
      {/* top bar */}
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔎 Search a word (try: bank)"
          aria-label="Search a word"
          style={{
            border: "1.5px solid var(--line)",
            borderRadius: 999,
            padding: "8px 15px",
            fontSize: 14.5,
            fontFamily: "inherit",
            minWidth: 200,
            background: "#fff"
          }}
        />
        <div className="controlRow">
          <button className="btn subtle small" onClick={() => setZoom((z) => Math.min(3.5, z * 1.25))}>
            ➕ Zoom in
          </button>
          <button className="btn subtle small" onClick={() => setZoom((z) => Math.max(0.5, z / 1.25))}>
            ➖ Zoom out
          </button>
          <button className="btn subtle small" onClick={resetCamera}>
            🧭 Reset view
          </button>
        </div>
      </div>

      <div className="meaningLayout">
        {/* the 3D map */}
        <div className="vizStage" style={{ position: "relative" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            role="img"
            aria-label="Rotatable, zoomable 3D map of word meanings"
            style={{ touchAction: "none", cursor: "grab", display: "block" }}
            onPointerDown={(e) => {
              dragRef.current = { x: e.clientX, y: e.clientY, moved: false };
              (e.currentTarget as SVGSVGElement).setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={(e) => {
              const d = dragRef.current;
              if (!d) return;
              const dx = e.clientX - d.x;
              const dy = e.clientY - d.y;
              if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
              if (d.moved) {
                setYaw((v) => v + dx * 0.008);
                setPitch((v) => Math.max(-1.3, Math.min(1.3, v + dy * 0.008)));
              }
              d.x = e.clientX;
              d.y = e.clientY;
            }}
            onPointerUp={(e) => {
              // Pointer capture retargets click events to the svg, so point
              // selection is done here by hit-testing the projected points.
              const wasDrag = dragRef.current?.moved;
              dragRef.current = null;
              if (wasDrag) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const px = ((e.clientX - rect.left) / rect.width) * W;
              const py = ((e.clientY - rect.top) / rect.height) * H;
              let best: { p: GenEmbeddingPoint; d: number } | null = null;
              for (const pr of projected) {
                const d = Math.hypot(pr.px - px, pr.py - py);
                if (d < 26 && (!best || d < best.d)) best = { p: pr.p, d };
              }
              if (best) clickPoint(best.p);
              else if (!puzzle) setSelected(null);
            }}
            onPointerLeave={() => (dragRef.current = null)}
          >
            {/* analogy arrows (drawn under the points) */}
            {arrows && (
              <>
                <defs>
                  <marker id="anaArrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
                    <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--violet)" />
                  </marker>
                </defs>
                <line
                  x1={arrows.a1.px} y1={arrows.a1.py} x2={arrows.a2.px} y2={arrows.a2.py}
                  stroke="var(--violet)" strokeWidth={3.5} markerEnd="url(#anaArrow)"
                />
                <line
                  x1={arrows.b1.px} y1={arrows.b1.py} x2={arrows.b2.px} y2={arrows.b2.py}
                  stroke="var(--violet)" strokeWidth={3.5} strokeDasharray="7 6"
                  markerEnd="url(#anaArrow)" opacity={0.75}
                />
                <text x={arrows.b2.px + 10} y={arrows.b2.py} fontSize={22} fontWeight={900} fill="var(--violet)">
                  ?
                </text>
              </>
            )}

            {/* neighbor links (selection is possible outside puzzles and
                during question/explore puzzles) */}
            {selectedPoint &&
              selectedPoint.neighbors.map((n) => {
                const a = projByLabel.get(selectedPoint.label);
                const b = projByLabel.get(n.label);
                if (!a || !b) return null;
                return (
                  <line
                    key={n.label}
                    x1={a.px} y1={a.py} x2={b.px} y2={b.py}
                    stroke="var(--amber-deep)" strokeWidth={2} strokeDasharray="4 4" opacity={0.8}
                  />
                );
              })}

            {/* points, far to near */}
            {projected.map(({ p, px, py, scale }) => {
              const isSel = selected === p.label;
              const isHit = searchHits.some((h) => h.label === p.label);
              const isNb = selectedPoint?.neighbors.some((n) => n.label === p.label) ?? false;
              const isRel = relevant ? relevant.has(p.label) : true;
              // Puzzles dim mildly (0.45) so every point stays visible and
              // clickable, including the answer; search/selection dim harder.
              const puzzleDim = puzzle && relevant && !isRel;
              const hardDim =
                (searchLower && !isHit) ||
                (selectedPoint && !isSel && !isNb && !searchLower && !puzzle);
              const r = (isSel || isHit ? 8 : 5) * scale;
              const guessed = guess === p.label;
              return (
                <g
                  key={p.label}
                  style={{ cursor: "pointer", pointerEvents: "none" }}
                  opacity={hardDim ? 0.15 : puzzleDim ? 0.45 : Math.min(0.55 + scale * 0.45, 1)}
                >
                  <circle
                    cx={px} cy={py} r={r}
                    fill={CATEGORY_COLORS[p.category] ?? "var(--ink-soft)"}
                    stroke={isSel || isHit || guessed ? "var(--amber-deep)" : "#fff"}
                    strokeWidth={isSel || isHit || guessed ? 3 : 1.2}
                  />
                  <text
                    x={px} y={py - r - 5}
                    textAnchor="middle"
                    fontSize={(isSel || isHit ? 14.5 : 11.5) * Math.min(Math.max(scale, 0.85), 1.4)}
                    fontWeight={isSel || isHit || (puzzle ? isRel : false) ? 800 : 600}
                    fill="var(--ink)"
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* floating neighbor card */}
          {selectedPoint && (
            <div
              className="fadeIn"
              style={{
                position: "absolute", top: 12, right: 12,
                background: "#fff", border: "1px solid var(--line)", borderRadius: 12,
                boxShadow: "var(--shadow)", padding: "12px 16px", maxWidth: 235, fontSize: 14
              }}
            >
              <strong style={{ fontSize: 16 }}>{selectedPoint.label}</strong>
              <div className="hintText" style={{ fontSize: 12.5, marginTop: 2 }}>
                {selectedPoint.category}
              </div>
              <div style={{ marginTop: 8, fontWeight: 700, fontSize: 12.5, color: "var(--ink-faint)" }}>
                NEAREST NEIGHBORS (real vectors)
              </div>
              {selectedPoint.neighbors.map((n) => (
                <div key={n.label} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <button
                    onClick={() => setSelected(n.label)}
                    style={{ border: "none", background: "none", padding: 0, color: "var(--blue)", fontWeight: 700, fontSize: 14 }}
                  >
                    {n.label}
                  </button>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)", fontSize: 12.5 }}>
                    {n.similarity.toFixed(2)}
                  </span>
                </div>
              ))}
              <button className="btn subtle small" style={{ marginTop: 8 }} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          )}

          {!selectedPoint && !puzzle && (
            <div style={{ position: "absolute", bottom: 10, left: 14, fontSize: 12.5, color: "var(--ink-faint)", fontWeight: 600 }}>
              🖐 drag to rotate · scroll to zoom · click a point
            </div>
          )}
        </div>

        {/* puzzle side panel */}
        <aside className="puzzlePanel">
          <div className="panelTitle">Puzzles</div>
          {puzzle === null ? (
            <>
              <p className="hintText" style={{ marginBottom: 10 }}>
                Five kinds of puzzle, answered by clicking the map or the choices.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {puzzles.map((pz, i) => (
                  <button key={pz.id} className="btn ghost small" style={{ justifyContent: "flex-start" }} onClick={() => startPuzzle(i)}>
                    🧩 {i + 1}. {pz.kind}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="fadeIn">
              <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span className="statPill">
                  🧩 <span className="statValue">{puzzleIndex! + 1}</span> / {puzzles.length}
                </span>
                <div className="controlRow" style={{ gap: 6 }}>
                  <button
                    className="btn subtle small"
                    disabled={puzzleIndex === 0}
                    onClick={() => startPuzzle(puzzleIndex! - 1)}
                  >
                    ←
                  </button>
                  <button
                    className="btn subtle small"
                    disabled={puzzleIndex === puzzles.length - 1}
                    onClick={() => startPuzzle(puzzleIndex! + 1)}
                  >
                    →
                  </button>
                </div>
              </div>
              <p style={{ fontWeight: 700, fontSize: 15.5 }}>{puzzle.prompt}</p>
              {puzzle.kind === "analogy" && (
                <p className="hintText" style={{ marginTop: 6 }}>
                  The solid arrow shows {puzzle.a} − {puzzle.b}. Follow the dashed copy from{" "}
                  {puzzle.c} and click the point where it lands.
                </p>
              )}
              {puzzle.options && (
                <div className="controlRow" style={{ marginTop: 10 }}>
                  {puzzle.options.map((o) => (
                    <button
                      key={o}
                      className={"choiceChip" + (guess === o ? " selected" : "")}
                      style={{ fontSize: 14, padding: "6px 13px" }}
                      onClick={() => answerWith(o)}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
              {puzzle.kind === "explore" && (
                <p className="hintText" style={{ marginTop: 8 }}>
                  No right answer here: click around and compare notes with your group.
                </p>
              )}
              {guess && puzzle.kind !== "explore" && (
                <div className="revealBox" style={{ marginTop: 10, fontSize: 14 }}>
                  {guess === puzzle.answer ? (
                    <strong>✅ {puzzle.answer}! {puzzle.explanation}</strong>
                  ) : (
                    <span>🤔 You picked '{guess}'. Look at the dimmed map and try again.</span>
                  )}
                </div>
              )}
              <div className="controlRow" style={{ marginTop: 10 }}>
                <button className="btn subtle small" onClick={() => setPuzzleIndex(null)}>
                  Exit puzzles
                </button>
              </div>
            </div>
          )}

          <hr className="divider" />
          <div className="legendRow" style={{ marginTop: 0 }}>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <button
                key={cat}
                className={"legendChip" + (hiddenCats.has(cat) ? "" : " active")}
                style={{ color, fontSize: 12 }}
                onClick={() =>
                  setHiddenCats((prev) => {
                    const next = new Set(prev);
                    if (next.has(cat)) next.delete(cat);
                    else next.add(cat);
                    return next;
                  })
                }
              >
                ● {cat}
              </button>
            ))}
          </div>
        </aside>
      </div>

      <p className="hintText" style={{ marginTop: 12 }}>
        These are REAL word embeddings ({data.model}), reduced to 3D for display. Neighbors and
        puzzle answers are computed from the full 100-dimensional vectors.
      </p>
    </div>
  );
}
