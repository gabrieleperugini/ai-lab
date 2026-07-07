/**
 * Landscape functions for the Gradient Explorer module.
 * Translated from the course Mathematica notebook (slopes.nb):
 *
 *   feasy[x_] := (Exp[x]-Exp[-x])/(Exp[x]+Exp[-x]) + x^6/10^4
 *   f[x_]     := Tanh[x] + 1/(x^2+1) - 1/(5 (x-2)^2+1) + x^10/10^7
 *   f3easy[x1_, x2_] := 1.5 + (Tanh[(x1-x2)/Sqrt[2]]
 *                       - (1/2) 1/(0.2 ((x1+x2)/Sqrt[2] - 1)^2 + 1))
 *                       + x1^6/10^4 + x2^6/10^4
 *
 * Derivatives are numerical central differences (eps = 1e-3): robust,
 * and honest about the idea that a slope is a local measurement.
 */

/** Gentle warm-up landscape (feasy in the notebook). */
export function fEasy(x: number): number {
  return Math.tanh(x) + Math.pow(x, 6) / 1e4;
}

/** Richer 1D landscape with a valley, a dip, and steep walls (f). */
export function f1d(x: number): number {
  return (
    Math.tanh(x) +
    1 / (x * x + 1) -
    1 / (5 * Math.pow(x - 2, 2) + 1) +
    Math.pow(x, 10) / 1e7
  );
}

/** 2D landscape with a diagonal ridge and a valley (f3easy). */
export function f2d(x1: number, x2: number): number {
  const s = Math.SQRT1_2; // 1/sqrt(2)
  const ridge = Math.tanh(s * x1 - s * x2);
  const valley = 0.5 / (0.2 * Math.pow(s * x2 + s * x1 - 1, 2) + 1);
  return 1.5 + (ridge - valley) + Math.pow(x1, 6) / 1e4 + Math.pow(x2, 6) / 1e4;
}

const EPS = 1e-3;

/** Numerical derivative (central difference). */
export function deriv(f: (x: number) => number, x: number): number {
  return (f(x + EPS) - f(x - EPS)) / (2 * EPS);
}

/** Numerical gradient of a 2D function. */
export function grad2(
  f: (x1: number, x2: number) => number,
  x1: number,
  x2: number
): { d1: number; d2: number } {
  return {
    d1: (f(x1 + EPS, x2) - f(x1 - EPS, x2)) / (2 * EPS),
    d2: (f(x1, x2 + EPS) - f(x1, x2 - EPS)) / (2 * EPS)
  };
}
