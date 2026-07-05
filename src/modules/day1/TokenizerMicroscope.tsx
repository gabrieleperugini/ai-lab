import { useEffect, useMemo, useState } from "react";
// Real GPT-4 tokenizer (cl100k_base), fully bundled. No network calls.
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

export default function TokenizerMicroscope({ onResult, resetSignal }: ModuleComponentProps) {
  const [text, setText] = useState("Hello world!");
  const [showIds, setShowIds] = useState(false);
  const [compareWords, setCompareWords] = useState(false);

  const { ids, pieces } = useMemo(() => tokenize(text), [text]);
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  useEffect(() => {
    setText("Hello world!");
    setShowIds(false);
    setCompareWords(false);
  }, [resetSignal]);

  useEffect(() => {
    onResult(`"${text}" reads as ${ids.length} tokens (${words.length} words)`);
  }, [text, ids, words, onResult]);

  return (
    <div className="panel">
      <p className="hintText" style={{ marginBottom: 14, fontSize: 15 }}>
        In the slides we pretended TOKEN = WORD. Real chatbots usually use smaller pieces: spaces,
        word fragments, punctuation, numbers, and symbols can all become tokens. This microscope
        runs the real GPT-4 tokenizer (cl100k_base) in your browser.
      </p>

      <div className="vizStage" style={{ padding: 18 }}>
        <textarea
          value={text}
          rows={2}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type anything to put it under the microscope"
          style={{
            width: "100%",
            border: "1.5px solid var(--line)",
            borderRadius: 10,
            padding: "10px 12px",
            fontFamily: "inherit",
            fontSize: 17,
            background: "#fff",
            resize: "vertical"
          }}
          aria-label="Text to tokenize"
        />
        <div className="controlRow" style={{ margin: "12px 0" }}>
          <span className="statPill">
            tokens <span className="statValue">{ids.length}</span>
          </span>
          <span className="statPill">
            words <span className="statValue">{words.length}</span>
          </span>
          <span className="statPill">
            characters <span className="statValue">{text.length}</span>
          </span>
        </div>

        <div className="panelTitle" style={{ marginBottom: 8 }}>
          Model-style token split (␣ marks a space inside a token)
        </div>
        <div style={{ minHeight: 40 }}>
          <TokenChips tokens={pieces} showWhitespace />
        </div>

        {compareWords && (
          <div className="fadeIn" style={{ marginTop: 14 }}>
            <div className="panelTitle" style={{ marginBottom: 8 }}>
              Human word split (how we would naively cut it)
            </div>
            <div className="tokenChips">
              {words.map((w, i) => (
                <span
                  className="tokenChip"
                  key={i}
                  style={{ background: "var(--paper-2)", border: "1.5px dashed var(--ink-faint)" }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {showIds && text.length > 0 && (
          <p
            className="hintText"
            style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 13 }}
          >
            token IDs: [{ids.join(", ")}]
          </p>
        )}
      </div>

      <div className="controlRow" style={{ marginTop: 14 }}>
        <button className="btn subtle small" onClick={() => setCompareWords((s) => !s)}>
          {compareWords ? "Hide word split" : "🪞 Compare with word split"}
        </button>
        <button className="btn subtle small" onClick={() => setShowIds((s) => !s)}>
          {showIds ? "Hide token IDs" : "🔢 Show token IDs"}
        </button>
        <button
          className="btn accent small"
          onClick={() => {
            let s = text;
            while (s === text) {
              s = surpriseStrings[Math.floor(Math.random() * surpriseStrings.length)];
            }
            setText(s);
          }}
        >
          ✨ Surprise me
        </button>
      </div>

      <hr className="divider" />

      <div className="panelTitle">Presets to investigate</div>
      <div className="controlRow">
        {tokenizerPresets.map((p) => (
          <button
            key={p}
            className={"choiceChip" + (p === text ? " selected" : "")}
            style={{ fontSize: 13.5, padding: "5px 11px" }}
            onClick={() => setText(p)}
          >
            {p.length > 44 ? p.slice(0, 42) + "…" : p}
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
    </div>
  );
}
