import { useEffect, useState } from "react";
import { nextTokenRounds } from "../../content/day1-llm/nextTokenExamples";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import type { ModuleComponentProps } from "../../lib/moduleProps";

export default function NextTokenArena({ onResult, resetSignal }: ModuleComponentProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const round = nextTokenRounds[roundIndex];
  const best = Object.entries(round.probabilities)
    .filter(([k]) => k !== "other")
    .sort((a, b) => b[1] - a[1])[0][0];

  useEffect(() => {
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
          Round <span className="statValue">{roundIndex + 1}</span> / {nextTokenRounds.length}
        </span>
        <span className="statPill">📚 {round.category}</span>
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
          {selected === null && <span className="hintText">Pick a token first — trust your gut.</span>}
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
        <button
          className="btn primary"
          onClick={() => goTo((roundIndex + 1) % nextTokenRounds.length)}
        >
          Next example →
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            let r = roundIndex;
            while (r === roundIndex && nextTokenRounds.length > 1) {
              r = Math.floor(Math.random() * nextTokenRounds.length);
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
