/**
 * 8x8 digit templates for the Feature Detector Lab and Fool the Network.
 * '#' = ink, ' ' = empty. Variants (shifted, thick, noisy) are generated
 * from the clean grids so they stay consistent when a digit is edited here.
 */

import { makeRng } from "../../lib/learning/rng";

export type DigitGrid = number[][]; // 8x8 of 0/1

export type DigitTemplate = {
  id: string;
  label: string; // the digit as a string: "0", "1", ...
  variant: string;
  grid: DigitGrid;
};

const ART: Record<string, string[]> = {
  "0": [
    " ###### ",
    "##    ##",
    "##    ##",
    "##    ##",
    "##    ##",
    "##    ##",
    "##    ##",
    " ###### "
  ],
  "1": [
    "   ##   ",
    "  ###   ",
    "   ##   ",
    "   ##   ",
    "   ##   ",
    "   ##   ",
    "   ##   ",
    "  ####  "
  ],
  "3": [
    " ###### ",
    "      ##",
    "      ##",
    "  ##### ",
    "      ##",
    "      ##",
    "      ##",
    " ###### "
  ],
  "5": [
    " #######",
    "##      ",
    "##      ",
    " ###### ",
    "      ##",
    "      ##",
    "      ##",
    " ###### "
  ],
  "7": [
    "########",
    "      ##",
    "     ## ",
    "    ##  ",
    "   ##   ",
    "  ##    ",
    "  ##    ",
    "  ##    "
  ],
  "8": [
    " ###### ",
    "##    ##",
    "##    ##",
    " ###### ",
    "##    ##",
    "##    ##",
    "##    ##",
    " ###### "
  ]
};

export function artToBits(art: string[]): DigitGrid {
  return art.map((row) => row.padEnd(8, " ").split("").slice(0, 8).map((c) => (c === "#" ? 1 : 0)));
}

export function shiftGrid(g: DigitGrid, dr: number, dc: number): DigitGrid {
  const out: DigitGrid = Array.from({ length: 8 }, () => new Array(8).fill(0));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const nr = r + dr;
      const nc = c + dc;
      if (g[r][c] && nr >= 0 && nr < 8 && nc >= 0 && nc < 8) out[nr][nc] = 1;
    }
  }
  return out;
}

function thicken(g: DigitGrid): DigitGrid {
  const out: DigitGrid = g.map((row) => [...row]);
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (g[r][c]) {
        if (c + 1 < 8) out[r][c + 1] = 1;
        if (r + 1 < 8) out[r + 1][c] = 1;
      }
    }
  }
  return out;
}

export function noisify(g: DigitGrid, flips: number, seed: number): DigitGrid {
  const rng = makeRng(seed);
  const out: DigitGrid = g.map((row) => [...row]);
  for (let k = 0; k < flips; k++) {
    const r = Math.floor(rng() * 8);
    const c = Math.floor(rng() * 8);
    out[r][c] = out[r][c] ? 0 : 1;
  }
  return out;
}

export const DIGIT_LABELS = Object.keys(ART); // ["0","1","3","5","7","8"]

export const digitTemplates: DigitTemplate[] = DIGIT_LABELS.flatMap((label) => {
  const clean = artToBits(ART[label]);
  return [
    { id: `${label}_clean`, label, variant: "clean", grid: clean },
    { id: `${label}_shifted`, label, variant: "shifted", grid: shiftGrid(clean, 0, 1) },
    { id: `${label}_thick`, label, variant: "thick", grid: thicken(clean) },
    { id: `${label}_noisy`, label, variant: "noisy", grid: noisify(clean, 5, label.charCodeAt(0) * 13) }
  ];
});

export function cleanTemplate(label: string): DigitTemplate {
  return digitTemplates.find((t) => t.label === label && t.variant === "clean")!;
}
