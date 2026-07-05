import { useEffect, useState } from "react";
import { branchingExamples } from "../../content/day1-llm/branchingExamples";
import type { BranchChoice } from "../../content/day1-llm/branchingExamples";
import { Segmented } from "../../components/controls/Segmented";
import type { ModuleComponentProps } from "../../lib/moduleProps";

/**
 * Multi-step branching: students pick a token, new probabilities appear,
 * they pick again, and a short ending is revealed. The committed path is
 * shown as token chips; explored paths accumulate in a breadcrumb list.
 */
export default function BranchingStories({ onResult, resetSignal }: ModuleComponentProps) {
  const [exampleId, setExampleId] = useState(branchingExamples[0].id);
  const [path, setPath] = useState<BranchChoice[]>([]);
  const [explored, setExplored] = useState<string[]>([]);

  const example = branchingExamples.find((e) => e.id === exampleId)!;
  const current = path.length === 0 ? null : path[path.length - 1];
  const options: BranchChoice[] = current ? (current.choices ?? []) : example.choices;
  const ended = current !== null && current.ending !== undefined;

  useEffect(() => {
    setExampleId(branchingExamples[0].id);
    setPath([]);
    setExplored([]);
  }, [resetSignal]);

  const fullText = () => {
    const tokens = path.map((p) => p.token).join(" ");
    const ending = ended ? " " + current!.ending : "";
    return `${example.root} ${tokens}${ending}`.replace(/\s+([,.])/g, "$1");
  };

  const pick = (choice: BranchChoice) => {
    const nextPath = [...path, choice];
    setPath(nextPath);
    if (choice.ending !== undefined) {
      const text = `${example.root} ${nextPath.map((p) => p.token).join(" ")} ${choice.ending}`
        .replace(/\s+([,.])/g, "$1");
      setExplored((prev) => (prev.includes(text) ? prev : [...prev, text]));
      onResult(`example '${example.id}': reached "${text}"`);
    } else {
      onResult(`example '${example.id}': committed to '${choice.token}'`);
    }
  };

  const retry = () => setPath([]);

  const stepLabel =
    path.length === 0 ? "Step 1: choose the first token" : ended ? "The future you built" : `Step ${path.length + 1}: the story continues. Choose again`;

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <Segmented
          ariaLabel="Example"
          options={branchingExamples.map((e) => ({ value: e.id, label: e.title }))}
          value={exampleId}
          onChange={(id) => {
            setExampleId(id);
            setPath([]);
            setExplored([]);
          }}
        />
        <button className="btn subtle small" onClick={retry} disabled={path.length === 0}>
          ↺ Try another branch
        </button>
      </div>

      {/* The story so far, as committed chips */}
      <div className="vizStage" style={{ padding: "16px 18px" }}>
        <div className="tokenChips" style={{ fontSize: 17 }}>
          <span
            className="tokenChip"
            style={{ background: "var(--paper-2)", color: "var(--ink-soft)", fontFamily: "var(--font-body)", fontWeight: 600 }}
          >
            {example.root}
          </span>
          {path.map((p, i) => (
            <span
              key={i}
              className="tokenChip"
              style={{
                background: "var(--amber-soft)",
                border: "1.5px solid var(--amber-deep)",
                fontWeight: 700
              }}
            >
              {p.token}
            </span>
          ))}
          {ended && (
            <span
              className="tokenChip fadeIn"
              style={{ background: "var(--green-soft)", fontFamily: "var(--font-body)" }}
            >
              {current!.ending}
            </span>
          )}
          {!ended && <span className="blank" style={{ borderBottom: "3px solid var(--amber-deep)", minWidth: 60 }}>&nbsp;</span>}
        </div>
      </div>

      <div className="panelTitle" style={{ margin: "16px 0 10px" }}>
        {stepLabel}
      </div>

      {!ended ? (
        <div className="controlRow">
          {options.map((c) => (
            <button key={c.token} className="choiceChip" onClick={() => pick(c)}>
              {c.token}
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12.5,
                  color: "var(--ink-faint)",
                  fontFamily: "var(--font-mono)"
                }}
              >
                {Math.round(c.probability * 100)}%
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="revealBox fadeIn">
          <strong>“{fullText()}”</strong>
          <p style={{ marginTop: 8 }}>
            {example.flavor === "proof"
              ? "Each rung of this ladder narrowed what mathematics allows next."
              : "Ask yourselves: what did the FIRST choice make impossible?"}
          </p>
          <div className="controlRow" style={{ marginTop: 10 }}>
            <button className="btn accent small" onClick={retry}>
              ↺ Try another branch
            </button>
          </div>
        </div>
      )}

      {/* Explanation of the last committed (non-final) token */}
      {current && !ended && current.explanation && (
        <p className="hintText fadeIn" style={{ marginTop: 12 }}>
          💡 {current.explanation}
        </p>
      )}

      {explored.length > 0 && (
        <>
          <hr className="divider" />
          <div className="panelTitle">
            Futures you explored ({explored.length})
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {explored.map((t, i) => (
              <li key={i} style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>
                {t}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
