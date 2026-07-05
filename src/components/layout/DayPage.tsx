import { getDay } from "../../content/days";
import { day1Timeline } from "../../content/day1-llm/modules";
import type { ClassroomMode } from "../../lib/classMode";

export function DayPage({ dayId, mode }: { dayId: string; mode: ClassroomMode }) {
  const day = getDay(dayId);
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
        {day.modules.map((m, i) => (
          <a className="moduleCard" key={m.id} href={`#/${day.id}/${m.id}`}>
            <div className="modTop">
              <span className="modId">M{i + 1}</span>
              <span className={`levelTag ${m.level}`}>{m.level}</span>
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
            Guidance for instructors — modules slot in between the lecture slides. Visible in
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
