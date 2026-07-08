/**
 * Map presets for the Maze Learner module. Small grids so the policy
 * arrows stay readable on a laptop screen.
 * Legend: S start, G goal, # wall, T trap, C coin, M mud (painful but
 * survivable), . empty.
 */

import { parseGrid, DEFAULT_REWARDS } from "../../lib/rl/gridworld";
import type { RewardConfig, World } from "../../lib/rl/gridworld";

export type MapPreset = {
  id: string;
  label: string;
  description: string;
  world: World;
  rewards?: Partial<RewardConfig>;
  /** Guidance shown under the grid for this map. */
  hint?: string;
};

export const mapPresets: MapPreset[] = [
  {
    id: "easy",
    label: "Easy maze",
    description: "A few walls, one clear path. The friendly training ground.",
    world: parseGrid([
      "S.....",
      ".##.#.",
      ".#..#.",
      ".#.##.",
      "......",
      "..#..G"
    ])
  },
  {
    id: "risky",
    label: "Swamp shortcut",
    description: "The short path crosses a painful swamp. The long path is safe but slow.",
    world: parseGrid([
      "S..M.G",
      ".####.",
      "......",
      "......"
    ]),
    hint: "Change the step cost in the advanced controls: cheap steps favor the long road, expensive steps favor the swamp."
  },
  {
    id: "exploration",
    label: "Exploration trap",
    description: "Steps are free on this map, so nothing pushes the agent around. Without exploration it repeats its first idea forever.",
    world: parseGrid([
      ".....G",
      "..##..",
      "......",
      ".##.#.",
      "......",
      "S....."
    ]),
    rewards: { step: 0, wallBump: 0 },
    hint: "Watch an episode at exploration 0.02: the agent walks into the same wall forever. Then try 0.2, and finally 1.0. Where is the sweet spot?"
  },
  {
    id: "coin",
    label: "Coin detour",
    description: "A coin glitters off the direct path. Is the detour worth it?",
    world: parseGrid([
      "S.....",
      ".##...",
      ".C#.#.",
      ".##.#.",
      "....#.",
      "....#G"
    ]),
    rewards: { coin: 1 },
    hint: "Watch whether the learned route detours to the coin. Then make steps more expensive."
  }
];

export const mazeDefaultRewards: RewardConfig = { ...DEFAULT_REWARDS };
