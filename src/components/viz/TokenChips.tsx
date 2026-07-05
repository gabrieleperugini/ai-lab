const CHIP_COLORS = [
  "var(--token-1)",
  "var(--token-2)",
  "var(--token-3)",
  "var(--token-4)",
  "var(--token-5)",
  "var(--token-6)"
];

type TokenChipsProps = {
  tokens: string[];
  /** Show whitespace explicitly (used by the Tokenizer Microscope). */
  showWhitespace?: boolean;
};

/** Renders tokens as colored chips, cycling through pastel colors. */
export function TokenChips({ tokens, showWhitespace = false }: TokenChipsProps) {
  return (
    <div className="tokenChips">
      {tokens.map((t, i) => (
        <span
          className="tokenChip"
          key={i}
          style={{ background: CHIP_COLORS[i % CHIP_COLORS.length] }}
        >
          {showWhitespace ? t.replace(/ /g, "␣").replace(/\n/g, "⏎") : t}
        </span>
      ))}
    </div>
  );
}
