import { useEffect, useMemo, useState } from "react";
import { digitTemplates } from "../../content/learning-machines/digitTemplates";
import { detectors } from "../../content/learning-machines/featureDetectors";
import { activation, classify } from "../../lib/learning/detectorClassifier";
import { PixelGrid } from "../../components/learning/PixelGrid";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import type { ModuleComponentProps } from "../../lib/moduleProps";
import { formatPercent } from "../../lib/format";

const MAX_BUDGET = 3;

export default function FeatureDetectorLab({ onResult, resetSignal }: ModuleComponentProps) {
  const [templateId, setTemplateId] = useState("7_clean");
  const [overlayId, setOverlayId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [budgetMode, setBudgetMode] = useState(false);

  useEffect(() => {
    setTemplateId("7_clean");
    setOverlayId(null);
    setSelected([]);
    setBudgetMode(false);
  }, [resetSignal]);

  const template = digitTemplates.find((t) => t.id === templateId)!;
  const overlay = overlayId ? detectors.find((d) => d.id === overlayId)!.template : null;

  const activations = useMemo(
    () => detectors.map((d) => ({ d, a: activation(template.grid, d.template) })),
    [template]
  );

  const usedIds = selected.length > 0 ? selected : undefined;
  const scores = useMemo(() => classify(template.grid, usedIds), [template, usedIds]);

  /** Budget accuracy: classify every template variant with the selected team. */
  const teamAccuracy = useMemo(() => {
    if (selected.length === 0) return null;
    let ok = 0;
    for (const t of digitTemplates) {
      if (classify(t.grid, selected)[0].label === t.label) ok++;
    }
    return ok / digitTemplates.length;
  }, [selected]);

  useEffect(() => {
    onResult(
      `digit '${template.id}', team [${selected.join(", ") || "all detectors"}], top guess ${scores[0].label} (${formatPercent(scores[0].confidence)})${teamAccuracy !== null ? `, team accuracy ${(teamAccuracy * 100).toFixed(0)}%` : ""}`
    );
  }, [template, selected, scores, teamAccuracy, onResult]);

  const toggleDetector = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (budgetMode && prev.length >= MAX_BUDGET) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <label className="statPill" style={{ gap: 8 }}>
          Digit
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            aria-label="Choose a digit"
            style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "var(--blue)", cursor: "pointer" }}
          >
            {digitTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.variant})
              </option>
            ))}
          </select>
        </label>
        <div className="controlRow">
          <button className="btn subtle small" onClick={() => { setBudgetMode((b) => !b); setSelected([]); }}>
            {budgetMode ? "Exit budget mode" : `💰 Budget mode (max ${MAX_BUDGET})`}
          </button>
          <button className="btn subtle small" onClick={() => setSelected([])} disabled={selected.length === 0}>
            Clear team
          </button>
        </div>
      </div>

      <div className="ctxGrid" style={{ gridTemplateColumns: "auto 1fr", alignItems: "start" }}>
        {/* input + overlay */}
        <div className="vizStage" style={{ padding: 14, textAlign: "center" }}>
          <div className="panelTitle">Input: {template.label} ({template.variant})</div>
          <PixelGrid grid={template.grid} overlay={overlay} size={232} />
          {overlayId && (
            <p className="hintText" style={{ marginTop: 8 }}>
              {detectors.find((d) => d.id === overlayId)!.label}: fires at{" "}
              <strong>{formatPercent(activation(template.grid, detectors.find((d) => d.id === overlayId)!.template))}</strong>
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {/* detector library */}
          <div className="vizStage" style={{ padding: 12 }}>
            <div className="panelTitle">
              Detector library · hover to preview, click to add to your team
              {budgetMode && ` (${selected.length}/${MAX_BUDGET})`}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {activations.map(({ d, a }) => {
                const inTeam = selected.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onMouseEnter={() => setOverlayId(d.id)}
                    onMouseLeave={() => setOverlayId((cur) => (cur === d.id ? null : cur))}
                    onClick={() => toggleDetector(d.id)}
                    style={{
                      border: `2px solid ${inTeam ? "var(--blue)" : "var(--line)"}`,
                      background: inTeam ? "var(--blue-soft)" : "#fff",
                      borderRadius: 10,
                      padding: "6px 10px",
                      fontFamily: "inherit",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--ink)"
                    }}
                  >
                    {d.emoji} {d.label}
                    <span style={{ marginLeft: 6, fontFamily: "var(--font-mono)", fontSize: 12, color: a > 0.6 ? "var(--green)" : "var(--ink-faint)" }}>
                      {(a * 100).toFixed(0)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* class scores */}
          <div className="vizStage" style={{ padding: 12 }}>
            <div className="panelTitle">
              Digit scores {selected.length > 0 ? `(using your team of ${selected.length})` : "(using all detectors)"}
            </div>
            {scores.map((s) => (
              <div key={s.label} className="probRow" style={{ gridTemplateColumns: "40px 1fr 56px" }}>
                <span className="probLabel">{s.label}</span>
                <div className="probTrack">
                  <div
                    className={"probFill" + (s.label === template.label ? " picked" : "")}
                    style={{ width: `${s.confidence * 100}%` }}
                  />
                </div>
                <span className="probValue">{formatPercent(s.confidence)}</span>
              </div>
            ))}
            {teamAccuracy !== null && (
              <p className="hintText" style={{ marginTop: 8 }}>
                Your team classifies {(teamAccuracy * 100).toFixed(0)}% of all {digitTemplates.length} digit
                variants correctly.
              </p>
            )}
          </div>
        </div>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          { id: "find-stroke", title: "Find the stroke", goal: "For the clean 7, which detector fires the strongest? Hover to check your guess." },
          { id: "three-five", title: "3 versus 5", goal: "Pick a small team that scores 3 highest on the 3 and 5 highest on the 5. Where do they differ?" },
          { id: "zero-eight", title: "0 versus 8", goal: "What separates 0 from 8? Hint: look in the middle." },
          {
            id: "budget",
            title: "Budget mode",
            goal: `With at most ${MAX_BUDGET} detectors, classify at least 75% of all digit variants correctly.`,
            done: budgetMode && teamAccuracy !== null && teamAccuracy >= 0.75
          },
          { id: "failure", title: "Detector failure", goal: "Switch to a shifted or noisy variant. Which detectors stop firing? Why?" }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        This is a simplified model of feature detection: the detectors are hand-made and fixed.
        Real neural networks learn their own detectors from data, and deeper layers combine them
        into more complex concepts.
      </p>
    </div>
  );
}
