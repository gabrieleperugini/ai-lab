import { useEffect, useMemo, useState } from "react";
import generatedData from "../../content/generated/day1/reasoning_demo.json";
import type { GenReasoning, GenReasoningOption } from "../../lib/generated";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const data = generatedData as GenReasoning;

/**
 * The odd-square proof from the slides ("NTP part 5 - intelligence") as a
 * ladder of commitments. At every step only ONE option keeps the proof
 * alive; picking a dead end reveals why the road leads nowhere and forces a
 * restart. GPT-2's own preference is shown per step; the small model often
 * picks a dead end, which is exactly the point: reasoning needs look-ahead.
 */
export default function ReasoningDemo({ onResult, resetSignal }: ModuleComponentProps) {
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<string[]>([]);
  const [deadEnd, setDeadEnd] = useState<GenReasoningOption | null>(null);
  const [lastWhy, setLastWhy] = useState<string | null>(null);
  const [crashes, setCrashes] = useState(0);
  const [showModelPick, setShowModelPick] = useState(false);

  const done = step >= data.steps.length;
  const current = done ? null : data.steps[step];

  const restart = () => {
    setStep(0);
    setPath([]);
    setDeadEnd(null);
    setLastWhy(null);
  };

  useEffect(() => {
    restart();
    setCrashes(0);
    setShowModelPick(false);
  }, [resetSignal]);

  const modelPick = useMemo(() => {
    if (!current) return null;
    return current.options.reduce((a, b) => (b.relativeScore > a.relativeScore ? b : a));
  }, [current]);

  const choose = (opt: GenReasoningOption) => {
    if (deadEnd) return;
    if (opt.deadEnd) {
      setDeadEnd(opt);
      setCrashes((c) => c + 1);
      onResult(`proof step ${step + 1}: dead end on '${opt.display}' (${crashes + 1} crashes so far)`);
    } else {
      setPath((p) => [...p, opt.display]);
      setLastWhy(data.steps[step].why);
      setStep((s) => s + 1);
      onResult(
        step + 1 >= data.steps.length
          ? `proof completed after ${crashes} dead ends`
          : `proof step ${step + 1}: committed to '${opt.display}'`
      );
    }
  };

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <span className="statPill">
          Step <span className="statValue">{Math.min(step + 1, data.steps.length)}</span> /{" "}
          {data.steps.length}
        </span>
        <div className="controlRow">
          {crashes > 0 && (
            <span className="statPill">
              💥 dead ends hit: <span className="statValue">{crashes}</span>
            </span>
          )}
          <a className="btn subtle small" href="#/day1/next-token-arena/reasoning">
            ← Back to the Arena
          </a>
        </div>
      </div>

      {/* the proof so far */}
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
            {data.root}
          </span>
          {path.map((t, i) => (
            <span
              key={i}
              className="tokenChip"
              style={{
                background: "var(--green-soft)",
                border: "1.5px solid var(--green)",
                fontWeight: 700
              }}
            >
              {t}
            </span>
          ))}
          {!done && (
            <span
              className="blank"
              style={{ borderBottom: "3px solid var(--amber-deep)", minWidth: 60 }}
            >
              &nbsp;
            </span>
          )}
          {done && (
            <span className="tokenChip fadeIn" style={{ background: "var(--amber-soft)", fontWeight: 800 }}>
              🏆
            </span>
          )}
        </div>
      </div>

      {!done && current && (
        <>
          <div className="panelTitle" style={{ margin: "16px 0 10px" }}>
            Choose the next step. Only one road survives.
          </div>
          <div className="controlRow">
            {current.options.map((o) => (
              <button
                key={o.display}
                className={
                  "choiceChip" +
                  (deadEnd?.display === o.display ? " selected" : "")
                }
                style={
                  deadEnd?.display === o.display
                    ? { background: "var(--red)", borderColor: "var(--red)", color: "#fff" }
                    : deadEnd
                      ? { opacity: 0.4 }
                      : undefined
                }
                disabled={!!deadEnd && deadEnd.display !== o.display}
                onClick={() => choose(o)}
              >
                {o.display}
                {showModelPick && modelPick?.display === o.display && (
                  <span style={{ marginLeft: 8, fontSize: 12 }} title="GPT-2's preferred option">
                    🤖
                  </span>
                )}
              </button>
            ))}
          </div>

          {deadEnd ? (
            <div className="warnText fadeIn" style={{ marginTop: 14 }}>
              💥 Dead end. {deadEnd.note} This road leads nowhere: start again.
              <div className="controlRow" style={{ marginTop: 10 }}>
                <button className="btn accent small" onClick={restart}>
                  ↺ Start the proof again
                </button>
              </div>
            </div>
          ) : (
            lastWhy && (
              <p className="hintText fadeIn" style={{ marginTop: 12 }}>
                ✅ {lastWhy}
              </p>
            )
          )}

          <hr className="divider" />
          <div className="controlRow" style={{ justifyContent: "space-between" }}>
            <button className="btn subtle small" onClick={() => setShowModelPick((s) => !s)}>
              {showModelPick ? "Hide GPT-2's picks" : "🤖 Show what GPT-2 would pick"}
            </button>
            {showModelPick && modelPick && (
              <span className="hintText">
                GPT-2 prefers “{modelPick.display}” here ({(modelPick.relativeScore * 100).toFixed(0)}%
                among these options){modelPick.deadEnd ? ": a dead end! Small models lack look-ahead." : "."}
              </span>
            )}
          </div>
        </>
      )}

      {done && (
        <div className="revealBox fadeIn" style={{ marginTop: 16 }}>
          <strong>“{data.finalText}”</strong>
          <p style={{ marginTop: 8 }}>
            You reached QED{crashes > 0 ? ` after ${crashes} dead end${crashes > 1 ? "s" : ""}` : " without a single dead end"}.
            Every step was one committed token, and at every step most roads led nowhere. Producing
            a proof by next-token prediction means the probabilities must encode planning: the model
            has to prefer tokens whose FUTURE works out. Toggle “Show what GPT-2 would pick” and
            restart: the small model crashes almost immediately.
          </p>
          <div className="controlRow" style={{ marginTop: 10 }}>
            <button className="btn primary small" onClick={restart}>
              ↺ Walk it again
            </button>
            <a className="btn ghost small" href="#/day1/next-token-arena/reasoning">
              ← Back to the Arena
            </a>
          </div>
        </div>
      )}

      <p className="hintText" style={{ marginTop: 12 }}>
        The percentages behind the 🤖 marker are GPT-2 chain-rule scores, normalized among the
        shown options. Dead-end explanations are curated; the math is checked.
      </p>
    </div>
  );
}
