import { useEffect, useMemo, useState } from "react";
import { nextTokenRounds } from "../../content/day1-llm/nextTokenExamples";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import type { ModuleComponentProps } from "../../lib/moduleProps";

export default function NextTokenArena({ onResult, resetSignal }: ModuleComponentProps) {
  const [category, setCategory] = useState<string>("all");
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(nextTokenRounds.map((r) => r.category)))],
    []
  );
  const rounds = useMemo(
    () => (category === "all" ? nextTokenRounds : nextTokenRounds.filter((r) => r.category === category)),
    [category]
  );
  const round = rounds[Math.min(roundIndex, rounds.length - 1)];
  const best = Object.entries(round.probabilities)
    .filter(([k]) => k !== "other")
    .sort((a, b) => b[1] - a[1])[0][0];

  useEffect(() => {
    setCategory("all");
    setRoundIndex(0);
    setSelected(null);
    setRevealed(false);
  }, [resetSignal]);

  const goTo = (index: number) => {
    setRoundIndex(index);
    setSelected(null);
    setRevealed(false);
  };

  const choose = (token: string) => {
    if (revealed) return;
    setSelected(token);
    onResult(`round '${round.id}': chose '${token}'`);
  };

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 18 }}>
        <span className="statPill">
          Round <span className="statValue">{Math.min(roundIndex, rounds.length - 1) + 1}</span> /{" "}
          {rounds.length}
        </span>
        <label className="statPill" style={{ gap: 8 }}>
          📚
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              goTo(0);
            }}
            aria-label="Filter rounds by category"
            style={{
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 14.5,
              fontWeight: 700,
              color: "var(--blue)",
              cursor: "pointer"
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "all categories" : c}
              </option>
            ))}
          </select>
        </label>
        <span className="statPill">🏷 {round.category}</span>
      </div>

      <p className="promptDisplay">
        {round.prompt} <span className="blank">{revealed && selected ? selected : "____"}</span>
      </p>

      <div className="controlRow" style={{ marginTop: 22 }}>
        {round.choices.map((c) => (
          <button
            key={c}
            className={
              "choiceChip" +
              (selected === c ? " selected" : "") +
              (revealed && c === best ? " revealed-best" : "")
            }
            onClick={() => choose(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <hr className="divider" />

      {!revealed ? (
        <div className="controlRow">
          <button
            className="btn accent"
            disabled={selected === null}
            onClick={() => setRevealed(true)}
          >
            🎲 Reveal probabilities
          </button>
          {selected === null && <span className="hintText">Pick a token first. Trust your gut.</span>}
        </div>
      ) : (
        <div className="fadeIn">
          <div className="panelTitle">Model-like probabilities (teaching distribution)</div>
          <ProbabilityBars
            distribution={round.probabilities}
            revealed={revealed}
            highlight={selected}
          />
          <div className="revealBox" style={{ marginTop: 16 }}>
            <strong>Why:</strong> {round.explanation}
            <br />
            <strong>Idea:</strong> {round.takeaway}
          </div>
        </div>
      )}

      <hr className="divider" />

      <div className="controlRow">
        <button className="btn primary" onClick={() => goTo((roundIndex + 1) % rounds.length)}>
          Next example →
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            let r = roundIndex;
            while (r === roundIndex && rounds.length > 1) {
              r = Math.floor(Math.random() * rounds.length);
            }
            goTo(r);
          }}
        >
          🎰 Random example
        </button>
      </div>
    </div>
  );
}
