import { getDay, visibleModules } from "../../content/days";
import { day1Timeline } from "../../content/day1-llm/modules";
import { labConfig } from "../../content/config";
import type { ClassroomMode } from "../../lib/classMode";

export function SectionLocked() {
  return (
    <div className="fadeIn" style={{ textAlign: "center", padding: "60px 0" }}>
      <div className="bigEmoji">🔒</div>
      <h1 style={{ marginTop: 12, color: "var(--blue)" }}>This section opens later</h1>
      <p style={{ marginTop: 10, color: "var(--ink-soft)" }}>
        Today we are working on another part of the lab. Ask your instructor!
      </p>
      <p style={{ marginTop: 18 }}>
        <a className="btn primary" href="#/">
          ← Back to the lab home
        </a>
      </p>
    </div>
  );
}

export function DayPage({ dayId, mode }: { dayId: string; mode: ClassroomMode }) {
  const day = getDay(dayId);
  if (labConfig.lockedDayIds.includes(dayId) && !mode.isTeacher) {
    return <SectionLocked />;
  }
  if (!day) {
    return (
      <div className="fadeIn">
        <h1>Day not found</h1>
        <p style={{ marginTop: 12 }}>
          <a href="#/">← Back to the AI Lab home</a>
        </p>
      </div>
    );
  }

  return (
    <div className="fadeIn">
      <div className="dayHeader">
        <span className="eyebrow">Day {day.index}</span>
        <h1>{day.title}</h1>
        <p className="narrative">{day.narrative}</p>
      </div>

      <div className="moduleGrid">
        {(mode.isTeacher ? day.modules : visibleModules(day)).map((m, i) => (
          <a
            className="moduleCard"
            key={m.id}
            href={`#/${day.id}/${m.id}`}
            style={m.hidden ? { opacity: 0.55 } : undefined}
          >
            <div className="modTop">
              <span className="modId">{m.hidden ? "—" : `M${i + 1}`}</span>
              <span className={`levelTag ${m.level}`}>{m.hidden ? "hidden" : m.level}</span>
            </div>
            <h3>{m.title}</h3>
            <p className="modSub">{m.subtitle}</p>
            <div className="modMeta">
              <span>⏱ ~{m.durationMin} min</span>
              <span>{m.placeholder ? "coming soon" : "Start →"}</span>
            </div>
          </a>
        ))}
      </div>

      {day.id === "day1" && mode.isTeacher && (
        <section className="timelinePanel">
          <h2>Suggested Day 1 timeline</h2>
          <p className="tlNote">
            Guidance for instructors: modules slot in between the lecture slides. Visible in
            teacher mode only.
          </p>
          {day1Timeline.map((s) => (
            <div className="timelineSession" key={s.title}>
              <div className="tlTitle">{s.title}</div>
              <ul>
                {s.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
