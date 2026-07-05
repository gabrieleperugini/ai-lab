import type { PollConfig } from "../../lib/types";
import type { ClassroomMode } from "../../lib/classMode";

/**
 * Shows the external poll link (Slido/Mentimeter/Forms/any URL) for the
 * student's class. Falls back to a clean placeholder when unconfigured.
 * Poll URLs live in the module definitions (src/content/<day>/modules.ts).
 */
export function PollPanel({ poll, mode }: { poll?: PollConfig; mode: ClassroomMode }) {
  if (!poll) return null;

  const url =
    mode.classId === "B" ? poll.classBUrl : mode.classId === "A" ? poll.classAUrl : undefined;
  const bothUrls = !mode.classId && (poll.classAUrl || poll.classBUrl);

  return (
    <div className="panel tight pollPanel">
      <div className="panelTitle">Live poll</div>
      <p style={{ fontSize: 15, fontWeight: 600 }}>{poll.question}</p>
      {url ? (
        <div className="controlRow" style={{ marginTop: 10 }}>
          <a className="btn accent small" href={url} target="_blank" rel="noreferrer">
            Open the class {mode.classId} poll ↗
          </a>
        </div>
      ) : bothUrls ? (
        <div className="controlRow" style={{ marginTop: 10 }}>
          {poll.classAUrl && (
            <a className="btn accent small" href={poll.classAUrl} target="_blank" rel="noreferrer">
              Class A poll ↗
            </a>
          )}
          {poll.classBUrl && (
            <a className="btn accent small" href={poll.classBUrl} target="_blank" rel="noreferrer">
              Class B poll ↗
            </a>
          )}
        </div>
      ) : (
        <p className="pollPlaceholder">
          Live poll not configured yet. Ask your instructor for the QR code.
        </p>
      )}
    </div>
  );
}
