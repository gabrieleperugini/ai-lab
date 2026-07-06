/**
 * Percent display for probabilities. Integer percents down to 0.5%, one
 * decimal down to 0.1%, then "<0.1%" (a plain "0%" confuses students into
 * thinking the probability is exactly zero).
 */
export function formatPercent(p: number): string {
  if (p >= 0.005) return `${Math.round(p * 100)}%`;
  if (p >= 0.001) return `${(p * 100).toFixed(1)}%`;
  return "<0.1%";
}
