import { useEffect, useMemo, useState } from "react";
import {
  analogyPuzzles,
  embeddingCategories,
  embeddingPoints
} from "../../content/day1-llm/embeddingDataset";
import type { EmbeddingPoint } from "../../content/day1-llm/embeddingDataset";
import { nearestNeighbors } from "../../lib/vectors";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const W = 860;
const H = 600;
const X_MIN = -7.6;
const X_MAX = 8.4;
const Y_MIN = -6.6;
const Y_MAX = 7.6;

const sx = (x: number) => ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 40) + 20;
const sy = (y: number) => H - (((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 40) + 20);
const invX = (px: number) => ((px - 20) / (W - 40)) * (X_MAX - X_MIN) + X_MIN;
const invY = (py: number) => ((H - py - 20) / (H - 40)) * (Y_MAX - Y_MIN) + Y_MIN;

function colorFor(p: EmbeddingPoint): string {
  for (const c of embeddingCategories) {
    if (p.tags.includes(c.tag)) return c.color;
  }
  return "var(--ink-soft)";
}

type CustomPoint = EmbeddingPoint & { custom: true };

export default function MeaningMap({ onResult, resetSignal }: ModuleComponentProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hiddenTags, setHiddenTags] = useState<Set<string>>(new Set());
  const [customPoints, setCustomPoints] = useState<CustomPoint[]>([]);
  const [newWord, setNewWord] = useState("gelato");
  const [placing, setPlacing] = useState(false);
  const [analogyIndex, setAnalogyIndex] = useState<number | null>(null);
  const [analogyGuess, setAnalogyGuess] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
    setSearch("");
    setHiddenTags(new Set());
    setCustomPoints([]);
    setNewWord("gelato");
    setPlacing(false);
    setAnalogyIndex(null);
    setAnalogyGuess(null);
  }, [resetSignal]);

  const allPoints: EmbeddingPoint[] = useMemo(
    () => [...embeddingPoints, ...customPoints],
    [customPoints]
  );

  const visible = useMemo(
    () =>
      allPoints.filter(
        (p) => !p.tags.some((t) => hiddenTags.has(t)) || (p as CustomPoint).custom
      ),
    [allPoints, hiddenTags]
  );

  const searchLower = search.trim().toLowerCase();
  const searchHits = searchLower
    ? visible.filter((p) => p.label.toLowerCase().includes(searchLower))
    : [];

  const selectedPoint = allPoints.find((p) => p.label === selected) ?? null;
  const neighbors = selectedPoint
    ? nearestNeighbors(selectedPoint, visible, 4, (p) => p.label === selectedPoint.label)
    : [];

  const analogy = analogyIndex !== null ? analogyPuzzles[analogyIndex] : null;
  const analogyPts = analogy
    ? {
        a: embeddingPoints.find((p) => p.label === analogy.a)!,
        b: embeddingPoints.find((p) => p.label === analogy.b)!,
        c: embeddingPoints.find((p) => p.label === analogy.c)!
      }
    : null;

  const clickPoint = (p: EmbeddingPoint) => {
    if (analogy) {
      setAnalogyGuess(p.label);
      onResult(
        `analogy ${analogy.a}:${analogy.b} = ${analogy.c}:? → guessed '${p.label}' (${
          p.label === analogy.answer ? "correct" : "not quite"
        })`
      );
      return;
    }
    setSelected(p.label === selected ? null : p.label);
    onResult(`explored '${p.label}' — neighbors: ${neighbors.map((n) => n.label).join(", ")}`);
  };

  const clickMap = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!placing || !newWord.trim()) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const point: CustomPoint = {
      label: newWord.trim(),
      x: Math.round(invX(px) * 10) / 10,
      y: Math.round(invY(py) * 10) / 10,
      tags: ["your words"],
      custom: true
    };
    setCustomPoints((prev) => [...prev.filter((q) => q.label !== point.label), point]);
    setPlacing(false);
    setSelected(point.label);
    onResult(`placed '${point.label}' at (${point.x}, ${point.y})`);
  };

  const toggleTag = (tag: string) => {
    setHiddenTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <div className="panel">
      <div className="controlRow" style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔎 Search a word (try: bank)"
          aria-label="Search a word"
          style={{
            border: "1.5px solid var(--line)",
            borderRadius: 999,
            padding: "9px 16px",
            fontSize: 15,
            fontFamily: "inherit",
            minWidth: 230,
            background: "#fff"
          }}
        />
        <span className="statPill">
          words on the map <span className="statValue">{visible.length}</span>
        </span>
        {selectedPoint && (
          <span className="statPill">
            nearest to <span className="statValue">{selectedPoint.label}</span>:{" "}
            {neighbors.map((n) => n.label).join(" · ")}
          </span>
        )}
      </div>

      <div className="vizStage">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          onClick={clickMap}
          style={{ cursor: placing ? "crosshair" : "default" }}
          role="img"
          aria-label="Map of word meanings as 2D points"
        >
          {/* faint star-map grid */}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={(W / 9) * (i + 0.5)}
              y1={0}
              x2={(W / 9) * (i + 0.5)}
              y2={H}
              stroke="var(--line)"
              strokeWidth={0.6}
              strokeDasharray="2 6"
            />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(H / 7) * (i + 0.5)}
              x2={W}
              y2={(H / 7) * (i + 0.5)}
              stroke="var(--line)"
              strokeWidth={0.6}
              strokeDasharray="2 6"
            />
          ))}

          {/* neighbor links */}
          {selectedPoint &&
            !analogy &&
            neighbors.map((n) => (
              <line
                key={n.label}
                x1={sx(selectedPoint.x)}
                y1={sy(selectedPoint.y)}
                x2={sx(n.x)}
                y2={sy(n.y)}
                stroke="var(--amber-deep)"
                strokeWidth={2}
                strokeDasharray="4 4"
                opacity={0.8}
              />
            ))}

          {/* analogy arrows */}
          {analogy && analogyPts && (
            <>
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="var(--violet)" />
                </marker>
              </defs>
              <line
                x1={sx(analogyPts.a.x)}
                y1={sy(analogyPts.a.y)}
                x2={sx(analogyPts.b.x)}
                y2={sy(analogyPts.b.y)}
                stroke="var(--violet)"
                strokeWidth={3}
                markerEnd="url(#arrowhead)"
              />
              <line
                x1={sx(analogyPts.c.x)}
                y1={sy(analogyPts.c.y)}
                x2={sx(analogyPts.c.x + (analogyPts.b.x - analogyPts.a.x))}
                y2={sy(analogyPts.c.y + (analogyPts.b.y - analogyPts.a.y))}
                stroke="var(--violet)"
                strokeWidth={3}
                strokeDasharray="6 5"
                markerEnd="url(#arrowhead)"
                opacity={0.6}
              />
            </>
          )}

          {/* points */}
          {visible.map((p) => {
            const isCustom = (p as CustomPoint).custom;
            const isSel = selected === p.label;
            const isHit = searchHits.some((h) => h.label === p.label);
            const isNeighbor = neighbors.some((n) => n.label === p.label);
            const dim =
              (searchLower && !isHit) ||
              (selectedPoint && !isSel && !isNeighbor && !searchLower && !analogy);
            const r = isSel ? 9 : isHit ? 8 : 5.5;
            return (
              <g
                key={p.label}
                style={{ cursor: "pointer", transition: "opacity 0.25s ease" }}
                opacity={dim ? 0.25 : 1}
                onClick={(e) => {
                  e.stopPropagation();
                  clickPoint(p);
                }}
              >
                <circle
                  cx={sx(p.x)}
                  cy={sy(p.y)}
                  r={r + 6}
                  fill="transparent"
                />
                <circle
                  cx={sx(p.x)}
                  cy={sy(p.y)}
                  r={r}
                  fill={isCustom ? "var(--red)" : colorFor(p)}
                  stroke={isSel || isHit ? "var(--amber-deep)" : "#fff"}
                  strokeWidth={isSel || isHit ? 3 : 1.5}
                />
                <text
                  x={sx(p.x)}
                  y={sy(p.y) - (r + 6)}
                  textAnchor="middle"
                  fontSize={isSel || isHit ? 15 : 12.5}
                  fontWeight={isSel || isHit || isCustom ? 800 : 600}
                  fill={isCustom ? "var(--red)" : "var(--ink)"}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {placing && (
        <p className="warnText" style={{ marginTop: 10 }}>
          🎯 Click anywhere on the map to place “{newWord.trim()}”. Discuss first: which cluster
          does it belong to?
        </p>
      )}

      <div className="legendRow">
        {embeddingCategories.map((c) => (
          <button
            key={c.tag}
            className={"legendChip" + (hiddenTags.has(c.tag) ? "" : " active")}
            style={{ color: c.color }}
            onClick={() => toggleTag(c.tag)}
            title={hiddenTags.has(c.tag) ? "Show this category" : "Hide this category"}
          >
            ● {c.label}
          </button>
        ))}
      </div>

      <hr className="divider" />

      <div className="controlRow">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          aria-label="New word to place"
          style={{
            border: "1.5px solid var(--line)",
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 15,
            fontFamily: "inherit",
            width: 160,
            background: "#fff"
          }}
        />
        <button className="btn primary small" onClick={() => setPlacing(true)} disabled={!newWord.trim()}>
          📍 Place this word on the map
        </button>
        <button
          className="btn ghost small"
          onClick={() => {
            const next = analogyIndex === null ? 0 : (analogyIndex + 1) % analogyPuzzles.length;
            setAnalogyIndex(next);
            setAnalogyGuess(null);
            setSelected(null);
          }}
        >
          🧩 {analogyIndex === null ? "Start analogy puzzle" : "Next puzzle"}
        </button>
        {analogy && (
          <button
            className="btn subtle small"
            onClick={() => {
              setAnalogyIndex(null);
              setAnalogyGuess(null);
            }}
          >
            Exit puzzle
          </button>
        )}
      </div>

      {analogy && (
        <div className="revealBox" style={{ marginTop: 14 }}>
          <strong>
            {analogy.a} is to {analogy.b} as {analogy.c} is to … ?
          </strong>{" "}
          Follow the dashed arrow and click the point where it lands.
          {analogyGuess && (
            <p style={{ marginTop: 8 }}>
              {analogyGuess === analogy.answer ? (
                <strong>✅ Yes! '{analogy.answer}'. The same arrow encodes the same relationship.</strong>
              ) : (
                <span>
                  🤔 You clicked '{analogyGuess}'. Hint: {analogy.hint}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      <p className="hintText" style={{ marginTop: 12 }}>
        This is a hand-made teaching map, not real embeddings — real models use hundreds of
        dimensions. The geometry idea, however, is exactly the same.
      </p>
    </div>
  );
}
