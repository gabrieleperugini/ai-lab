/**
 * Real (small) spectral clustering in plain TypeScript, no dependencies:
 *
 * 1. symmetrized k-nearest-neighbor graph with Gaussian weights
 *    W_ij = exp(-d²/(2σ²))
 * 2. normalized Laplacian  L = I - D^{-1/2} W D^{-1/2}
 * 3. eigenvectors of L via cyclic Jacobi rotations (L is symmetric; N ≤ 120,
 *    so a few O(N³) sweeps run in tens of milliseconds)
 * 4. the eigenvectors of the 2nd and 3rd smallest eigenvalues give the 2D
 *    spectral embedding; k-means in that space colors the clusters.
 */

import type { P2 } from "./kmeans";
import { dist2 } from "./kmeans";
import { makeRng } from "../learning/rng";

export type Edge = { a: number; b: number; w: number };

export function knnGraph(points: P2[], k: number, sigma: number): Edge[] {
  const n = points.length;
  const edges = new Map<string, Edge>();
  for (let i = 0; i < n; i++) {
    const dists = points
      .map((p, j) => ({ j, d: dist2(points[i], p) }))
      .filter((x) => x.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, k);
    for (const { j, d } of dists) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edges.has(key)) {
        edges.set(key, {
          a: Math.min(i, j),
          b: Math.max(i, j),
          w: Math.exp(-d / (2 * sigma * sigma))
        });
      }
    }
  }
  return [...edges.values()];
}

/** Connected components of the graph (union-find). */
export function components(n: number, edges: Edge[]): number[] {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const e of edges) {
    const ra = find(e.a);
    const rb = find(e.b);
    if (ra !== rb) parent[ra] = rb;
  }
  const roots = new Map<number, number>();
  return Array.from({ length: n }, (_, i) => {
    const r = find(i);
    if (!roots.has(r)) roots.set(r, roots.size);
    return roots.get(r)!;
  });
}

/** Cyclic Jacobi eigendecomposition of a symmetric matrix (in-place copy).
 * Returns eigenvalues and eigenvectors (columns), unsorted. */
function jacobiEigen(Ain: number[][], sweeps = 8): { values: number[]; vectors: number[][] } {
  const n = Ain.length;
  const A = Ain.map((row) => [...row]);
  const V: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  for (let s = 0; s < sweeps; s++) {
    let off = 0;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        off += A[p][q] * A[p][q];
        if (Math.abs(A[p][q]) < 1e-10) continue;
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta * theta + 1)) || 1;
        const c = 1 / Math.sqrt(t * t + 1);
        const sn = t * c;
        for (let i = 0; i < n; i++) {
          const aip = A[i][p];
          const aiq = A[i][q];
          A[i][p] = c * aip - sn * aiq;
          A[i][q] = sn * aip + c * aiq;
        }
        for (let i = 0; i < n; i++) {
          const api = A[p][i];
          const aqi = A[q][i];
          A[p][i] = c * api - sn * aqi;
          A[q][i] = sn * api + c * aqi;
          const vip = V[i][p];
          const viq = V[i][q];
          V[i][p] = c * vip - sn * viq;
          V[i][q] = sn * vip + c * viq;
        }
      }
    }
    if (off < 1e-12) break;
  }
  return { values: A.map((row, i) => row[i]), vectors: V };
}

export type SpectralResult = {
  embedding: P2[];
  clusters: number[];
};

/** Full pipeline: graph -> normalized Laplacian -> 2D embedding -> k-means. */
export function spectralCluster(points: P2[], edges: Edge[], k: number): SpectralResult {
  const n = points.length;
  // affinity + degree
  const W = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const e of edges) {
    W[e.a][e.b] = e.w;
    W[e.b][e.a] = e.w;
  }
  const deg = W.map((row) => row.reduce((a, b) => a + b, 0));
  const dInv = deg.map((d) => (d > 1e-12 ? 1 / Math.sqrt(d) : 0));
  // L = I - D^-1/2 W D^-1/2
  const L = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0) - dInv[i] * W[i][j] * dInv[j])
  );

  const { values, vectors } = jacobiEigen(L);
  const order = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);

  // Ng-Jordan-Weiss: cluster on the FIRST k eigenvectors (this also handles
  // disconnected graphs, where they are component indicators), rows
  // normalized to unit length.
  const idxK = order.slice(0, k).map((o) => o.i);
  const U: number[][] = Array.from({ length: n }, (_, r) => {
    const row = idxK.map((c) => vectors[r][c]);
    const len = Math.hypot(...row) || 1;
    return row.map((v) => v / len);
  });
  const clusters = kmeansKD(U, k);

  // 2D display embedding from the 2nd/3rd smallest eigenvectors
  const i1 = order[1]?.i ?? order[0].i;
  const i2 = order[2]?.i ?? i1;
  const embedding: P2[] = Array.from({ length: n }, (_, r) => ({
    x: vectors[r][i1],
    y: vectors[r][i2]
  }));
  const xs = embedding.map((p) => p.x);
  const ys = embedding.map((p) => p.y);
  const nrm = (v: number, lo: number, hi: number) => (hi - lo < 1e-12 ? 0 : ((v - lo) / (hi - lo)) * 2 - 1);
  const loX = Math.min(...xs), hiX = Math.max(...xs);
  const loY = Math.min(...ys), hiY = Math.max(...ys);
  const norm = embedding.map((p) => ({ x: nrm(p.x, loX, hiX), y: nrm(p.y, loY, hiY) }));

  return { embedding: norm, clusters };
}

/** Small k-dimensional k-means with farthest-point seeding (deterministic). */
function kmeansKD(rows: number[][], k: number, maxIter = 60): number[] {
  const n = rows.length;
  const dim = rows[0].length;
  const d2 = (a: number[], b: number[]) => {
    let s = 0;
    for (let i = 0; i < dim; i++) {
      const diff = a[i] - b[i];
      s += diff * diff;
    }
    return s;
  };
  // farthest-point seeding, started from a deterministic point
  const rng = makeRng(1234);
  const seeds: number[][] = [rows[Math.floor(rng() * n)]];
  while (seeds.length < k) {
    let best = 0;
    let bd = -1;
    for (let i = 0; i < n; i++) {
      const dmin = Math.min(...seeds.map((s) => d2(rows[i], s)));
      if (dmin > bd) {
        bd = dmin;
        best = i;
      }
    }
    seeds.push(rows[best]);
  }
  let centroids = seeds.map((s) => [...s]);
  let labels = new Array<number>(n).fill(0);
  for (let it = 0; it < maxIter; it++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let bi = 0;
      let bdist = Infinity;
      for (let c = 0; c < k; c++) {
        const d = d2(rows[i], centroids[c]);
        if (d < bdist) {
          bdist = d;
          bi = c;
        }
      }
      if (labels[i] !== bi) {
        labels[i] = bi;
        changed = true;
      }
    }
    const sums = Array.from({ length: k }, () => new Array(dim).fill(0));
    const counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      counts[labels[i]]++;
      for (let j = 0; j < dim; j++) sums[labels[i]][j] += rows[i][j];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) centroids[c] = sums[c].map((s) => s / counts[c]);
    }
    if (!changed) break;
  }
  return labels;
}
