import { Suspense, useState } from "react";
import { getAdjacentModules, getDay, getModule, visibleModules } from "../../content/days";
import { moduleRegistry } from "../../modules/registry";
import { labConfig } from "../../content/config";
import type { ClassroomMode } from "../../lib/classMode";
import { ReflectionBox } from "../classroom/ReflectionBox";
import { PollPanel } from "../classroom/PollPanel";
import { SectionLocked } from "./DayPage";

export function ModulePage({
  dayId,
  moduleId,
  extra,
  mode
}: {
  dayId: string;
  moduleId: string;
  extra?: string;
  mode: ClassroomMode;
}) {
  const day = getDay(dayId);
  const module = getModule(dayId, moduleId);
  const [observedResult, setObservedResult] = useState<string>("");
  const [resetSignal, setResetSignal] = useState(0);
  const [showNotice, setShowNotice] = useState(false);

  if (labConfig.lockedDayIds.includes(dayId) && !mode.isTeacher) {
    return <SectionLocked />;
  }
  if (!day || !module) {
    return (
      <div className="fadeIn">
        <h1>Module not found</h1>
        <p style={{ marginTop: 12 }}>
          <a href="#/">← Back to the AI Lab home</a>
        </p>
      </div>
    );
  }

  const Component = moduleRegistry[module.component];
  const { prev, next } = getAdjacentModules(dayId, moduleId);
  const moduleIndex = visibleModules(day).findIndex((m) => m.id === moduleId) + 1;

  const componentNode = Component ? (
    <Suspense
      fallback={
        <div className="panel" style={{ textAlign: "center", color: "var(--ink-faint)" }}>
          Loading the lab bench…
        </div>
      }
    >
      <Component
        module={module}
        mode={mode}
        onResult={setObservedResult}
        resetSignal={resetSignal}
        initialArg={extra}
      />
    </Suspense>
  ) : (
    <div className="panel">Unknown module component: {module.component}</div>
  );

  const takeawayPanel = (
    <div className="panel takeawayPanel">
      <div className="panelTitle">Takeaway</div>
      <p className="takeawayText">{module.takeaway}</p>
    </div>
  );

  const sidePanels = (
    <>
      <div className="panel tight">
        <div className="panelTitle">What to do</div>
        <ol className="instructionsList">
          {module.studentInstructions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      <PollPanel poll={module.poll} mode={mode} />

      <ReflectionBox module={module} mode={mode} observedResult={observedResult} />

      {mode.isTeacher && module.teacherNotes && (
        <div className="panel tight teacherPanel">
          <div className="panelTitle">🧑‍🏫 Teacher notes</div>
          <ul>
            {module.teacherNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  return (
    <div className="modulePage fadeIn" key={module.id}>
      <div>
        <span className="eyebrow">
          <a href={`#/${day.id}`} style={{ color: "inherit", textDecoration: "none" }}>
            Day {day.index}
          </a>{" "}
          · {moduleIndex > 0 ? `Module ${moduleIndex}` : "Hidden module"} · ~
          {module.durationMin} min
        </span>
        <div className="moduleHeader">
          <div>
            <h1>{module.title}</h1>
            <p className="modSubtitle">{module.subtitle}</p>
          </div>
          <div className="controlRow">
            <button className="btn subtle small" onClick={() => setShowNotice((s) => !s)}>
              {showNotice ? "Hide" : "💡 What should I notice?"}
            </button>
            <button
              className="btn subtle small"
              onClick={() => {
                setResetSignal((n) => n + 1);
                setObservedResult("");
              }}
            >
              ↺ Reset module
            </button>
          </div>
        </div>
      </div>

      <div className="missionCard">
        <div className="missionLabel">Your mission</div>
        <p className="missionText">{module.mission}</p>
      </div>

      {showNotice && (
        <div className="panel noticePanel fadeIn">
          <div className="panelTitle">What should I notice?</div>
          <ul>
            {module.noticePoints.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {module.wide ? (
        <>
          {componentNode}
          {takeawayPanel}
          <div className="wideSidePanels">{sidePanels}</div>
        </>
      ) : (
        <div className="moduleLayout">
          <div className="mainColumn">
            {componentNode}
            {takeawayPanel}
          </div>
          <aside className="sideColumn">{sidePanels}</aside>
        </div>
      )}

      <nav className="moduleNav">
        {prev ? (
          <a href={`#/${day.id}/${prev.id}`}>
            <span className="navDir">← Previous</span>
            <span className="navTitle">{prev.title}</span>
          </a>
        ) : (
          <a href={`#/${day.id}`}>
            <span className="navDir">← Back</span>
            <span className="navTitle">Day {day.index} overview</span>
          </a>
        )}
        {next ? (
          <a href={`#/${day.id}/${next.id}`} style={{ textAlign: "right" }}>
            <span className="navDir">Next →</span>
            <span className="navTitle">{next.title}</span>
          </a>
        ) : (
          <a href={`#/${day.id}`} style={{ textAlign: "right" }}>
            <span className="navDir">Done →</span>
            <span className="navTitle">Back to Day {day.index}</span>
          </a>
        )}
      </nav>
    </div>
  );
}
