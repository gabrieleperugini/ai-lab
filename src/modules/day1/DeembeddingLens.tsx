import { useEffect, useMemo, useRef, useState } from "react";
import { deembeddingTokens, hiddenPresets } from "../../content/day1-llm/deembeddingExamples";
import { dot } from "../../lib/vectors";
import type { Vec2 } from "../../lib/vectors";
import { softmax } from "../../lib/sampling";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import { Slider } from "../../components/controls/Slider";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const W = 760;
const H = 480;
const RANGE_X = 8;
const RANGE_Y = 6.6;

const sx = (x: number) => ((x + RANGE_X) / (2 * RANGE_X)) * W;
const sy = (y: number) => H - ((y + RANGE_Y) / (2 * RANGE_Y)) * H;
const invX = (px: number) => (px / W) * 2 * RANGE_X - RANGE_X;
const invY = (py: number) => ((H - py) / H) * 2 * RANGE_Y - RANGE_Y;

/**
 * Token vectors are normalized to unit length for scoring, so a token's
 * alignment with the thought vector decides its score, not how far from the
 * origin it happens to be drawn. The thought vector is NOT normalized: a
 * longer arrow means a more confident state and sharper probabilities.
 */
const SCORE_SCALE = 1.0;

export default function DeembeddingLens({ onResult, resetSignal }: ModuleComponentProps) {
  const [hidden, setHidden] = useState<Vec2>(hiddenPresets[0].vector);
  const [presetLabel, setPresetLabel] = useState<string>(hiddenPresets[0].label);
  const [temperature, setTemperature] = useState(1.0);
  const [dragging, setDragging] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setHidden(hiddenPresets[0].vector);
    setPresetLabel(hiddenPresets[0].label);
    setTemperature(1.0);
  }, [resetSignal]);

  const probs = useMemo(() => {
    const scores = deembeddingTokens.map((t) => {
      const len = Math.hypot(t.x, t.y) || 1;
      return dot(hidden, { x: t.x / len, y: t.y / len }) * SCORE_SCALE;
    });
    const p = softmax(scores, temperature);
    const dist: Record<string, number> = {};
    deembeddingTokens.forEach((t, i) => (dist[t.label] = p[i]));
    return dist;
  }, [hidden, temperature]);

  const top = useMemo(() => Object.entries(probs).sort((a, b) => b[1] - a[1])[0], [probs]);

  useEffect(() => {
    onResult(
      `thought=(${hidden.x.toFixed(1)}, ${hidden.y.toFixed(1)}), T=${temperature.toFixed(1)}, top token '${top[0]}' (${(top[1] * 100).toFixed(0)}%)`
    );
  }, [hidden, temperature, top, onResult]);

  const moveTo = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    const py = ((clientY - rect.top) / rect.height) * H;
    const x = Math.max(-RANGE_X + 0.3, Math.min(RANGE_X - 0.3, invX(px)));
    const y = Math.max(-RANGE_Y + 0.3, Math.min(RANGE_Y - 0.3, invY(py)));
    setHidden({ x, y });
    setPresetLabel("custom");
  };

  const activePreset = hiddenPresets.find((p) => p.label === presetLabel);

  return (
    <div className="panel">
      <div className="controlRow" style={{ marginBottom: 12 }}>
        {hiddenPresets.map((p) => (
          <button
            key={p.label}
            className={"choiceChip" + (presetLabel === p.label ? " selected" : "")}
            style={{ fontSize: 13.5, padding: "6px 12px" }}
            onClick={() => {
              setHidden(p.vector);
              setPresetLabel(p.label);
            }}
            title={p.prompt}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="hintText" style={{ marginBottom: 10 }}>
        {activePreset ? (
          <>
            The model just read: <em>“{activePreset.prompt}”</em>. The blue arrow is its thought
            vector.
          </>
        ) : (
          <>Custom thought vector. Drag the arrow tip or click anywhere on the plane.</>
        )}
      </p>

      <div className="ctxGrid" style={{ gridTemplateColumns: "3fr 2fr", alignItems: "start" }}>
        <div className="vizStage" style={{ lineHeight: 0 }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            role="img"
            aria-label="Vector plane with draggable thought vector and word directions"
            style={{ touchAction: "none", cursor: dragging ? "grabbing" : "default" }}
            onPointerMove={(e) => dragging && moveTo(e.clientX, e.clientY)}
            onPointerUp={() => setDragging(false)}
            onPointerLeave={() => setDragging(false)}
            onClick={(e) => {
              if (!dragging) moveTo(e.clientX, e.clientY);
            }}
          >
            {/* axes */}
            <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="var(--line)" strokeWidth={1} />
            <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="var(--line)" strokeWidth={1} />

            {/* lighthouse glow in the arrow direction */}
            {(() => {
              const len = Math.hypot(hidden.x, hidden.y) || 1;
              const ux = hidden.x / len;
              const uy = hidden.y / len;
              const beamLen = 10;
              const spread = 0.42;
              const p1x = ux * Math.cos(spread) - uy * Math.sin(spread);
              const p1y = ux * Math.sin(spread) + uy * Math.cos(spread);
              const p2x = ux * Math.cos(-spread) - uy * Math.sin(-spread);
              const p2y = ux * Math.sin(-spread) + uy * Math.cos(-spread);
              return (
                <polygon
                  points={`${sx(0)},${sy(0)} ${sx(p1x * beamLen)},${sy(p1y * beamLen)} ${sx(p2x * beamLen)},${sy(p2y * beamLen)}`}
                  fill="var(--amber)"
                  opacity={0.13}
                />
              );
            })()}

            {/* word directions */}
            {deembeddingTokens.map((t) => {
              const p = probs[t.label];
              const size = 3 + p * 46;
              const isTop = top[0] === t.label;
              return (
                <g key={t.label}>
                  <circle
                    cx={sx(t.x)}
                    cy={sy(t.y)}
                    r={Math.min(size, 15)}
                    fill={isTop ? "var(--amber)" : "var(--blue-mid)"}
                    opacity={0.28 + Math.min(p * 3, 0.7)}
                    stroke={isTop ? "var(--amber-deep)" : "none"}
                    strokeWidth={2}
                  />
                  <text
                    x={sx(t.x)}
                    y={sy(t.y) - Math.min(size, 15) - 4}
                    textAnchor="middle"
                    fontSize={isTop ? 13.5 : 11.5}
                    fontWeight={isTop ? 800 : 600}
                    fill="var(--ink)"
                  >
                    {t.label}
                  </text>
                </g>
              );
            })}

            {/* thought vector */}
            <defs>
              <marker id="hiddenArrow" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="var(--blue)" />
              </marker>
            </defs>
            <line
              x1={sx(0)}
              y1={sy(0)}
              x2={sx(hidden.x)}
              y2={sy(hidden.y)}
              stroke="var(--blue)"
              strokeWidth={4.5}
              strokeLinecap="round"
              markerEnd="url(#hiddenArrow)"
            />
            <circle
              cx={sx(hidden.x)}
              cy={sy(hidden.y)}
              r={15}
              fill="var(--blue)"
              opacity={0.25}
              style={{ cursor: "grab" }}
              onPointerDown={(e) => {
                e.preventDefault();
                (e.currentTarget as SVGCircleElement).setPointerCapture?.(e.pointerId);
                setDragging(true);
              }}
            />
            <circle cx={sx(hidden.x)} cy={sy(hidden.y)} r={6} fill="var(--blue)" style={{ pointerEvents: "none" }} />
            <text x={sx(hidden.x) + 12} y={sy(hidden.y) - 10} fontSize={12.5} fontWeight={800} fill="var(--blue)">
              <title>Technical name: hidden state vector</title>
              thought vector
            </text>
          </svg>
        </div>

        <div>
          <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <span className="panelTitle" style={{ marginBottom: 0 }}>
              Match scores → probabilities
            </span>
            <button className="btn subtle small" onClick={() => setShowTech((s) => !s)}>
              {showTech ? "Hide" : "ⓘ Technical names"}
            </button>
          </div>
          {showTech && (
            <p className="hintText fadeIn" style={{ marginBottom: 10, fontSize: 13.5 }}>
              thought vector = hidden state h · word direction = output token embedding e ·
              match score = dot(h, e) · probabilities = softmax(scores / T)
            </p>
          )}
          <ProbabilityBars distribution={probs} maxBars={8} />
          <div style={{ marginTop: 14 }}>
            <Slider
              label="Temperature"
              value={temperature}
              min={0.2}
              max={2}
              step={0.1}
              onChange={setTemperature}
              format={(v) => v.toFixed(1)}
              lowHint="sharp"
              highHint="soft"
            />
          </div>
        </div>
      </div>

      <p className="hintText" style={{ marginTop: 12 }}>
        Words inside the beam get high match scores. A longer arrow means a more confident thought
        and sharper probabilities. Press the ⓘ button for the technical names.
      </p>
    </div>
  );
}
