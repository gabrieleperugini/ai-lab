import { useEffect, useMemo, useState } from "react";
import { m1Data, DEFAULT_MODEL } from "../../content/models";
import type { ModelKey } from "../../content/models";
import { nextTokenRounds } from "../../content/day1-llm/nextTokenExamples";
import { labConfig } from "../../content/config";
import { ProbabilityBars } from "../../components/viz/ProbabilityBars";
import { ModelPicker } from "../../components/controls/ModelPicker";
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
  link?: { module: string; label: string } | null;
};

/** URL slugs for deep links from the slides: #/day1/next-token-arena/<slug> */
const CATEGORY_SLUGS: Record<string, string> = {
  "Basics: familiar phrases and facts": "basics",
  "Context: one word, two worlds": "context",
  "The suitcase problem": "suitcase",
  "World knowledge": "world-knowledge",
  "Probability and branching": "probability",
  "Reasoning steps": "reasoning"
};

/** Bridge buttons to the companion module of each Arena stop (v2 slides). */
const CATEGORY_BRIDGES: Record<string, { href: string; label: string }> = {
  "Context: one word, two worlds": {
    href: "#/day1/context-lens",
    label: "Open Context Lens"
  },
  "The suitcase problem": {
    href: "#/day1/context-lens",
    label: "Open Context Lens"
  },
  "Probability and branching": {
    href: "#/day1/branching-stories",
    label: "Open Branching Stories"
  },
  "Reasoning steps": {
    href: "#/day1/reasoning-demo",
    label: "Open the Reasoning Demo"
  }
};

function generatedRounds(data: GenM1): Round[] {
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
    link: ex.link
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

export default function NextTokenArena({ onResult, resetSignal, initialArg }: ModuleComponentProps) {
  const initialCategory = useMemo(() => {
    if (!initialArg) return "all";
    const hit = Object.entries(CATEGORY_SLUGS).find(([, slug]) => slug === initialArg);
    return hit ? hit[0] : "all";
  }, [initialArg]);

  const [modelKey, setModelKey] = useState<ModelKey>(DEFAULT_MODEL);
  const [category, setCategory] = useState<string>(initialCategory);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Example ids and order are identical across models, so switching the
  // model keeps the same round on screen and just swaps the numbers.
  const rounds = useMemo(
    () =>
      labConfig.useGeneratedProbabilities ? generatedRounds(m1Data[modelKey]) : handmadeRounds(),
    [modelKey]
  );
  const modelName = labConfig.useGeneratedProbabilities
    ? m1Data[modelKey].model
    : "teaching distribution";

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(rounds.map((r) => r.category)))],
    [rounds]
  );
  const filtered = useMemo(
    () => (category === "all" ? rounds : rounds.filter((r) => r.category === category)),
    [category, rounds]
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
    setCategory(initialCategory);
    setRoundIndex(0);
    setSelected(null);
    setRevealed(false);
  }, [resetSignal, initialCategory]);

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
        {labConfig.useGeneratedProbabilities && (
          <ModelPicker value={modelKey} onChange={setModelKey} />
        )}
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
          {round.link && (
            <div className="controlRow" style={{ marginTop: 12 }}>
              <a className="btn ghost small" href={`#/day1/${round.link.module}`}>
                🔗 {round.link.label}
              </a>
            </div>
          )}
        </div>
      )}

      <hr className="divider" />

      <div className="controlRow" style={{ justifyContent: "space-between" }}>
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
        {CATEGORY_BRIDGES[round.category] && (
          <a className="btn accent small" href={CATEGORY_BRIDGES[round.category].href}>
            {CATEGORY_BRIDGES[round.category].label} →
          </a>
        )}
      </div>
    </div>
  );
}
