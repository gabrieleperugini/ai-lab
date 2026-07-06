import { useEffect, useMemo, useState } from "react";
import { animals, lenses, lensPosition } from "../../content/hidden-structure/animals";
import { Segmented } from "../../components/controls/Segmented";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const W = 720;
const H = 480;

export default function SimilarityLenses({ onResult, resetSignal }: ModuleComponentProps) {
  const [lensId, setLensId] = useState(lenses[0].id);
  const [selected, setSelected] = useState<string | null>(null);
  const [visitedLenses, setVisitedLenses] = useState<Set<string>>(new Set([lenses[0].id]));

  const lens = lenses.find((l) => l.id === lensId)!;

  useEffect(() => {
    setLensId(lenses[0].id);
    setSelected(null);
    setVisitedLenses(new Set([lenses[0].id]));
  }, [resetSignal]);

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const an of animals) map.set(an.name, lensPosition(an, lens));
    return map;
  }, [lens]);

  const px = (x: number) => ((x + 1.15) / 2.3) * (W - 30) + 15;
  const py = (y: number) => H - (((y + 1.15) / 2.3) * (H - 30) + 15);

  const distance = (a: string, b: string) => {
    const pa = positions.get(a)!;
    const pb = positions.get(b)!;
    return Math.hypot(pa.x - pb.x, pa.y - pb.y);
  };

  const whaleShark = distance("Whale", "Shark");
  const whaleDog = distance("Whale", "Dog");
  const batEagle = distance("Bat", "Eagle");
  const batMouse = distance("Bat", "Mouse");

  useEffect(() => {
    onResult(
      `lens '${lens.id}': whale-shark ${whaleShark.toFixed(2)}, whale-dog ${whaleDog.toFixed(2)}${selected ? `, inspecting ${selected}` : ""}`
    );
  }, [lens, whaleShark, whaleDog, selected, onResult]);

  const switchLens = (id: string) => {
    setLensId(id);
    setVisitedLenses((prev) => new Set(prev).add(id));
  };

  const selectedAnimal = animals.find((a) => a.name === selected);

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Lens"
          options={lenses.map((l) => ({ value: l.id, label: `${l.emoji} ${l.label}` }))}
          value={lensId}
          onChange={switchLens}
        />
        <span className="hintText">
          Same animals, different features. Watch them move when you change the lens.
        </span>
      </div>

      <div className="ctxGrid" style={{ gridTemplateColumns: "1fr auto", alignItems: "start" }}>
        <div className="vizStage" style={{ position: "relative" }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Animal similarity map">
            {/* axes labels */}
            <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--ink-faint)">
              {lens.xLabel} →
            </text>
            <text x={14} y={H / 2} fontSize={12.5} fontWeight={700} fill="var(--ink-faint)" transform={`rotate(-90 14 ${H / 2})`} textAnchor="middle">
              {lens.yLabel} →
            </text>

            {animals.map((an) => {
              const p = positions.get(an.name)!;
              const isSel = selected === an.name;
              return (
                <g
                  key={an.name}
                  onClick={() => setSelected(isSel ? null : an.name)}
                  style={{
                    cursor: "pointer",
                    transform: `translate(${px(p.x)}px, ${py(p.y)}px)`,
                    transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  <circle r={isSel ? 17 : 14} fill="#fff" stroke={isSel ? "var(--amber-deep)" : "var(--line)"} strokeWidth={isSel ? 3 : 1.5} />
                  <text textAnchor="middle" dy={5.5} fontSize={15}>
                    {an.emoji}
                  </text>
                  <text textAnchor="middle" dy={26} fontSize={10} fontWeight={700} fill="var(--ink-soft)">
                    {an.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* feature card */}
        <div className="vizStage" style={{ padding: 14, width: 230 }}>
          {selectedAnimal ? (
            <div className="fadeIn">
              <div style={{ fontSize: 26, textAlign: "center" }}>{selectedAnimal.emoji}</div>
              <div style={{ fontWeight: 800, textAlign: "center", marginBottom: 8 }}>{selectedAnimal.name}</div>
              {Object.entries(selectedAnimal.features).map(([f, v]) => (
                <div key={f} style={{ display: "grid", gridTemplateColumns: "1fr 60px", gap: 6, fontSize: 12, padding: "1.5px 0" }}>
                  <span style={{ color: "var(--ink-soft)" }}>{f.split("_").join(" ")}</span>
                  <div className="probTrack" style={{ height: 10 }}>
                    <div className="probFill blue" style={{ width: `${(f === "number_of_legs" ? v / 8 : v) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="hintText">Click an animal to see the numbers behind it. Every animal is really a list of feature values, just like the pixels in Learning Machines.</p>
          )}
        </div>
      </div>

      <div className="controlRow" style={{ marginTop: 12 }}>
        <span className="statPill">whale ↔ shark <span className="statValue">{whaleShark.toFixed(2)}</span></span>
        <span className="statPill">whale ↔ dog <span className="statValue">{whaleDog.toFixed(2)}</span></span>
        <span className="statPill">bat ↔ eagle <span className="statValue">{batEagle.toFixed(2)}</span></span>
        <span className="statPill">bat ↔ mouse <span className="statValue">{batMouse.toFixed(2)}</span></span>
        <span className="hintText">(map distances; smaller = more similar under this lens)</span>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "whale-shark",
            title: "Whale near shark",
            goal: "Find a lens where the whale and the shark are close together.",
            done: whaleShark < 0.45
          },
          {
            id: "whale-dog",
            title: "Whale near dog",
            goal: "Now find a lens where the whale is closer to the dog than to the shark.",
            done: whaleDog < whaleShark
          },
          {
            id: "bat",
            title: "Bat is strange",
            goal: "Find one lens where the bat sits near the birds, and another where it sits near the mammals.",
            done: visitedLenses.has("habitat") && visitedLenses.has("biology") && (batEagle < 0.5 || batMouse < 0.5)
          },
          {
            id: "surprise",
            title: "No perfect map",
            goal: "Find one animal whose position feels wrong to you in some lens. Why does the map disagree with your intuition?"
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        Clustering starts before the algorithm. The representation decides what "similar" means.
      </p>
    </div>
  );
}
