import { useEffect, useMemo, useState } from "react";
import { pixelExamples, artToGrid, downsample } from "../../content/learning-machines/pixelExamples";
import { Segmented } from "../../components/controls/Segmented";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const CELL_VIEW = 320;

export default function WhatComputerSees({ onResult, resetSignal }: ModuleComponentProps) {
  const [exampleId, setExampleId] = useState(pixelExamples[0].id);
  const [res, setRes] = useState<number>(16);
  const [showNumbers, setShowNumbers] = useState(false);
  const [flatten, setFlatten] = useState(false);

  const example = pixelExamples.find((e) => e.id === exampleId)!;

  useEffect(() => {
    setExampleId(pixelExamples[0].id);
    setRes(16);
    setShowNumbers(false);
    setFlatten(false);
  }, [resetSignal]);

  const grid = useMemo(() => {
    if (example.kind !== "image" || !example.art) return null;
    return downsample(artToGrid(example.art), res);
  }, [example, res]);

  const flat = useMemo(() => {
    if (example.kind === "waveform") return example.wave!.map((v) => Math.round((v + 1) * 127.5));
    return grid ? grid.flat() : [];
  }, [example, grid]);

  useEffect(() => {
    onResult(
      `example '${example.id}' at ${example.kind === "image" ? `${res}x${res}` : "64 samples"}, numbers ${showNumbers ? "on" : "off"}, flattened ${flatten ? "yes" : "no"}`
    );
  }, [example, res, showNumbers, flatten, onResult]);

  const cell = grid ? CELL_VIEW / grid.length : 0;

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <Segmented
          ariaLabel="Example"
          options={pixelExamples.map((e) => ({ value: e.id, label: `${e.emoji} ${e.label.split(" ")[0]}` }))}
          value={exampleId}
          onChange={(id) => {
            setExampleId(id);
            setFlatten(false);
          }}
        />
        {example.kind === "image" && (
          <Segmented
            ariaLabel="Resolution"
            options={[
              { value: 4, label: "4x4" },
              { value: 8, label: "8x8" },
              { value: 16, label: "16x16" }
            ]}
            value={res}
            onChange={setRes}
          />
        )}
      </div>

      <div className="ctxGrid" style={{ alignItems: "start" }}>
        {/* Human view */}
        <div className="vizStage" style={{ padding: 16, textAlign: "center" }}>
          <div className="panelTitle">What you see</div>
          {example.kind === "image" ? (
            <svg viewBox={`0 0 ${CELL_VIEW} ${CELL_VIEW}`} width="88%" style={{ maxWidth: 300 }} role="img" aria-label={example.label}>
              {grid!.map((row, r) =>
                row.map((v, c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={c * cell}
                    y={r * cell}
                    width={cell + 0.5}
                    height={cell + 0.5}
                    fill={`rgb(${255 - v}, ${255 - Math.round(v * 0.92)}, ${255 - Math.round(v * 0.75)})`}
                  />
                ))
              )}
            </svg>
          ) : (
            <svg viewBox="0 0 320 160" width="100%" role="img" aria-label="waveform">
              <line x1={0} y1={80} x2={320} y2={80} stroke="var(--line)" />
              <polyline
                points={example.wave!.map((v, i) => `${(i / 63) * 312 + 4},${80 - v * 65}`).join(" ")}
                fill="none"
                stroke="var(--blue)"
                strokeWidth={2.5}
              />
            </svg>
          )}
          <p className="hintText" style={{ marginTop: 8 }}>
            {example.label}
            {example.kind === "image" ? `, shown at ${res}x${res}` : ", a fraction of a second of sound"}
          </p>
        </div>

        {/* Machine view */}
        <div className="vizStage" style={{ padding: 16 }}>
          <div className="panelTitle">What the computer receives</div>
          {!flatten && example.kind === "image" && (
            <svg viewBox={`0 0 ${CELL_VIEW} ${CELL_VIEW}`} width="88%" style={{ maxWidth: 300, display: "block", margin: "0 auto" }} role="img" aria-label="pixel numbers">
              {grid!.map((row, r) =>
                row.map((v, c) => (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={c * cell}
                      y={r * cell}
                      width={cell}
                      height={cell}
                      fill="#fff"
                      stroke="var(--line)"
                      strokeWidth={0.7}
                    />
                    {showNumbers ? (
                      <text
                        x={c * cell + cell / 2}
                        y={r * cell + cell / 2 + (res === 16 ? 3 : 5)}
                        textAnchor="middle"
                        fontSize={res === 16 ? 8.5 : res === 8 ? 13 : 22}
                        fontFamily="var(--font-mono)"
                        fill={v > 140 ? "var(--blue)" : "var(--ink-faint)"}
                        fontWeight={v > 140 ? 700 : 400}
                      >
                        {v}
                      </text>
                    ) : (
                      <rect
                        x={c * cell + 1}
                        y={r * cell + 1}
                        width={cell - 2}
                        height={cell - 2}
                        fill={`rgb(${255 - v},${255 - v},${255 - v})`}
                      />
                    )}
                  </g>
                ))
              )}
            </svg>
          )}
          {!flatten && example.kind === "waveform" && (
            <div className="tokenChips" style={{ maxHeight: 200, overflowY: "auto" }}>
              {flat.map((v, i) => (
                <span key={i} className="tokenChip" style={{ background: "var(--paper-2)", fontSize: 12 }}>
                  {v}
                </span>
              ))}
            </div>
          )}
          {flatten && (
            <>
              <p className="hintText" style={{ marginBottom: 8 }}>
                Flattened into one long list of {flat.length} numbers:
              </p>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  lineHeight: 1.7,
                  maxHeight: 230,
                  overflowY: "auto",
                  background: "#fff",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  wordBreak: "break-all"
                }}
              >
                [{flat.join(", ")}]
              </div>
            </>
          )}
        </div>
      </div>

      <div className="controlRow" style={{ marginTop: 14 }}>
        {example.kind === "image" && (
          <button className="btn subtle small" onClick={() => setShowNumbers((s) => !s)}>
            {showNumbers ? "Show shades" : "🔢 Show numbers"}
          </button>
        )}
        <button className="btn subtle small" onClick={() => setFlatten((s) => !s)}>
          {flatten ? "Back to the grid" : "📏 Flatten into a vector"}
        </button>
        <span className="statPill">
          numbers the computer gets: <span className="statValue">{flat.length}</span>
        </span>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          { id: "lowres", title: "Squint test", goal: "Drop to 4x4. Can you still recognize the image? Could a friend?" },
          { id: "rules", title: "Rule writer", goal: "Turn on the numbers. Try to state a rule using only these numbers that recognizes this image. How far do you get?" },
          { id: "vector", title: "Count the input", goal: "Flatten the pixels. How many numbers arrive for one tiny image? What about a phone photo (12 million pixels)?" }
        ]}
      />
    </div>
  );
}
