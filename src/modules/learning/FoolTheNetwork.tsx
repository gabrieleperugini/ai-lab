import { useEffect, useMemo, useState } from "react";
import { cleanTemplate, shiftGrid, noisify, DIGIT_LABELS } from "../../content/learning-machines/digitTemplates";
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

  const original = useMemo(() => cleanTemplate(startLabel).grid, [startLabel]);
  const edits = useMemo(() => countDiff(original, grid), [original, grid]);
  const scores = useMemo(() => classify(grid), [grid]);
  const top = scores[0];
  const confidenceIn = (label: string) => scores.find((s) => s.label === label)?.confidence ?? 0;

  const loadDigit = (label: string) => {
    setStartLabel(label);
    setGrid(cleanTemplate(label).grid.map((r) => [...r]));
  };

  useEffect(() => {
    loadDigit("7");
    setNoiseSeed(1);
  }, [resetSignal]);

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
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div className="controlRow">
          <span className="hintText">Start from:</span>
          {DIGIT_LABELS.map((l) => (
            <button
              key={l}
              className={"choiceChip" + (startLabel === l && edits === 0 ? " selected" : "")}
              style={{ padding: "6px 14px" }}
              onClick={() => loadDigit(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="controlRow">
          <button className="btn subtle small" onClick={() => setGrid(shiftGrid(grid, 0, 1))}>
            ➡️ Shift
          </button>
          <button
            className="btn subtle small"
            onClick={() => {
              setGrid(noisify(grid, 3, noiseSeed * 991));
              setNoiseSeed((s) => s + 1);
            }}
          >
            🎲 Add noise
          </button>
          <button className="btn subtle small" onClick={() => loadDigit(startLabel)}>
            ↺ Restore digit
          </button>
        </div>
      </div>

      <div className="ctxGrid" style={{ gridTemplateColumns: "auto auto 1fr", alignItems: "start" }}>
        <div className="vizStage" style={{ padding: 14, textAlign: "center" }}>
          <div className="panelTitle">Original: a {startLabel}</div>
          <PixelGrid grid={original} size={170} />
        </div>

        <div className="vizStage" style={{ padding: 14, textAlign: "center" }}>
          <div className="panelTitle">Your version · click pixels to edit</div>
          <PixelGrid grid={grid} editable onToggle={toggle} size={232} />
          <p className="hintText" style={{ marginTop: 8 }}>
            <strong>{edits}</strong> pixel{edits === 1 ? "" : "s"} changed
          </p>
        </div>

        <div className="vizStage" style={{ padding: 14 }}>
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
            Current verdict: <strong>{top.label}</strong> ({formatPercent(top.confidence)}). The
            model always picks SOME digit, even for drawings that are not digits at all.
          </p>
        </div>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "seven-one",
            title: "Turn 7 into 1",
            goal: "Start from the 7. Make the model say 1 with at most 6 pixel edits.",
            done: startLabel === "7" && top.label === "1" && edits > 0 && edits <= 6
          },
          {
            id: "three-eight",
            title: "Turn 3 into 8",
            goal: "Start from the 3. Close the loops: make the model say 8.",
            done: startLabel === "3" && top.label === "8" && edits > 0
          },
          {
            id: "hide-five",
            title: "Hide the 5",
            goal: "Start from the 5. Push the model's confidence in 5 below 30% with as few edits as you can.",
            done: startLabel === "5" && confidenceIn("5") < 0.3 && edits > 0
          },
          {
            id: "noise",
            title: "Noise attack",
            goal: "Press 'Add noise' until the prediction flips. How many noisy pixels did it take?",
            done: top.label !== startLabel && edits > 0
          },
          {
            id: "shift",
            title: "Shift attack",
            goal: "Just shift the digit sideways. Does the prediction survive the move?"
          },
          {
            id: "ood",
            title: "Not a digit",
            goal: "Clear pixels and draw something that is not a digit (a face? a heart?). The model still answers. What does that tell you?"
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        A model does not see the world exactly like we do. It can be accurate on familiar examples
        and fragile on unusual ones. Testing failures is part of understanding a model. (This is
        the same simplified detector classifier as the Feature Detector Lab.)
      </p>
    </div>
  );
}
