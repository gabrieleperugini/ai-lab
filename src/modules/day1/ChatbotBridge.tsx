import { useEffect, useState } from "react";
import {
  chatbotChallengePrompts,
  externalChatbots
} from "../../content/day1-llm/chatbotChallengePrompts";
import type { ModuleComponentProps } from "../../lib/moduleProps";

export default function ChatbotBridge({ mode, onResult, resetSignal }: ModuleComponentProps) {
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(chatbotChallengePrompts[0].id);
  const [projectorText, setProjectorText] = useState("");

  useEffect(() => {
    setPredictions({});
    setCopiedId(null);
    setOpenCard(chatbotChallengePrompts[0].id);
    setProjectorText("");
  }, [resetSignal]);

  const copyPrompt = async (id: string, prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const setPrediction = (id: string, text: string) => {
    setPredictions((prev) => ({ ...prev, [id]: text }));
    const card = chatbotChallengePrompts.find((c) => c.id === id);
    if (card) onResult(`card '${card.title}': predicted "${text}"`);
  };

  return (
    <div className="panel">
      <div className="controlRow" style={{ marginBottom: 16 }}>
        <span className="panelTitle" style={{ marginBottom: 0 }}>
          Try the prompts in a real chatbot:
        </span>
        {externalChatbots.map((c) => (
          <a key={c.label} className="btn ghost small" href={c.url} target="_blank" rel="noreferrer">
            {c.label} ↗
          </a>
        ))}
        <span className="hintText">…or watch your teacher run them on the projector.</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {chatbotChallengePrompts.map((card, i) => {
          const isOpen = openCard === card.id;
          return (
            <div
              key={card.id}
              className="vizStage"
              style={{ padding: "16px 20px", cursor: isOpen ? "default" : "pointer" }}
              onClick={() => !isOpen && setOpenCard(card.id)}
            >
              <div className="controlRow" style={{ justifyContent: "space-between" }}>
                <strong style={{ fontSize: 17 }}>
                  {i + 1}. {card.title}
                </strong>
                <button
                  className="btn subtle small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCard(isOpen ? null : card.id);
                  }}
                >
                  {isOpen ? "Collapse" : "Open"}
                </button>
              </div>

              {isOpen && (
                <div className="fadeIn" style={{ marginTop: 12 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 15,
                      background: "#fff",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "12px 14px"
                    }}
                  >
                    {card.prompt}
                  </p>
                  <div className="controlRow" style={{ marginTop: 10 }}>
                    <button className="btn primary small" onClick={() => copyPrompt(card.id, card.prompt)}>
                      📋 Copy prompt
                    </button>
                    {copiedId === card.id && <span className="copiedFlash">Copied!</span>}
                  </div>
                  <div className="reflectionBox" style={{ marginTop: 12 }}>
                    <label htmlFor={`pred-${card.id}`}>
                      ✍️ BEFORE testing — {card.beforeQuestion}
                    </label>
                    <textarea
                      id={`pred-${card.id}`}
                      rows={2}
                      placeholder="Write your group's prediction first…"
                      value={predictions[card.id] ?? ""}
                      onChange={(e) => setPrediction(card.id, e.target.value)}
                    />
                  </div>
                  <div className="revealBox" style={{ marginTop: 12 }}>
                    <strong>Discuss after testing:</strong> {card.discussion}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mode.isTeacher && (
        <>
          <hr className="divider" />
          <div className="panelTitle">🎥 Projector notepad (teacher mode)</div>
          <p className="hintText" style={{ marginBottom: 8 }}>
            Paste the real chatbot's answer here so the class can read and annotate it together.
          </p>
          <textarea
            className="fadeIn"
            rows={6}
            value={projectorText}
            onChange={(e) => setProjectorText(e.target.value)}
            placeholder="Paste the chatbot output here…"
            style={{
              width: "100%",
              border: "1.5px solid var(--line)",
              borderRadius: 10,
              padding: "12px 14px",
              fontFamily: "inherit",
              fontSize: 17,
              background: "#fff",
              resize: "vertical"
            }}
          />
        </>
      )}
    </div>
  );
}
