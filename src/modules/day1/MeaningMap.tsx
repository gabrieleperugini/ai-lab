import { useEffect, useMemo, useRef, useState } from "react";
import {
  embeddingCategories,
  embeddingPoints,
  embeddingPuzzles
} from "../../content/day1-llm/embeddingDataset";
import type { EmbeddingPoint, EmbeddingPuzzle } from "../../content/day1-llm/embeddingDataset";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const W = 880;
const H = 520;
const SCALE = 34;
const FOCAL = 26;
const START_YAW = -0.45;
const START_PITCH = 0.32;

type Projected = { p: EmbeddingPoint; px: number; py: number; depth: number; scale: number };

function colorFor(p: EmbeddingPoint): string {
  for (const c of embeddingCategories) {
    if (p.tags.includes(c.tag)) return c.color;
  }
  return "var(--ink-soft)";
}

function dist3(a: EmbeddingPoint, b: EmbeddingPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/** Center of the cloud, so rotation pivots around the data, not the origin. */
const center = {
  x: embeddingPoints.reduce((s, p) => s + p.x, 0) / embeddingPoints.length,
  y: embeddingPoints.reduce((s, p) => s + p.y, 0) / embeddingPoints.length,
  z: embeddingPoints.reduce((s, p) => s + p.z, 0) / embeddingPoints.length
};

function project(p: EmbeddingPoint, yaw: number, pitch: number): Projected {
  const cx = p.x - center.x;
  const cy = p.y - center.y;
  const cz = p.z - center.z;
  // rotate around the vertical axis (yaw), then tilt (pitch)
  const x1 = cx * Math.cos(yaw) + cz * Math.sin(yaw);
  const z1 = -cx * Math.sin(yaw) + cz * Math.cos(yaw);
  const y2 = cy * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = cy * Math.sin(pitch) + z1 * Math.cos(pitch);
  const scale = FOCAL / (FOCAL + z2);
  return {
    p,
    px: W / 2 + x1 * SCALE * scale,
    py: H / 2 - y2 * SCALE * scale,
    depth: z2,
    scale
  };
}

export default function MeaningMap({ onResult, resetSignal }: ModuleComponentProps) {
  const [yaw, setYaw] = useState(START_YAW);
  const [pitch, setPitch] = useState(START_PITCH);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hiddenTags, setHiddenTags] = useState<Set<string>>(new Set());
  const [puzzleIndex, setPuzzleIndex] = useState<number | null>(null);
  const [puzzleGuess, setPuzzleGuess] = useState<string | null>(null);
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setYaw(START_YAW);
    setPitch(START_PITCH);
    setSelected(null);
    setSearch("");
    setHiddenTags(new Set());
    setPuzzleIndex(null);
    setPuzzleGuess(null);
  }, [resetSignal]);

  const puzzle: EmbeddingPuzzle | null = puzzleIndex === null ? null : embeddingPuzzles[puzzleIndex];

  const relevantLabels = useMemo(() => {
    if (!puzzle) return null;
    const set = new Set<string>();
    if (puzzle.kind === "analogy") {
      [puzzle.relationFrom, puzzle.relationTo, puzzle.start].forEach((l) => l && set.add(l));
    } else {
      (puzzle.options ?? []).forEach((l) => set.add(l));
      // include words mentioned in the prompt so the reference is visible
      embeddingPoints.forEach((p) => {
        if (puzzle.prompt.toLowerCase().includes(p.label.toLowerCase())) set.add(p.label);
      });
    }
    if (puzzleGuess) set.add(puzzleGuess);
    return set;
  }, [puzzle, puzzleGuess]);

  const visible = useMemo(
    () => embeddingPoints.filter((p) => !p.tags.some((t) => hiddenTags.has(t))),
    [hiddenTags]
  );

  const projected = useMemo(() => {
    const list = visible.map((p) => project(p, yaw, pitch));
    list.sort((a, b) => b.depth - a.depth); // far points first
    return list;
  }, [visible, yaw, pitch]);

  const byLabel = useMemo(() => {
    const m = new Map<string, Projected>();
    projected.forEach((pr) => m.set(pr.p.label, pr));
    return m;
  }, [projected]);

  const searchLower = search.trim().toLowerCase();
  const searchHits = searchLower
    ? visible.filter((p) => p.label.toLowerCase().includes(searchLower))
    : [];

  const selectedPoint = embeddingPoints.find((p) => p.label === selected) ?? null;
  const neighbors = selectedPoint
    ? visible
        .filter((p) => p.label !== selectedPoint.label)
        .map((p) => ({ p, d: dist3(selectedPoint, p) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 4)
    : [];

  const clickPoint = (p: EmbeddingPoint) => {
    if (puzzle) {
      setPuzzleGuess(p.label);
      onResult(
        `puzzle '${puzzle.id}': guessed '${p.label}' (${p.label === puzzle.answer ? "correct" : "not quite"})`
      );
      return;
    }
    setSelected(p.label === selected ? null : p.label);
    onResult(`explored '${p.label}'`);
  };

  // Analogy ghost arrow: start + (relationTo - relationFrom), projected live.
  const analogyArrows = useMemo(() => {
    if (!puzzle || puzzle.kind !== "analogy") return null;
    const from = embeddingPoints.find((p) => p.label === puzzle.relationFrom);
    const to = embeddingPoints.find((p) => p.label === puzzle.relationTo);
    const start = embeddingPoints.find((p) => p.label === puzzle.start);
    if (!from || !to || !start) return null;
    const ghostTarget: EmbeddingPoint = {
      label: "?",
      x: start.x + (to.x - from.x),
      y: start.y + (to.y - from.y),
      z: start.z + (to.z - from.z),
      tags: []
    };
    return {
      a1: project(from, yaw, pitch),
      a2: project(to, yaw, pitch),
      b1: project(start, yaw, pitch),
      b2: project(ghostTarget, yaw, pitch)
    };
  }, [puzzle, yaw, pitch]);

  const startPuzzle = (i: number) => {
    setPuzzleIndex(i);
    setPuzzleGuess(null);
    setSelected(null);
  };

  return (
    <div className="panel">
      {/* top bar: search, view controls, puzzles */}
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
            minWidth: 210,
            background: "#fff"
          }}
        />
        <div className="controlRow">
          {embeddingPuzzles.map((pz, i) => (
            <button
              key={pz.id}
              className={"btn small " + (puzzleIndex === i ? "accent" : "ghost")}
              onClick={() => (puzzleIndex === i ? setPuzzleIndex(null) : startPuzzle(i))}
            >
              🧩 {i + 1}
            </button>
          ))}
          <button
            className="btn subtle small"
            onClick={() => {
              setYaw(START_YAW);
              setPitch(START_PITCH);
            }}
          >
            🧭 Reset view
          </button>
        </div>
      </div>

      {/* the 3D map */}
      <div className="vizStage" style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label="Rotatable 3D map of word meanings"
          style={{ touchAction: "none", cursor: "grab" }}
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
            setYaw((v) => v + dx * 0.008);
            setPitch((v) => Math.max(-1.3, Math.min(1.3, v + dy * 0.008)));
            d.x = e.clientX;
            d.y = e.clientY;
          }}
          onPointerUp={() => (dragRef.current = null)}
          onPointerLeave={() => (dragRef.current = null)}
        >
          {/* ground shadow ellipse for depth reference */}
          <ellipse cx={W / 2} cy={H - 26} rx={W * 0.34} ry={14} fill="var(--paper-2)" />

          {/* analogy arrows */}
          {analogyArrows && (
            <>
              <defs>
                <marker id="anaArrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
                  <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--violet)" />
                </marker>
              </defs>
              <line
                x1={analogyArrows.a1.px}
                y1={analogyArrows.a1.py}
                x2={analogyArrows.a2.px}
                y2={analogyArrows.a2.py}
                stroke="var(--violet)"
                strokeWidth={3.5}
                markerEnd="url(#anaArrow)"
              />
              <line
                x1={analogyArrows.b1.px}
                y1={analogyArrows.b1.py}
                x2={analogyArrows.b2.px}
                y2={analogyArrows.b2.py}
                stroke="var(--violet)"
                strokeWidth={3.5}
                strokeDasharray="7 6"
                markerEnd="url(#anaArrow)"
                opacity={0.75}
              />
              <text
                x={analogyArrows.b2.px + 10}
                y={analogyArrows.b2.py}
                fontSize={20}
                fontWeight={900}
                fill="var(--violet)"
              >
                ?
              </text>
            </>
          )}

          {/* neighbor links */}
          {selectedPoint &&
            !puzzle &&
            byLabel.get(selectedPoint.label) &&
            neighbors.map(({ p }) => {
              const a = byLabel.get(selectedPoint.label)!;
              const b = byLabel.get(p.label);
              if (!b) return null;
              return (
                <line
                  key={p.label}
                  x1={a.px}
                  y1={a.py}
                  x2={b.px}
                  y2={b.py}
                  stroke="var(--amber-deep)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  opacity={0.8}
                />
              );
            })}

          {/* points, far to near */}
          {projected.map(({ p, px, py, scale }) => {
            const isSel = selected === p.label;
            const isHit = searchHits.some((h) => h.label === p.label);
            const isNeighbor = neighbors.some((n) => n.p.label === p.label);
            const isRelevant = relevantLabels ? relevantLabels.has(p.label) : true;
            const dimBySearch = searchLower && !isHit;
            const dimBySelect = selectedPoint && !isSel && !isNeighbor && !searchLower && !puzzle;
            const dimByPuzzle = puzzle && !isRelevant;
            const opacity = dimByPuzzle ? 0.14 : dimBySearch || dimBySelect ? 0.22 : 0.55 + scale * 0.45;
            const r = (isSel || isHit ? 8 : 5) * scale;
            const guessed = puzzleGuess === p.label;
            return (
              <g
                key={p.label}
                style={{ cursor: "pointer" }}
                opacity={Math.min(opacity, 1)}
                onClick={() => {
                  if (dragRef.current?.moved) return;
                  clickPoint(p);
                }}
              >
                <circle cx={px} cy={py} r={r + 7} fill="transparent" />
                <circle
                  cx={px}
                  cy={py}
                  r={r}
                  fill={colorFor(p)}
                  stroke={isSel || isHit || guessed ? "var(--amber-deep)" : "#fff"}
                  strokeWidth={isSel || isHit || guessed ? 3 : 1.2}
                />
                <text
                  x={px}
                  y={py - r - 5}
                  textAnchor="middle"
                  fontSize={(isSel || isHit ? 14.5 : 11.5) * Math.max(scale, 0.8)}
                  fontWeight={isSel || isHit || (puzzle ? isRelevant : false) ? 800 : 600}
                  fill="var(--ink)"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* floating neighbor card */}
        {selectedPoint && !puzzle && (
          <div
            className="fadeIn"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 12,
              boxShadow: "var(--shadow)",
              padding: "12px 16px",
              maxWidth: 240,
              fontSize: 14
            }}
          >
            <strong style={{ fontSize: 16 }}>{selectedPoint.label}</strong>
            <div className="hintText" style={{ fontSize: 12.5, marginTop: 2 }}>
              {selectedPoint.tags.join(" · ")}
            </div>
            <div style={{ marginTop: 8, fontWeight: 700, fontSize: 12.5, color: "var(--ink-faint)" }}>
              NEAREST NEIGHBORS
            </div>
            {neighbors.map(({ p, d }) => (
              <div key={p.label} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <button
                  onClick={() => setSelected(p.label)}
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    color: "var(--blue)",
                    fontWeight: 700,
                    fontSize: 14
                  }}
                >
                  {p.label}
                </button>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)", fontSize: 12.5 }}>
                  {d.toFixed(1)}
                </span>
              </div>
            ))}
            <button className="btn subtle small" style={{ marginTop: 8 }} onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        )}

        {/* drag hint */}
        {!selectedPoint && !puzzle && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 14,
              fontSize: 12.5,
              color: "var(--ink-faint)",
              fontWeight: 600
            }}
          >
            🖐 drag to rotate · click a point for neighbors
          </div>
        )}
      </div>

      {/* active puzzle card */}
      {puzzle && (
        <div className="revealBox fadeIn" style={{ marginTop: 12 }}>
          <strong>
            Puzzle {puzzleIndex! + 1} of {embeddingPuzzles.length}: {puzzle.prompt}
          </strong>
          {puzzle.kind === "analogy" ? (
            <p style={{ marginTop: 6, fontSize: 14.5 }}>
              Start at <strong>{puzzle.start}</strong>, apply the direction{" "}
              <strong>
                {puzzle.relationFrom} → {puzzle.relationTo}
              </strong>{" "}
              (the dashed arrow), then click the point where it lands.
            </p>
          ) : (
            <div className="controlRow" style={{ marginTop: 8 }}>
              {(puzzle.options ?? []).map((o) => (
                <button
                  key={o}
                  className={"choiceChip" + (puzzleGuess === o ? " selected" : "")}
                  style={{ fontSize: 14, padding: "6px 13px" }}
                  onClick={() => {
                    setPuzzleGuess(o);
                    onResult(
                      `puzzle '${puzzle.id}': guessed '${o}' (${o === puzzle.answer ? "correct" : "not quite"})`
                    );
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
          {puzzleGuess && (
            <p style={{ marginTop: 8 }}>
              {puzzleGuess === puzzle.answer ? (
                <strong>✅ Yes, {puzzle.answer}! {puzzle.explanation}</strong>
              ) : (
                <span>🤔 You picked '{puzzleGuess}'. Look again at the dimmed map and retry.</span>
              )}
            </p>
          )}
          <div className="controlRow" style={{ marginTop: 8 }}>
            {puzzleIndex! < embeddingPuzzles.length - 1 && (
              <button className="btn primary small" onClick={() => startPuzzle(puzzleIndex! + 1)}>
                Next puzzle →
              </button>
            )}
            <button className="btn subtle small" onClick={() => setPuzzleIndex(null)}>
              Exit puzzles
            </button>
          </div>
        </div>
      )}

      {/* category legend */}
      <div className="legendRow">
        {embeddingCategories.map((c) => (
          <button
            key={c.tag}
            className={"legendChip" + (hiddenTags.has(c.tag) ? "" : " active")}
            style={{ color: c.color }}
            onClick={() =>
              setHiddenTags((prev) => {
                const next = new Set(prev);
                if (next.has(c.tag)) next.delete(c.tag);
                else next.add(c.tag);
                return next;
              })
            }
            title={hiddenTags.has(c.tag) ? "Show this category" : "Hide this category"}
          >
            ● {c.label}
          </button>
        ))}
      </div>

      <p className="hintText" style={{ marginTop: 10 }}>
        This is a hand-made teaching map in 3 dimensions, not real embeddings. Real models use
        hundreds of dimensions; the geometry idea is exactly the same.
      </p>
    </div>
  );
}
