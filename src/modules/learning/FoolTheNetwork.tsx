import { useEffect, useMemo, useState } from "react";
import {
  cleanTemplate,
  shiftGrid,
  noisify,
  thicken,
  coverHalf,
  DIGIT_LABELS
} from "../../content/learning-machines/digitTemplates";
import type { DigitGrid } from "../../content/learning-machines/digitTemplates";
import { classify } from "../../lib/learning/detectorClassifier";
import { PixelGrid } from "../../components/learning/PixelGrid";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import type { ModuleComponentProps } from "../../lib/moduleProps";
import { formatPercent } from "../../lib/format";

function countDiff(a: DigitGrid, b: DigitGrid): number {
  let n = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (a[r][c] !== b[r][c]) n++;
  return n;
}

export default function FoolTheNetwork({ onResult, resetSignal }: ModuleComponentProps) {
  const [startLabel, setStartLabel] = useState("7");
  const [grid, setGrid] = useState<DigitGrid>(() => cleanTemplate("7").grid.map((r) => [...r]));
  const [noiseSeed, setNoiseSeed] = useState(1);
  // For the flip-and-restore challenge: has the prediction been wrong at
  // least once since the digit was loaded?
  const [flippedOnce, setFlippedOnce] = useState(false);

  const original = useMemo(() => cleanTemplate(startLabel).grid, [startLabel]);
  const edits = useMemo(() => countDiff(original, grid), [original, grid]);
  const scores = useMemo(() => classify(grid), [grid]);
  const top = scores[0];

  const loadDigit = (label: string) => {
    setStartLabel(label);
    setGrid(cleanTemplate(label).grid.map((r) => [...r]));
    setFlippedOnce(false);
  };

  useEffect(() => {
    loadDigit("7");
    setNoiseSeed(1);
  }, [resetSignal]);

  useEffect(() => {
    if (top.label !== startLabel && edits > 0) setFlippedOnce(true);
  }, [top.label, startLabel, edits]);

  useEffect(() => {
    onResult(
      `started from ${startLabel}, ${edits} edits, model says ${top.label} (${formatPercent(top.confidence)})`
    );
  }, [startLabel, edits, top, onResult]);

  const toggle = (r: number, c: number) => {
    setGrid((g) => {
      const out = g.map((row) => [...row]);
      out[r][c] = out[r][c] ? 0 : 1;
      return out;
    });
  };

  return (
    <div className="panel">
      <div className="controlRow" style={{ marginBottom: 8 }}>
        <span className="hintText">Start from:</span>
        {DIGIT_LABELS.map((l) => (
          <button
            key={l}
            className={"choiceChip" + (startLabel === l && edits === 0 ? " selected" : "")}
            style={{ padding: "6px 12px" }}
            onClick={() => loadDigit(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="controlRow" style={{ marginBottom: 12 }}>
        <span className="hintText">Perturb:</span>
        <button className="btn subtle small" onClick={() => setGrid(shiftGrid(grid, 0, -1))}>
          ⬅️
        </button>
        <button className="btn subtle small" onClick={() => setGrid(shiftGrid(grid, 0, 1))}>
          ➡️
        </button>
        <button className="btn subtle small" onClick={() => setGrid(shiftGrid(grid, -1, 0))}>
          ⬆️
        </button>
        <button className="btn subtle small" onClick={() => setGrid(shiftGrid(grid, 1, 0))}>
          ⬇️
        </button>
        <button
          className="btn subtle small"
          onClick={() => {
            setGrid(noisify(grid, 3, noiseSeed * 991));
            setNoiseSeed((s) => s + 1);
          }}
        >
          🎲 Noise
        </button>
        <button className="btn subtle small" onClick={() => setGrid(thicken(grid))}>
          ✒️ Thicken
        </button>
        <button className="btn subtle small" onClick={() => setGrid(coverHalf(grid, "top"))}>
          🙈 Cover top
        </button>
        <button className="btn subtle small" onClick={() => setGrid(coverHalf(grid, "bottom"))}>
          🙈 Cover bottom
        </button>
        <button className="btn subtle small" onClick={() => loadDigit(startLabel)}>
          ↺ Restore digit
        </button>
      </div>

      {/* flex-wrap keeps the prediction panel readable at any width: it takes
          the remaining space and wraps below the grids when things get tight */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <div className="vizStage" style={{ padding: 14, textAlign: "center", flex: "0 0 200px", width: "auto" }}>
          <div className="panelTitle">Original: a {startLabel}</div>
          <PixelGrid grid={original} size={170} />
        </div>

        <div className="vizStage" style={{ padding: 14, textAlign: "center", flex: "0 0 262px", width: "auto" }}>
          <div className="panelTitle">Your version · click pixels to edit</div>
          <PixelGrid grid={grid} editable onToggle={toggle} size={232} />
          <p className="hintText" style={{ marginTop: 8 }}>
            <strong>{edits}</strong> pixel{edits === 1 ? "" : "s"} changed
          </p>
        </div>

        <div className="vizStage" style={{ padding: 14, flex: "1 1 280px", minWidth: 280, width: "auto" }}>
          <div className="panelTitle">The model's opinion</div>
          {scores.map((s) => (
            <div key={s.label} className="probRow" style={{ gridTemplateColumns: "40px 1fr 56px" }}>
              <span className="probLabel">{s.label}</span>
              <div className="probTrack">
                <div
                  className={"probFill" + (s.label === startLabel ? " blue" : "")}
                  style={{ width: `${s.confidence * 100}%` }}
                />
              </div>
              <span className="probValue">{formatPercent(s.confidence)}</span>
            </div>
          ))}
          <p className="hintText" style={{ marginTop: 8 }}>
            Current verdict: <strong>{top.label}</strong> ({formatPercent(top.confidence)}). Watch
            the whole probability list, not just the winner: confidence can shift long before the
            answer flips. The model always picks SOME digit, even for drawings that are not digits.
          </p>
        </div>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "smallest-flip",
            title: "The smallest attack",
            goal: "Flip the prediction to a different digit by changing at most 4 pixels.",
            done: top.label !== startLabel && edits > 0 && edits <= 4
          },
          {
            id: "three-eight",
            title: "Turn 3 into 8",
            goal: "Start from the 3. Close the loops: make the model say 8.",
            done: startLabel === "3" && top.label === "8" && edits > 0
          },
          {
            id: "four-nine",
            title: "Turn 4 into 9",
            goal: "Start from the 4. Can you make the model read it as a 9?",
            done: startLabel === "4" && top.label === "9" && edits > 0
          },
          {
            id: "confidently-wrong",
            title: "Confidently wrong",
            goal: "Make the model at least 60% sure of a WRONG digit, while your drawing still looks like the original to you.",
            done: top.label !== startLabel && top.confidence >= 0.6 && edits > 0
          },
          {
            id: "maximum-doubt",
            title: "Maximum doubt",
            goal: "Confuse the model completely: push its top confidence below 30%.",
            done: top.confidence < 0.3 && edits > 0
          },
          {
            id: "flip-and-restore",
            title: "Flip it, then fix it",
            goal: "Break the prediction, then repair it with the smallest counter-change. Do not use the restore button!",
            done: flippedOnce && top.label === startLabel && edits > 0
          },
          {
            id: "shift-test",
            title: "Stress test the moves",
            goal: "Shift the digit right, then left. Cover the top, then the bottom. Which perturbations does the model survive, and which break it?"
          },
          {
            id: "ood",
            title: "Not a digit",
            goal: "Clear pixels and draw something that is not a digit (a face? a heart?). The model still answers. What does that tell you?"
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        The model is not seeing the digit the way you do. It reacts to the numerical pattern it
        learned: some changes it shrugs off (it has seen shifted and thick digits), and some tiny
        changes break it completely. Testing failures is part of understanding a model. (This is
        the same transparent detector classifier as the Feature Detector Lab.)
      </p>
    </div>
  );
}
