/** Compact challenge cards shared by the Learning Machines modules. A card
 * can carry a live `done` flag so students see a badge when the goal is met. */

export type Challenge = {
  id: string;
  title: string;
  goal: string;
  done?: boolean;
};

export function ChallengeCards({ challenges }: { challenges: Challenge[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
      {challenges.map((c, i) => (
        <div
          key={c.id}
          style={{
            background: c.done ? "var(--green-soft)" : "var(--paper-2)",
            border: `1.5px solid ${c.done ? "var(--green)" : "var(--line)"}`,
            borderRadius: 12,
            padding: "10px 14px"
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 14 }}>
            {c.done ? "✅" : "🎯"} {i + 1}. {c.title}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 4 }}>{c.goal}</div>
        </div>
      ))}
    </div>
  );
}
