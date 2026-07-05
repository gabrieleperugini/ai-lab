import type { ReactNode } from "react";
import type { ClassroomMode } from "../../lib/classMode";

export function AppShell({ mode, children }: { mode: ClassroomMode; children: ReactNode }) {
  return (
    <div className="appShell">
      <header className="topBar">
        <a className="brand" href="#/">
          <span aria-hidden="true">🔮</span> AI Lab
          <span className="brandTag">Bocconi Summer School</span>
        </a>
        <div className="spacer" />
        {mode.classId && (
          <span className={`badge class${mode.classId}`}>Class {mode.classId}</span>
        )}
        {mode.isTeacher && <span className="badge teacher">Teacher mode</span>}
      </header>
      <main className="pageBody">{children}</main>
      <footer className="footer">
        AI Lab · Machine Learning &amp; AI Summer School · everything runs in your browser — no
        account, no data collected
      </footer>
    </div>
  );
}
