/**
 * Hand-designed 8x8 detector templates for the Feature Detector Lab and the
 * classifier shared with Fool the Network. Each detector "fires" on the
 * fraction of its zone ('#') that is inked in the input.
 * This is a simplified model of feature detection: real neural networks
 * learn their own detectors from data.
 */

import { artToBits } from "./digitTemplates";
import type { DigitGrid } from "./digitTemplates";

export type Detector = {
  id: string;
  label: string;
  emoji: string;
  template: DigitGrid;
};

function det(id: string, label: string, emoji: string, art: string[]): Detector {
  return { id, label, emoji, template: artToBits(art) };
}

export const detectors: Detector[] = [
  det("top_horizontal", "Top stroke", "⬆️", [
    " ###### ",
    " ###### ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        "
  ]),
  det("middle_horizontal", "Middle stroke", "➖", [
    "        ",
    "        ",
    "        ",
    " ###### ",
    " ###### ",
    "        ",
    "        ",
    "        "
  ]),
  det("bottom_horizontal", "Bottom stroke", "⬇️", [
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    " ###### ",
    " ###### "
  ]),
  det("left_vertical", "Left stroke", "⬅️", [
    "        ",
    "##      ",
    "##      ",
    "##      ",
    "##      ",
    "##      ",
    "##      ",
    "        "
  ]),
  det("right_vertical", "Right stroke", "➡️", [
    "        ",
    "      ##",
    "      ##",
    "      ##",
    "      ##",
    "      ##",
    "      ##",
    "        "
  ]),
  det("diagonal", "Diagonal stroke", "↙️", [
    "        ",
    "     ## ",
    "    ##  ",
    "   ##   ",
    "  ##    ",
    " ##     ",
    " ##     ",
    "        "
  ]),
  det("top_left_corner", "Top-left corner", "◤", [
    "####    ",
    "####    ",
    "##      ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        "
  ]),
  det("top_right_corner", "Top-right corner", "◥", [
    "    ####",
    "    ####",
    "      ##",
    "        ",
    "        ",
    "        ",
    "        ",
    "        "
  ]),
  det("center_loop", "Center loop", "⭕", [
    "        ",
    "  ####  ",
    " ##  ## ",
    " ##  ## ",
    " ##  ## ",
    "  ####  ",
    "        ",
    "        "
  ]),
  det("bottom_loop", "Bottom loop", "🔽", [
    "        ",
    "        ",
    "        ",
    "  ####  ",
    " ##  ## ",
    " ##  ## ",
    " ##  ## ",
    "  ####  "
  ])
];
