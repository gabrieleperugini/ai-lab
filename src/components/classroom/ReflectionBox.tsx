import { useState } from "react";
import type { LabModule } from "../../lib/types";
import type { ClassroomMode } from "../../lib/classMode";
import { labConfig } from "../../content/config";

type ReflectionBoxProps = {
  module: LabModule;
  mode: ClassroomMode;
  /** Optional short description of the group's current result/observation,
   * provided by the module (e.g. "chose 'time', 78% agreed"). */
  observedResult?: string;
};

/**
 * Local-only reflection: groups discuss and can type notes for themselves.
 * Nothing is sent or collected anywhere.
 * When labConfig.enableSubmissions is true, a copy-to-clipboard submission
 * card (class, group, module, result, reflection) is offered so answers can
 * be pasted into an external form; disabled for now.
 */
export function ReflectionBox({ module, mode, observedResult }: ReflectionBoxProps) {
  const [groupName, setGroupName] = useState("");
  const [reflection, setReflection] = useState("");
  const [copied, setCopied] = useState(false);

  const buildCard = () => {
    const lines = [
      `📋 AI Lab submission`,
      `Class: ${mode.classId ?? "-"}`,
      `Group: ${groupName || "-"}`,
      `Module: ${module.id} (${module.title})`,
      observedResult ? `Result: ${observedResult}` : null,
      `Reflection: ${reflection || "-"}`
    ].filter(Boolean);
    return lines.join("\n");
  };

  const copy = async () => {
    const text = buildCard();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="panel tight reflectionBox">
      <div className="panelTitle">Discuss in your group</div>
      {module.reflectionQuestions.map((q, i) => (
        <p className="reflectionQuestion" key={i}>
          {i + 1}. {q}
        </p>
      ))}
      <label htmlFor={`refl-${module.id}`}>Notes (stay on this device only)</label>
      <textarea
        id={`refl-${module.id}`}
        rows={3}
        value={reflection}
        placeholder="Optional: jot down your group's thoughts..."
        onChange={(e) => setReflection(e.target.value)}
      />
      {labConfig.enableSubmissions && (
        <>
          <label htmlFor={`group-${module.id}`}>Group name or number</label>
          <input
            id={`group-${module.id}`}
            type="text"
            value={groupName}
            placeholder="e.g. Group 7, The Lions"
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="controlRow" style={{ marginTop: 12 }}>
            <button className="btn primary small" onClick={copy}>
              📋 Copy reflection
            </button>
            {copied && <span className="copiedFlash">Copied! Paste it into the class form.</span>}
          </div>
        </>
      )}
    </div>
  );
}
