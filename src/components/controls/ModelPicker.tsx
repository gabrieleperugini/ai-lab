import { MODELS } from "../../content/models";
import type { ModelKey } from "../../content/models";

/** Dropdown to switch between the precomputed models (compare their bars). */
export function ModelPicker({
  value,
  onChange
}: {
  value: ModelKey;
  onChange: (k: ModelKey) => void;
}) {
  return (
    <label className="statPill" style={{ gap: 8 }} title="All numbers are precomputed offline; switching compares the two models on the same prompt.">
      🧠
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModelKey)}
        aria-label="Choose the language model"
        style={{
          border: "none",
          background: "transparent",
          fontFamily: "inherit",
          fontSize: 14.5,
          fontWeight: 700,
          color: "var(--blue)",
          cursor: "pointer"
        }}
      >
        {MODELS.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
      </select>
    </label>
  );
}
