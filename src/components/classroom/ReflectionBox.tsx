import { useState } from "react";
import type { LabModule } from "../../lib/types";
import type { ClassroomMode } from "../../lib/classMode";

type ReflectionBoxProps = {
  module: LabModule;
  mode: ClassroomMode;
  /** Optional short description of the group's current result/observation,
   * provided by the module (e.g. "chose 'time', 78% agreed"). */
  observedResult?: string;
};

/**
 * Local-only reflection: groups type an answer, then copy a formatted
 * submission card to the clipboard and paste it into the class form/chat.
 * Nothing is sent anywhere by the app itself.
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
      // Clipboard API can fail on http or older browsers: fall back.
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
      <div className="panelTitle">Your reflection</div>
      {module.reflectionQuestions.map((q, i) => (
        <p className="reflectionQuestion" key={i}>
          {i + 1}. {q}
        </p>
      ))}
      <label htmlFor={`group-${module.id}`}>Group name or number</label>
      <input
        id={`group-${module.id}`}
        type="text"
        value={groupName}
        placeholder="e.g. Group 7, The Lions"
        onChange={(e) => setGroupName(e.target.value)}
      />
      <label htmlFor={`refl-${module.id}`}>Your answer</label>
      <textarea
        id={`refl-${module.id}`}
        rows={3}
        value={reflection}
        placeholder="Write your group's answer here..."
        onChange={(e) => setReflection(e.target.value)}
      />
      <div className="controlRow" style={{ marginTop: 12 }}>
        <button className="btn primary small" onClick={copy}>
          📋 Copy reflection
        </button>
        {copied && <span className="copiedFlash">Copied! Paste it into the class form.</span>}
      </div>
    </div>
  );
}
