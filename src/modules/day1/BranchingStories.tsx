import { useEffect, useState } from "react";
import generatedData from "../../content/generated/day1/m3_branching.json";
import { Segmented } from "../../components/controls/Segmented";
import type { GenM3, GenBranchOption } from "../../lib/generated";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const data = generatedData as GenM3;

/**
 * Three-step branching on real GPT-2 probabilities. Students pick a token,
 * the text grows, new probabilities appear; after the third pick a short
 * model-written ending is revealed. All content is precomputed JSON.
 */
export default function BranchingStories({ onResult, resetSignal }: ModuleComponentProps) {
  const [treeId, setTreeId] = useState(data.trees[0].id);
  const [nodeId, setNodeId] = useState("root");
  const [picked, setPicked] = useState<GenBranchOption[]>([]);
  const [explored, setExplored] = useState<string[]>([]);

  const tree = data.trees.find((t) => t.id === treeId)!;
  const node = tree.nodes[nodeId];
  const last = picked.length > 0 ? picked[picked.length - 1] : null;
  const ended = last !== null && last.ending !== undefined && last.next === null;

  useEffect(() => {
    setTreeId(data.trees[0].id);
    setNodeId("root");
    setPicked([]);
    setExplored([]);
  }, [resetSignal]);

  const fullText = () => {
    const tokens = picked.map((p) => p.text).join("");
    const ending = ended && last?.ending ? " " + last.ending : "";
    return `${tree.root}${tokens}${ending}`;
  };

  const pick = (opt: GenBranchOption) => {
    const nextPicked = [...picked, opt];
    setPicked(nextPicked);
    if (opt.next) {
      setNodeId(opt.next);
      onResult(`tree '${tree.id}': committed to '${opt.text.trim()}'`);
    } else {
      const text = `${tree.root}${nextPicked.map((p) => p.text).join("")} ${opt.ending ?? ""}`.trim();
      setExplored((prev) => (prev.includes(text) ? prev : [...prev, text]));
      onResult(`tree '${tree.id}': reached "${text}"`);
    }
  };

  const restart = () => {
    setNodeId("root");
    setPicked([]);
  };

  const stepLabel = ended
    ? "The future you built"
    : `Step ${picked.length + 1} of 3: choose the next token`;

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <Segmented
          ariaLabel="Example"
          options={data.trees.map((t) => ({ value: t.id, label: t.title }))}
          value={treeId}
          onChange={(id) => {
            setTreeId(id);
            setNodeId("root");
            setPicked([]);
            setExplored([]);
          }}
        />
        <div className="controlRow">
          <a className="btn subtle small" href="#/day1/next-token-arena/probability">
            ← Back to the Arena
          </a>
          <button className="btn subtle small" onClick={restart} disabled={picked.length === 0}>
            ↺ Restart this branch
          </button>
        </div>
      </div>

      {/* the growing text, with the committed path as chips */}
      <div className="vizStage" style={{ padding: "16px 18px" }}>
        <div className="tokenChips" style={{ fontSize: 17 }}>
          <span
            className="tokenChip"
            style={{
              background: "var(--paper-2)",
              color: "var(--ink-soft)",
              fontFamily: "var(--font-body)",
              fontWeight: 600
            }}
          >
            {tree.root}
          </span>
          {picked.map((p, i) => (
            <span
              key={i}
              className="tokenChip"
              style={{
                background: "var(--amber-soft)",
                border: "1.5px solid var(--amber-deep)",
                fontWeight: 700
              }}
            >
              {p.text.trim()}
            </span>
          ))}
          {ended && last?.ending && (
            <span
              className="tokenChip fadeIn"
              style={{ background: "var(--green-soft)", fontFamily: "var(--font-body)" }}
            >
              {last.ending}
            </span>
          )}
          {!ended && (
            <span
              className="blank"
              style={{ borderBottom: "3px solid var(--amber-deep)", minWidth: 60 }}
            >
              &nbsp;
            </span>
          )}
        </div>
        {picked.length > 0 && (
          <p className="hintText" style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 13 }}>
            path: {picked.map((p) => p.text.trim()).join(" → ")}
          </p>
        )}
      </div>

      <div className="panelTitle" style={{ margin: "16px 0 10px" }}>
        {stepLabel}
      </div>

      {!ended ? (
        <>
          <div className="controlRow">
            {node.options.map((o) => (
              <button key={o.text} className="choiceChip" onClick={() => pick(o)}>
                {o.text.trim()}
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12.5,
                    color: "var(--ink-faint)",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  {(o.probability * 100).toFixed(0)}%
                </span>
              </button>
            ))}
            <span
              className="choiceChip"
              style={{
                cursor: "default",
                borderStyle: "dashed",
                color: "var(--ink-faint)",
                background: "var(--paper-2)"
              }}
              title="All the other tokens in the vocabulary"
            >
              other {(node.other * 100).toFixed(0)}%
            </span>
          </div>
          <p className="hintText" style={{ marginTop: 12 }}>
            Each token commits the text to a branch. The next distribution depends on the path so
            far. Percentages are real {data.model} probabilities.
          </p>
        </>
      ) : (
        <div className="revealBox fadeIn">
          <strong>“{fullText()}”</strong>
          <p style={{ marginTop: 8 }}>
            Ask yourselves: what did the FIRST choice make impossible? Restart and take a
            different first branch to find out.
          </p>
          <div className="controlRow" style={{ marginTop: 10 }}>
            <button className="btn accent small" onClick={restart}>
              ↺ Restart this branch
            </button>
          </div>
        </div>
      )}

      {explored.length > 0 && (
        <>
          <hr className="divider" />
          <div className="panelTitle">Futures you explored ({explored.length})</div>
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
