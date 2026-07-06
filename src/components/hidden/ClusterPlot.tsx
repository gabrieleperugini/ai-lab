/** Shared 2D scatter plot for the clustering modules: cluster colors AND
 * marker shapes (accessibility), optional centroids, assignment lines,
 * centroid trails, and graph edges. Data lives in [-1, 1]². */

import type { ReactNode } from "react";
import type { P2 } from "../../lib/hidden/kmeans";
import type { Edge } from "../../lib/hidden/spectral";

export const CLUSTER_STYLES = [
  { color: "#3b64c0", shape: "circle" },
  { color: "#d97e00", shape: "square" },
  { color: "#2c9c6a", shape: "triangle" },
  { color: "#7b5cd6", shape: "diamond" },
  { color: "#d64550", shape: "cross" }
] as const;

const SIZE = 380;

export function toPx(v: number): number {
  return ((v + 1.05) / 2.1) * SIZE;
}

export function fromPx(px: number): number {
  return (px / SIZE) * 2.1 - 1.05;
}

export function Marker({ x, y, cluster, r = 5, dim = false }: { x: number; y: number; cluster: number; r?: number; dim?: boolean }) {
  const s = CLUSTER_STYLES[((cluster % CLUSTER_STYLES.length) + CLUSTER_STYLES.length) % CLUSTER_STYLES.length];
  const common = { fill: s.color, stroke: "#fff", strokeWidth: 1.1, opacity: dim ? 0.35 : 0.9 };
  switch (s.shape) {
    case "square":
      return <rect x={x - r} y={y - r} width={2 * r} height={2 * r} rx={1.5} {...common} />;
    case "triangle":
      return <polygon points={`${x},${y - r * 1.2} ${x + r * 1.1},${y + r} ${x - r * 1.1},${y + r}`} {...common} />;
    case "diamond":
      return <polygon points={`${x},${y - r * 1.25} ${x + r * 1.25},${y} ${x},${y + r * 1.25} ${x - r * 1.25},${y}`} {...common} />;
    case "cross":
      return (
        <g {...{ opacity: common.opacity }}>
          <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} stroke={s.color} strokeWidth={2.6} />
          <line x1={x - r} y1={y + r} x2={x + r} y2={y - r} stroke={s.color} strokeWidth={2.6} />
        </g>
      );
    default:
      return <circle cx={x} cy={y} r={r} {...common} />;
  }
}

export function ClusterPlot({
  points,
  assignment,
  centroids,
  showLines = false,
  trails,
  edges,
  onPointerDownCentroid,
  onSvgPointerMove,
  onSvgPointerUp,
  children,
  ariaLabel = "Cluster plot"
}: {
  points: P2[];
  /** Cluster index per point; -1 or missing = unassigned (grey). */
  assignment?: number[];
  centroids?: P2[];
  showLines?: boolean;
  /** Per-centroid history of positions. */
  trails?: P2[][];
  edges?: Edge[];
  onPointerDownCentroid?: (index: number, e: React.PointerEvent) => void;
  onSvgPointerMove?: (x: number, y: number, e: React.PointerEvent<SVGSVGElement>) => void;
  onSvgPointerUp?: () => void;
  children?: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      role="img"
      aria-label={ariaLabel}
      style={{ display: "block", touchAction: "none" }}
      onPointerMove={
        onSvgPointerMove
          ? (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onSvgPointerMove(
                fromPx(((e.clientX - rect.left) / rect.width) * SIZE),
                fromPx(((e.clientY - rect.top) / rect.height) * SIZE),
                e
              );
            }
          : undefined
      }
      onPointerUp={onSvgPointerUp}
      onPointerLeave={onSvgPointerUp}
    >
      <rect x={0} y={0} width={SIZE} height={SIZE} fill="var(--paper-2)" rx={10} />

      {edges?.map((e, i) => (
        <line
          key={i}
          x1={toPx(points[e.a].x)}
          y1={toPx(points[e.a].y)}
          x2={toPx(points[e.b].x)}
          y2={toPx(points[e.b].y)}
          stroke="var(--blue-mid)"
          strokeWidth={0.8 + e.w * 1.4}
          opacity={0.16 + e.w * 0.3}
        />
      ))}

      {showLines &&
        centroids &&
        assignment &&
        points.map((p, i) => {
          const c = centroids[assignment[i]];
          if (!c) return null;
          return (
            <line
              key={`l${i}`}
              x1={toPx(p.x)}
              y1={toPx(p.y)}
              x2={toPx(c.x)}
              y2={toPx(c.y)}
              stroke="var(--ink-faint)"
              strokeWidth={0.7}
              opacity={0.35}
            />
          );
        })}

      {points.map((p, i) => {
        const c = assignment?.[i] ?? -1;
        return c < 0 ? (
          <circle key={i} cx={toPx(p.x)} cy={toPx(p.y)} r={4.5} fill="var(--ink-faint)" stroke="#fff" strokeWidth={1} opacity={0.75} />
        ) : (
          <Marker key={i} x={toPx(p.x)} y={toPx(p.y)} cluster={c} />
        );
      })}

      {trails?.map((trail, ci) =>
        trail.length > 1 ? (
          <polyline
            key={`t${ci}`}
            points={trail.map((p) => `${toPx(p.x)},${toPx(p.y)}`).join(" ")}
            fill="none"
            stroke={CLUSTER_STYLES[ci % CLUSTER_STYLES.length].color}
            strokeWidth={1.6}
            strokeDasharray="3 4"
            opacity={0.6}
          />
        ) : null
      )}

      {centroids?.map((c, i) => (
        <g
          key={`c${i}`}
          style={{ cursor: onPointerDownCentroid ? "grab" : "default" }}
          onPointerDown={onPointerDownCentroid ? (e) => onPointerDownCentroid(i, e) : undefined}
        >
          <circle cx={toPx(c.x)} cy={toPx(c.y)} r={12} fill={CLUSTER_STYLES[i % CLUSTER_STYLES.length].color} opacity={0.25} />
          <circle cx={toPx(c.x)} cy={toPx(c.y)} r={7} fill={CLUSTER_STYLES[i % CLUSTER_STYLES.length].color} stroke="#fff" strokeWidth={2.5} />
        </g>
      ))}

      {children}
    </svg>
  );
}
