/** Linear and polynomial regression utilities for the Learning Machines
 * modules. Everything runs in the browser on small datasets. */

export type Point = { x: number; y: number };

export function mse(points: Point[], m: number, b: number): number {
  if (points.length === 0) return 0;
  let s = 0;
  for (const p of points) {
    const e = p.y - (m * p.x + b);
    s += e * e;
  }
  return s / points.length;
}

/** Exact MSE gradients for y_hat = m x + b. */
export function mseGradient(points: Point[], m: number, b: number): { dm: number; db: number } {
  let dm = 0;
  let db = 0;
  for (const p of points) {
    const e = m * p.x + b - p.y;
    dm += 2 * e * p.x;
    db += 2 * e;
  }
  return { dm: dm / points.length, db: db / points.length };
}

/** Closed-form least squares line. */
export function bestFitLine(points: Point[]): { m: number; b: number } {
  const n = points.length;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
    sxx += p.x * p.x;
    sxy += p.x * p.y;
  }
  const denom = n * sxx - sx * sx || 1e-9;
  const m = (n * sxy - sx * sy) / denom;
  const b = (sy - m * sx) / n;
  return { m, b };
}

// ---------------------------------------------------------------------------
// Bump model for the "Two hills" landscape: y_hat = m * exp(-(x-b)^2 / 2s^2)
// with amplitude m and center b. Fitting two-bump data with a one-bump model
// makes the MSE over (m, b) genuinely non-convex: one valley per hill, the
// deeper hill giving the global minimum. Used by the Loss Landscape and
// Gradient Descent Race modules; the line modules are untouched.
// ---------------------------------------------------------------------------

export const BUMP_SIGMA = 0.25;

export function bumpPredict(m: number, b: number, x: number): number {
  const d = (x - b) / BUMP_SIGMA;
  return m * Math.exp(-0.5 * d * d);
}

export function bumpMse(points: Point[], m: number, b: number): number {
  if (points.length === 0) return 0;
  let s = 0;
  for (const p of points) {
    const e = p.y - bumpPredict(m, b, p.x);
    s += e * e;
  }
  return s / points.length;
}

/** Exact MSE gradients for the bump model. */
export function bumpMseGradient(
  points: Point[],
  m: number,
  b: number
): { dm: number; db: number } {
  let dm = 0;
  let db = 0;
  const s2 = BUMP_SIGMA * BUMP_SIGMA;
  for (const p of points) {
    const g = Math.exp(-0.5 * ((p.x - b) * (p.x - b)) / s2);
    const e = m * g - p.y;
    dm += 2 * e * g;
    db += 2 * e * m * g * ((p.x - b) / s2);
  }
  return { dm: dm / points.length, db: db / points.length };
}

/** Global best bump fit by grid search plus local refinement. */
export function bestBumpFit(points: Point[]): { m: number; b: number } {
  let best = { m: 0, b: 0, loss: Infinity };
  for (let i = 0; i <= 60; i++) {
    for (let j = 0; j <= 60; j++) {
      const m = -3 + (6 * i) / 60;
      const b = -3 + (6 * j) / 60;
      const l = bumpMse(points, m, b);
      if (l < best.loss) best = { m, b, loss: l };
    }
  }
  let { m, b } = best;
  for (let it = 0; it < 200; it++) {
    const { dm, db } = bumpMseGradient(points, m, b);
    m -= 0.05 * dm;
    b -= 0.05 * db;
  }
  return { m, b };
}

// ---------------------------------------------------------------------------
// Polynomial fit on a Chebyshev basis (well conditioned on x in [-1, 1]),
// solved with ridge-stabilized normal equations. Small systems only.
// ---------------------------------------------------------------------------

/** T_0..T_deg evaluated at x (x should live in [-1, 1]). */
export function chebBasis(x: number, deg: number): number[] {
  const t = new Array<number>(deg + 1);
  t[0] = 1;
  if (deg >= 1) t[1] = x;
  for (let k = 2; k <= deg; k++) t[k] = 2 * x * t[k - 1] - t[k - 2];
  return t;
}

function solveLinearSystem(A: number[][], y: number[]): number[] {
  const n = y.length;
  const M = A.map((row, i) => [...row, y[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    }
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / d;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / (M[i][i] || 1e-12));
}

/** Fit a degree-`deg` polynomial (Chebyshev basis). Returns coefficients. */
export function polyFit(points: Point[], deg: number, ridge = 1e-8): number[] {
  const k = deg + 1;
  const AtA: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  const Aty = new Array(k).fill(0);
  for (const p of points) {
    const phi = chebBasis(p.x, deg);
    for (let i = 0; i < k; i++) {
      Aty[i] += phi[i] * p.y;
      for (let j = 0; j < k; j++) AtA[i][j] += phi[i] * phi[j];
    }
  }
  for (let i = 0; i < k; i++) AtA[i][i] += ridge * points.length;
  return solveLinearSystem(AtA, Aty);
}

export function polyEval(coeffs: number[], x: number): number {
  const phi = chebBasis(x, coeffs.length - 1);
  let s = 0;
  for (let i = 0; i < coeffs.length; i++) s += coeffs[i] * phi[i];
  return s;
}

export function polyMse(points: Point[], coeffs: number[]): number {
  if (points.length === 0) return 0;
  let s = 0;
  for (const p of points) {
    const e = p.y - polyEval(coeffs, p.x);
    s += e * e;
  }
  return s / points.length;
}
