import { days } from "../../content/days";
import { labConfig } from "../../content/config";
import type { ClassroomMode } from "../../lib/classMode";

export function HomePage({ mode }: { mode: ClassroomMode }) {
  return (
    <div className="fadeIn">
      <section className="hero">
        <span className="heroYear">Bocconi Summer School · 2026 edition</span>
        <h1>Machine Learning and Artificial Intelligence Lab</h1>
        <p className="subtitle">Patterns, predictions, and policies</p>
        <p className="heroNote">
          Pick a day, open a module, and start turning knobs. No coding needed. Your curiosity is
          the only requirement.
        </p>
      </section>
      <div className="dayGrid">
        {days.map((day) => {
          const locked = labConfig.lockedDayIds.includes(day.id) && !mode.isTeacher;
          const body = (
            <>
              <span className="dayNumber">Day {day.index}</span>
              <h2>{day.title}</h2>
              <p className="dayDesc">{day.tagline}</p>
              <span className="dayMeta">
                {day.modules.length} modules ·{" "}
                {day.modules.reduce((a, m) => a + m.durationMin, 0)} min of activities
              </span>
              {!day.available && <span className="comingSoonTag">Coming soon</span>}
              {locked && day.available && <span className="comingSoonTag">Opens later</span>}
            </>
          );
          if (locked) {
            return (
              <div
                key={day.id}
                className="dayCard locked"
                style={{ cursor: "default", opacity: 0.55 }}
                aria-disabled="true"
              >
                {body}
              </div>
            );
          }
          return (
            <a
              className={"dayCard" + (day.available ? "" : " locked")}
              key={day.id}
              href={`#/${day.id}`}
            >
              {body}
            </a>
          );
        })}
      </div>
    </div>
  );
}
