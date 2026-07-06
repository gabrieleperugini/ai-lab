/** K-means utilities for the Hidden Structure modules. Plain TypeScript,
 * small datasets, fully deterministic given the caller's centroids. */

export type P2 = { x: number; y: number };

export function dist2(a: P2, b: P2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/** Index of the nearest centroid for each point. */
export function assign(points: P2[], centroids: P2[]): number[] {
  return points.map((p) => {
    let best = 0;
    let bd = Infinity;
    centroids.forEach((c, i) => {
      const d = dist2(p, c);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  });
}

/** New centroids = mean of assigned points (empty clusters keep position). */
export function updateCentroids(points: P2[], assignment: number[], centroids: P2[]): P2[] {
  return centroids.map((c, i) => {
    let sx = 0;
    let sy = 0;
    let n = 0;
    assignment.forEach((a, j) => {
      if (a === i) {
        sx += points[j].x;
        sy += points[j].y;
        n++;
      }
    });
    return n === 0 ? c : { x: sx / n, y: sy / n };
  });
}

/** Cluster cost: total squared distance from points to their centroid. */
export function inertia(points: P2[], assignment: number[], centroids: P2[]): number {
  let s = 0;
  assignment.forEach((a, j) => (s += dist2(points[j], centroids[a])));
  return s;
}

/** True when centroids moved less than eps in one update. */
export function converged(a: P2[], b: P2[], eps = 1e-4): boolean {
  return a.every((c, i) => dist2(c, b[i]) < eps * eps);
}

/** Complete small k-means run (used by the spectral module). */
export function kmeansRun(points: P2[], k: number, seedPoints: P2[], maxIter = 50): number[] {
  let centroids = seedPoints.slice(0, k);
  let assignment = assign(points, centroids);
  for (let it = 0; it < maxIter; it++) {
    const next = updateCentroids(points, assignment, centroids);
    const done = converged(centroids, next);
    centroids = next;
    assignment = assign(points, centroids);
    if (done) break;
  }
  return assignment;
}
