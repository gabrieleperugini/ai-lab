/**
 * LM1 "What does the computer see?" examples: tiny 16x16 grayscale images
 * defined as character art (space=0, .=60, +=140, #=230, @=255) plus one
 * stylized audio waveform. No external images, everything is generated.
 */

export type PixelExample = {
  id: string;
  label: string;
  emoji: string;
  kind: "image" | "waveform";
  /** 16 rows of 16 chars for images; unused for waveform. */
  art?: string[];
  /** For the waveform: 64 amplitude values in [-1, 1]. */
  wave?: number[];
};

const CHAR_VALUES: Record<string, number> = { " ": 0, ".": 60, "+": 140, "#": 230, "@": 255 };

export function artToGrid(art: string[]): number[][] {
  return art.map((row) =>
    row.padEnd(16, " ").split("").slice(0, 16).map((ch) => CHAR_VALUES[ch] ?? 0)
  );
}

/** Block-average the 16x16 grid down to res x res (res divides 16). */
export function downsample(grid: number[][], res: number): number[][] {
  const block = 16 / res;
  const out: number[][] = [];
  for (let r = 0; r < res; r++) {
    const row: number[] = [];
    for (let c = 0; c < res; c++) {
      let s = 0;
      for (let i = 0; i < block; i++) {
        for (let j = 0; j < block; j++) s += grid[r * block + i][c * block + j];
      }
      row.push(Math.round(s / (block * block)));
    }
    out.push(row);
  }
  return out;
}

const digit3: string[] = [
  "                ",
  "    .#####.     ",
  "   ##@@@@@##    ",
  "  ##.    .@#.   ",
  "         .##    ",
  "         ##.    ",
  "     .####.     ",
  "     .#####.    ",
  "         .##.   ",
  "          .##   ",
  "           ##   ",
  "  .#.     .##   ",
  "  ##@#...###.   ",
  "   .######.     ",
  "                ",
  "                "
];

const smiley: string[] = [
  "     ######     ",
  "   ##@@@@@@##   ",
  "  #@@@@@@@@@@#  ",
  " #@@@@@@@@@@@@# ",
  " #@@.@@@@@@.@@# ",
  "#@@@.@@@@@@.@@@#",
  "#@@@@@@@@@@@@@@#",
  "#@@@@@@@@@@@@@@#",
  "#@@.@@@@@@@@.@@#",
  "#@@@.@@@@@@.@@@#",
  " #@@@.####.@@@# ",
  " #@@@@....@@@@# ",
  "  #@@@@@@@@@@#  ",
  "   ##@@@@@@##   ",
  "     ######     ",
  "                "
];

const cat: string[] = [
  "  .#      #.    ",
  "  ##.    .##    ",
  "  #@#....#@#    ",
  "  #@@@@@@@@#    ",
  " #@@@@@@@@@@#   ",
  " #@.@@@@@@.@#   ",
  " #@@@@..@@@@#   ",
  " #@@@.##.@@@#   ",
  "  #@@@@@@@@#    ",
  "   #@@@@@@#     ",
  "   .#@@@@#.     ",
  "    #@@@@#      ",
  "   #@@@@@@#     ",
  "   #@@@@@@#     ",
  "    ######      ",
  "                "
];

const stopSign: string[] = [
  "     ######     ",
  "    #@@@@@@#    ",
  "   #@@@@@@@@#   ",
  "  #@@@@@@@@@@#  ",
  " #@@@@@@@@@@@@# ",
  " #@.@.@@.@.@.@# ",
  " #@.@.@@.@.@.@# ",
  " #@.@@@@.@.@.@# ",
  " #@@@@@@@@@@@@# ",
  "  #@@@@@@@@@@#  ",
  "   #@@@@@@@@#   ",
  "    #@@@@@@#    ",
  "     ######     ",
  "                ",
  "                ",
  "                "
];

function makeWave(): number[] {
  // A stylized "hello": two syllable bursts with decaying wiggles.
  const w: number[] = [];
  for (let i = 0; i < 64; i++) {
    const t = i / 64;
    const burst1 = Math.exp(-Math.pow((t - 0.25) / 0.12, 2));
    const burst2 = Math.exp(-Math.pow((t - 0.65) / 0.16, 2));
    w.push((burst1 * Math.sin(28 * t * Math.PI) * 0.9 + burst2 * Math.sin(19 * t * Math.PI) * 0.7));
  }
  return w;
}

export const pixelExamples: PixelExample[] = [
  { id: "digit3", label: "Handwritten 3", emoji: "3️⃣", kind: "image", art: digit3 },
  { id: "smiley", label: "Smiley face", emoji: "🙂", kind: "image", art: smiley },
  { id: "cat", label: "Cat icon", emoji: "🐱", kind: "image", art: cat },
  { id: "stop", label: "Traffic sign", emoji: "🛑", kind: "image", art: stopSign },
  { id: "hello", label: "Spoken 'hello' (audio)", emoji: "🎤", kind: "waveform", wave: makeWave() }
];
