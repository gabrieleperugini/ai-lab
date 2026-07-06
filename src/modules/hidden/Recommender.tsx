import { useEffect, useMemo, useState } from "react";
import { movies, FEATURE_LABELS } from "../../content/hidden-structure/movies";
import type { Movie } from "../../content/hidden-structure/movies";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Slider } from "../../components/controls/Slider";
import { makeRng } from "../../lib/learning/rng";
import type { ModuleComponentProps } from "../../lib/moduleProps";

type Rating = 1 | -1;

const FEATURES = Object.keys(FEATURE_LABELS);

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na < 1e-12 || nb < 1e-12 ? 0 : dot / Math.sqrt(na * nb);
}

function vec(m: Movie): number[] {
  return FEATURES.map((f) => m.features[f]);
}

export default function Recommender({ onResult, resetSignal }: ModuleComponentProps) {
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [popBoost, setPopBoost] = useState(0);
  const [divBoost, setDivBoost] = useState(0);
  const [explore, setExplore] = useState(0);
  const [exploreSeed, setExploreSeed] = useState(1);

  useEffect(() => {
    setRatings({});
    setPopBoost(0);
    setDivBoost(0);
    setExplore(0);
    setExploreSeed(1);
  }, [resetSignal]);

  const liked = movies.filter((m) => ratings[m.id] === 1);
  const disliked = movies.filter((m) => ratings[m.id] === -1);
  const unseen = movies.filter((m) => ratings[m.id] === undefined);

  const tasteVector = useMemo(() => {
    const avg = (list: Movie[]) => {
      const v = new Array(FEATURES.length).fill(0);
      for (const m of list) vec(m).forEach((x, i) => (v[i] += x / list.length));
      return v;
    };
    if (liked.length === 0 && disliked.length === 0) return null;
    const pos = liked.length ? avg(liked) : new Array(FEATURES.length).fill(0);
    const neg = disliked.length ? avg(disliked) : new Array(FEATURES.length).fill(0);
    return pos.map((p, i) => p - neg[i]);
  }, [liked, disliked]);

  const tasteSummary = useMemo(() => {
    if (!tasteVector) return null;
    return tasteVector
      .map((v, i) => ({ f: FEATURES[i], v }))
      .filter((x) => x.v > 0.15)
      .sort((a, b) => b.v - a.v)
      .slice(0, 3)
      .map((x) => FEATURE_LABELS[x.f]);
  }, [tasteVector]);

  const recommendations = useMemo(() => {
    if (!tasteVector) return [];
    let scored = unseen.map((m) => ({
      m,
      score: cosine(tasteVector, vec(m)) + popBoost * (m.popularity - 0.5)
    }));
    scored.sort((a, b) => b.score - a.score);

    // diversity boost: greedy pick penalizing similarity to already-picked recs
    if (divBoost > 0) {
      const picked: typeof scored = [];
      const pool = [...scored];
      while (picked.length < 5 && pool.length > 0) {
        let bestIdx = 0;
        let bestVal = -Infinity;
        pool.forEach((cand, i) => {
          const sim = picked.length
            ? Math.max(...picked.map((p) => cosine(vec(p.m), vec(cand.m))))
            : 0;
          const val = cand.score - divBoost * sim;
          if (val > bestVal) {
            bestVal = val;
            bestIdx = i;
          }
        });
        picked.push(pool.splice(bestIdx, 1)[0]);
      }
      scored = [...picked, ...pool];
    }

    let top = scored.slice(0, 5);

    // explore: swap in surprising items from further down the list
    if (explore > 0) {
      const rng = makeRng(exploreSeed * 907);
      const nSwap = Math.round(explore * 2.5); // up to ~2-3 wildcards
      for (let s = 0; s < nSwap && scored.length > 5; s++) {
        const fromTail = scored[5 + Math.floor(rng() * (scored.length - 5))];
        const idx = 4 - s;
        if (idx >= 0 && !top.includes(fromTail)) top[idx] = { ...fromTail, score: fromTail.score };
      }
    }
    return top;
  }, [tasteVector, unseen, popBoost, divBoost, explore, exploreSeed]);

  const explain = (m: Movie): string => {
    if (liked.length === 0) return "based on avoiding what you disliked";
    const best = liked
      .map((l) => ({ l, sim: cosine(vec(l), vec(m)) }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 2);
    const shared = FEATURES.filter(
      (f) => m.features[f] > 0.5 && best.some(({ l }) => l.features[f] > 0.5)
    )
      .slice(0, 3)
      .map((f) => FEATURE_LABELS[f]);
    return `because you liked ${best.map((b) => b.l.title).join(" and ")}${shared.length ? `. Shared: ${shared.join(", ")}` : ""}`;
  };

  useEffect(() => {
    onResult(
      `${liked.length} likes, ${disliked.length} dislikes${tasteSummary?.length ? `; taste: ${tasteSummary.join(", ")}` : ""}; top rec: ${recommendations[0]?.m.title ?? "none"}`
    );
  }, [liked.length, disliked.length, tasteSummary, recommendations, onResult]);

  // filter bubble heuristic: all top recs share one dominant feature
  const bubble = useMemo(() => {
    if (recommendations.length < 4) return null;
    for (const f of FEATURES) {
      if (recommendations.every((r) => r.m.features[f] > 0.45)) return FEATURE_LABELS[f];
    }
    return null;
  }, [recommendations]);

  const rate = (id: string, r: Rating | 0) => {
    setRatings((prev) => {
      const next = { ...prev };
      if (r === 0) delete next[id];
      else next[id] = r;
      return next;
    });
    setExploreSeed((s) => s + 1);
  };

  return (
    <div className="panel">
      <div className="ctxGrid" style={{ gridTemplateColumns: "1.15fr 1fr", alignItems: "start" }}>
        {/* catalog */}
        <div className="vizStage" style={{ padding: 12, maxHeight: 460, overflowY: "auto" }}>
          <div className="panelTitle">The catalog · rate a few</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {movies.map((m) => {
              const r = ratings[m.id];
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: r === 1 ? "var(--green-soft)" : r === -1 ? "var(--red-soft)" : "#fff",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: "6px 10px"
                  }}
                >
                  <span style={{ fontSize: 20 }}>{m.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 750, fontSize: 13.5 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{m.blurb}</div>
                  </div>
                  <button className="btn subtle small" style={{ padding: "4px 9px", opacity: r === 1 ? 1 : 0.55 }} onClick={() => rate(m.id, r === 1 ? 0 : 1)} aria-label={`Like ${m.title}`}>
                    👍
                  </button>
                  <button className="btn subtle small" style={{ padding: "4px 9px", opacity: r === -1 ? 1 : 0.55 }} onClick={() => rate(m.id, r === -1 ? 0 : -1)} aria-label={`Dislike ${m.title}`}>
                    👎
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* taste + recommendations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div className="vizStage" style={{ padding: 14 }}>
            <div className="panelTitle">Your taste vector</div>
            {tasteSummary === null ? (
              <p className="hintText">Rate something! The system turns your likes and dislikes into a vector of feature preferences.</p>
            ) : (
              <>
                <p style={{ fontSize: 14.5, fontWeight: 700 }}>
                  Your current taste leans toward: {tasteSummary.length ? tasteSummary.join(", ") : "nothing clear yet"}.
                </p>
                {tasteVector && (
                  <div style={{ marginTop: 8 }}>
                    {tasteVector
                      .map((v, i) => ({ f: FEATURES[i], v }))
                      .sort((a, b) => Math.abs(b.v) - Math.abs(a.v))
                      .slice(0, 5)
                      .map(({ f, v }) => (
                        <div key={f} style={{ display: "grid", gridTemplateColumns: "94px 1fr", gap: 8, fontSize: 12, alignItems: "center", padding: "1.5px 0" }}>
                          <span style={{ color: "var(--ink-soft)" }}>{FEATURE_LABELS[f]}</span>
                          <div className="probTrack" style={{ height: 10 }}>
                            <div className={v >= 0 ? "probFill picked" : "probFill muted"} style={{ width: `${Math.min(Math.abs(v), 1) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="vizStage" style={{ padding: 14 }}>
            <div className="panelTitle">Recommended for you</div>
            {recommendations.length === 0 ? (
              <p className="hintText">No recommendations yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {recommendations.map(({ m }) => (
                  <div key={m.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: "6px 10px" }}>
                    <div style={{ fontWeight: 750, fontSize: 13.5 }}>
                      {m.emoji} {m.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>Recommended {explain(m)}</div>
                  </div>
                ))}
              </div>
            )}
            {bubble && (
              <p className="warnText" style={{ marginTop: 10, fontSize: 13 }}>
                🫧 Filter bubble: every recommendation is {bubble}. Try the diversity or explore knobs!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="controlRow" style={{ marginTop: 14, alignItems: "flex-end" }}>
        <Slider label="Popularity boost" value={popBoost} min={0} max={1} step={0.1} onChange={setPopBoost} format={(v) => v.toFixed(1)} lowHint="personal" highHint="mainstream" />
        <Slider label="Diversity boost" value={divBoost} min={0} max={1} step={0.1} onChange={setDivBoost} format={(v) => v.toFixed(1)} lowHint="similar picks" highHint="varied picks" />
        <Slider label="Explore vs exploit" value={explore} min={0} max={1} step={0.1} onChange={setExplore} format={(v) => v.toFixed(1)} lowHint="safe" highHint="surprising" />
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "cold-start",
            title: "Cold start",
            goal: "Rate exactly 3 items you would genuinely like. Are the recommendations already decent?",
            done: liked.length >= 3 && recommendations.length > 0
          },
          {
            id: "bubble",
            title: "Filter bubble",
            goal: "Like only one type of item (say, all the sci-fi). Watch the bubble warning appear.",
            done: bubble !== null
          },
          {
            id: "escape",
            title: "Escape the bubble",
            goal: "With a bubble active, raise diversity or explore until the recommendations open up.",
            done: false
          },
          {
            id: "popularity",
            title: "Popularity trap",
            goal: "Max the popularity boost. Do the recommendations become less personal?"
          },
          {
            id: "contradiction",
            title: "Contradictory taste",
            goal: "Like both a horror and a family comedy. What does one averaged taste vector do with that?"
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        Recommendation systems often turn people and items into vectors. Then they search for
        nearby things. The choice of features and scoring rule shapes what you see.
      </p>
    </div>
  );
}
