import { useEffect, useMemo, useState } from "react";
// Real GPT-4 tokenizer (cl100k_base), fully bundled — no network calls.
import { encode, decode } from "gpt-tokenizer/encoding/cl100k_base";
import {
  surpriseStrings,
  tokenizerActivities,
  tokenizerPresets
} from "../../content/day1-llm/tokenizationExamples";
import { TokenChips } from "../../components/viz/TokenChips";
import type { ModuleComponentProps } from "../../lib/moduleProps";

function tokenize(text: string): { ids: number[]; pieces: string[] } {
  const ids = encode(text);
  const pieces = ids.map((id) => decode([id]));
  return { ids, pieces };
}

function TokenPane({
  label,
  text,
  onChange,
  showIds
}: {
  label: string;
  text: string;
  onChange: (t: string) => void;
  showIds: boolean;
}) {
  const { ids, pieces } = useMemo(() => tokenize(text), [text]);
  return (
    <div className="vizStage" style={{ padding: 18 }}>
      <div className="panelTitle">{label}</div>
      <textarea
        value={text}
        rows={2}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type anything…"
        style={{
          width: "100%",
          border: "1.5px solid var(--line)",
          borderRadius: 10,
          padding: "10px 12px",
          fontFamily: "inherit",
          fontSize: 16,
          background: "#fff",
          resize: "vertical"
        }}
        aria-label={label}
      />
      <div className="controlRow" style={{ margin: "12px 0" }}>
        <span className="statPill">
          tokens <span className="statValue">{ids.length}</span>
        </span>
        <span className="statPill">
          characters <span className="statValue">{text.length}</span>
        </span>
      </div>
      <div style={{ minHeight: 40 }}>
        <TokenChips tokens={pieces} showWhitespace />
      </div>
      {showIds && text.length > 0 && (
        <p
          className="hintText"
          style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 13 }}
        >
          IDs: [{ids.join(", ")}]
        </p>
      )}
    </div>
  );
}

export default function TokenizerMicroscope({ onResult, resetSignal }: ModuleComponentProps) {
  const [textA, setTextA] = useState("Hello world!");
  const [textB, setTextB] = useState("hello world!");
  const [showIds, setShowIds] = useState(false);
  const [target, setTarget] = useState<"A" | "B">("A");

  useEffect(() => {
    setTextA("Hello world!");
    setTextB("hello world!");
    setShowIds(false);
    setTarget("A");
  }, [resetSignal]);

  useEffect(() => {
    onResult(
      `A: "${textA}" → ${encode(textA).length} tokens · B: "${textB}" → ${encode(textB).length} tokens`
    );
  }, [textA, textB, onResult]);

  const applyPreset = (s: string) => {
    if (target === "A") setTextA(s);
    else setTextB(s);
    setTarget(target === "A" ? "B" : "A"); // alternate for easy comparisons
  };

  return (
    <div className="panel">
      <div className="ctxGrid">
        <TokenPane label="Microscope A" text={textA} onChange={setTextA} showIds={showIds} />
        <TokenPane label="Microscope B" text={textB} onChange={setTextB} showIds={showIds} />
      </div>

      <div className="controlRow" style={{ marginTop: 16 }}>
        <button className="btn subtle small" onClick={() => setShowIds((s) => !s)}>
          {showIds ? "Hide token IDs" : "🔢 Show token IDs"}
        </button>
        <button
          className="btn accent small"
          onClick={() => applyPreset(surpriseStrings[Math.floor(Math.random() * surpriseStrings.length)])}
        >
          ✨ Surprise me
        </button>
        <span className="hintText">
          Presets fill microscope {target} next — press two in a row to compare.
        </span>
      </div>

      <hr className="divider" />

      <div className="panelTitle">Presets to investigate</div>
      <div className="controlRow">
        {tokenizerPresets.map((p) => (
          <button key={p} className="choiceChip" style={{ fontSize: 14, padding: "6px 12px" }} onClick={() => applyPreset(p)}>
            {p}
          </button>
        ))}
      </div>

      <hr className="divider" />

      <div className="panelTitle">Detective checklist</div>
      <ul className="instructionsList" style={{ listStyle: "none", paddingLeft: 4 }}>
        {tokenizerActivities.map((a, i) => (
          <li key={i}>🔍 {a}</li>
        ))}
      </ul>

      <p className="hintText" style={{ marginTop: 14 }}>
        This is the real tokenizer used by GPT-4 (cl100k_base), running entirely in your browser.
        The ␣ symbol shows where a token includes a space.
      </p>
    </div>
  );
}
