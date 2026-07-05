import { useEffect, useMemo, useState } from "react";
import generatedData from "../../content/generated/day1/m1_next_token.json";
import { nextTokenRounds } from "../../content/day1-llm/nextTokenExamples";
import { labConfig } from "../../content/config";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import type { GenM1 } from "../../lib/generated";
import type { ModuleComponentProps } from "../../lib/moduleProps";

type Round = {
  id: string;
  category: string;
  prompt: string;
  /** Ordered by descending probability; chips and bars share this order. */
  options: { label: string; probability: number; fromModel?: boolean; multiToken?: boolean }[];
  other: number;
  explanation: string;
  takeaway: string;
  branchingLink?: boolean;
};

function generatedRounds(): Round[] {
  const data = generatedData as GenM1;
  return data.examples.map((ex) => ({
    id: ex.id,
    category: ex.category,
    prompt: ex.prompt,
    options: ex.options.map((o) => ({
      label: o.label,
      probability: o.probability,
      fromModel: o.fromModel,
      multiToken: o.multiToken
    })),
    other: ex.other,
    explanation: ex.explanation,
    takeaway: ex.takeaway,
    branchingLink: ex.branchingLink
  }));
}

/** Fallback: hand-made v1 rounds adapted to the same shape (labConfig switch). */
function handmadeRounds(): Round[] {
  return nextTokenRounds
    .filter((r) => r.category !== "style")
    .map((r) => {
      const entries = Object.entries(r.probabilities).filter(([k]) => k !== "other");
      entries.sort((a, b) => b[1] - a[1]);
      return {
        id: r.id,
        category: r.category,
        prompt: r.prompt,
        options: entries.map(([label, probability]) => ({ label, probability })),
        other: r.probabilities.other ?? 0,
        explanation: r.explanation,
        takeaway: r.takeaway
      };
    });
}

const rounds: Round[] = labConfig.useGeneratedProbabilities ? generatedRounds() : handmadeRounds();
const modelName = labConfig.useGeneratedProbabilities ? (generatedData as GenM1).model : "teaching distribution";

export default function NextTokenArena({ onResult, resetSignal }: ModuleComponentProps) {
  const [category, setCategory] = useState<string>("all");
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(rounds.map((r) => r.category)))],
    []
  );
  const filtered = useMemo(
    () => (category === "all" ? rounds : rounds.filter((r) => r.category === category)),
    [category]
  );
  const round = filtered[Math.min(roundIndex, filtered.length - 1)];

  const barOrder = [...round.options.map((o) => o.label), "other"];
  const distribution = Object.fromEntries([
    ...round.options.map((o) => [o.label, o.probability] as [string, number]),
    ["other", round.other]
  ]);
  const best = round.options[0]?.label;
  const anyMulti = round.options.some((o) => o.multiToken);

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
        Round <span className="statValue">{Math.min(roundIndex, filtered.length - 1) + 1}</span> /{" "}
          {filtered.length}
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
        {round.options.map((o) => (
          <button
            key={o.label}
            className={
              "choiceChip" +
              (selected === o.label ? " selected" : "") +
              (revealed && o.label === best ? " revealed-best" : "")
            }
            onClick={() => choose(o.label)}
          >
            {o.label}
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
          <div className="panelTitle">
            Next-token probabilities ({modelName})
          </div>
          <ProbabilityBars
            distribution={distribution}
            order={barOrder}
            revealed={revealed}
            highlight={selected}
          />
          <p className="hintText" style={{ marginTop: 8 }}>
            {round.options.some((o) => o.fromModel) &&
              "Options we did not offer but the model ranks high were added to the list. "}
            {anyMulti && "Some options are several tokens long; their bar shows the whole-phrase probability. "}
            'other' is everything else in the model's vocabulary.
          </p>
          <div className="revealBox" style={{ marginTop: 12 }}>
            <strong>Why:</strong> {round.explanation}
            <br />
            <strong>Idea:</strong> {round.takeaway}
          </div>
          {round.branchingLink && (
            <div className="controlRow" style={{ marginTop: 12 }}>
              <a className="btn ghost small" href="#/day1/branching-stories">
                🌿 Explore branching: see how this choice changes the future
              </a>
            </div>
          )}
        </div>
      )}

      <hr className="divider" />

      <div className="controlRow">
        <button className="btn primary" onClick={() => goTo((roundIndex + 1) % filtered.length)}>
          Next example →
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            let r = roundIndex;
            while (r === roundIndex && filtered.length > 1) {
              r = Math.floor(Math.random() * filtered.length);
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
