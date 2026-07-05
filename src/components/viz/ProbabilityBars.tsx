import { sortedEntries } from "../../lib/sampling";
import type { Distribution } from "../../lib/sampling";

type ProbabilityBarsProps = {
  distribution: Distribution;
  /** When false, bars render at zero width (pre-reveal state). */
  revealed?: boolean;
  /** Token the student picked — gets a "YOU" badge. */
  highlight?: string | null;
  /** Token that was just sampled — gets a green fill. */
  picked?: string | null;
  color?: "amber" | "blue";
  maxBars?: number;
};

/**
 * Animated horizontal probability bars. Handles an "other" entry gracefully:
 * it renders last as a gray italic bar.
 */
export function ProbabilityBars({
  distribution,
  revealed = true,
  highlight = null,
  picked = null,
  color = "amber",
  maxBars
}: ProbabilityBarsProps) {
  let entries = sortedEntries(distribution);
  if (maxBars && entries.length > maxBars) {
    const kept = entries.slice(0, maxBars);
    const rest = entries.slice(maxBars).reduce((a, [, v]) => a + v, 0);
    const otherIdx = kept.findIndex(([k]) => k === "other");
    if (otherIdx >= 0) kept[otherIdx] = ["other", kept[otherIdx][1] + rest];
    else kept.push(["other", rest]);
    entries = kept;
  }
  const max = Math.max(...entries.map(([, v]) => v), 0.0001);

  return (
    <div className="probBars">
      {entries.map(([token, p]) => {
        const isOther = token === "other";
        const fillClass = isOther
          ? "probFill muted"
          : picked === token
            ? "probFill picked"
            : color === "blue"
              ? "probFill blue"
              : "probFill";
        return (
          <div className="probRow" key={token}>
            <span className={"probLabel" + (isOther ? " other" : "")}>
              {isOther ? "other tokens" : token}
            </span>
            <div className="probTrack">
              <div
                className={fillClass}
                style={{ width: revealed ? `${(p / max) * 100}%` : "0%" }}
              />
              {highlight === token && revealed && <span className="youBadge">YOU</span>}
            </div>
            <span className="probValue">{revealed ? `${(p * 100).toFixed(0)}%` : "?"}</span>
          </div>
        );
      })}
    </div>
  );
}
