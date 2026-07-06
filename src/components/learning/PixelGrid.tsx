/** Tactile 8x8 pixel grid shared by the Feature Detector Lab and Fool the
 * Network. Optionally editable (click to toggle ink) and with a detector
 * template overlay. */

import type { DigitGrid } from "../../content/learning-machines/digitTemplates";

export function PixelGrid({
  grid,
  overlay,
  editable = false,
  onToggle,
  size = 240
}: {
  grid: DigitGrid;
  /** Detector template shown as a translucent amber zone. */
  overlay?: DigitGrid | null;
  editable?: boolean;
  onToggle?: (r: number, c: number) => void;
  size?: number;
}) {
  const cell = size / 8;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Pixel grid"
      style={{ display: "block", borderRadius: 8, cursor: editable ? "pointer" : "default" }}
    >
      {grid.map((row, r) =>
        row.map((v, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * cell}
            y={r * cell}
            width={cell - 1}
            height={cell - 1}
            rx={2}
            fill={v ? "var(--ink)" : "#fff"}
            stroke="var(--line)"
            strokeWidth={0.8}
            onClick={editable && onToggle ? () => onToggle(r, c) : undefined}
          />
        ))
      )}
      {overlay &&
        overlay.map((row, r) =>
          row.map(
            (v, c) =>
              v === 1 && (
                <rect
                  key={`o${r}-${c}`}
                  x={c * cell}
                  y={r * cell}
                  width={cell - 1}
                  height={cell - 1}
                  rx={2}
                  fill="var(--amber)"
                  opacity={0.42}
                  style={{ pointerEvents: "none" }}
                />
              )
          )
        )}
    </svg>
  );
}
