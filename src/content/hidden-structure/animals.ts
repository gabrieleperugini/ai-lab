/**
 * U1 "What Makes Things Similar?" animal world. All feature values in
 * [0, 1] except number_of_legs (0 to 8, normalized in the lens axes).
 * Lenses define which features become the map's x and y axes; changing the
 * lens visibly reorganizes the same animals.
 */

export type Animal = {
  name: string;
  emoji: string;
  features: Record<string, number>;
};

export type Lens = {
  id: string;
  label: string;
  emoji: string;
  /** Axes as weighted feature sums; weights may be negative. */
  x: [string, number][];
  y: [string, number][];
  xLabel: string;
  yLabel: string;
};

// feature order: size weight speed water air land danger domestication
//                cuteness legs mammal predator social
function a(
  name: string, emoji: string,
  size: number, weight: number, speed: number,
  water: number, air: number, land: number,
  danger: number, dom: number, cute: number,
  legs: number, mammal: number, predator: number, social: number
): Animal {
  return {
    name, emoji,
    features: {
      size, weight, speed,
      water_life: water, air_life: air, land_life: land,
      danger_to_humans: danger, domestication: dom, cuteness: cute,
      number_of_legs: legs, mammal_score: mammal, predator_score: predator, social_score: social
    }
  };
}

export const animals: Animal[] = [
  a("Dog", "🐕", 0.35, 0.3, 0.55, 0.05, 0, 0.95, 0.15, 1.0, 0.9, 4, 1, 0.45, 0.9),
  a("Wolf", "🐺", 0.4, 0.35, 0.65, 0.05, 0, 0.95, 0.6, 0.05, 0.55, 4, 1, 0.9, 0.85),
  a("Cat", "🐈", 0.2, 0.12, 0.55, 0.02, 0, 0.95, 0.1, 0.9, 0.95, 4, 1, 0.7, 0.35),
  a("Lion", "🦁", 0.6, 0.55, 0.7, 0.02, 0, 0.95, 0.9, 0.02, 0.6, 4, 1, 1.0, 0.7),
  a("Cow", "🐄", 0.65, 0.7, 0.25, 0.02, 0, 0.95, 0.1, 0.95, 0.55, 4, 1, 0.0, 0.7),
  a("Horse", "🐎", 0.65, 0.65, 0.85, 0.02, 0, 0.95, 0.15, 0.9, 0.65, 4, 1, 0.0, 0.7),
  a("Dolphin", "🐬", 0.55, 0.5, 0.8, 1.0, 0, 0.0, 0.05, 0.3, 0.9, 0, 1, 0.7, 0.95),
  a("Whale", "🐋", 1.0, 1.0, 0.5, 1.0, 0, 0.0, 0.1, 0.02, 0.7, 0, 1, 0.35, 0.8),
  a("Shark", "🦈", 0.7, 0.6, 0.75, 1.0, 0, 0.0, 0.85, 0.0, 0.2, 0, 0, 1.0, 0.15),
  a("Penguin", "🐧", 0.25, 0.15, 0.35, 0.7, 0.05, 0.5, 0.02, 0.05, 0.95, 2, 0, 0.5, 0.95),
  a("Eagle", "🦅", 0.3, 0.1, 0.9, 0.05, 1.0, 0.3, 0.3, 0.05, 0.5, 2, 0, 0.95, 0.2),
  a("Bat", "🦇", 0.08, 0.02, 0.6, 0.0, 0.95, 0.25, 0.15, 0.0, 0.35, 2, 1, 0.55, 0.85),
  a("Frog", "🐸", 0.06, 0.02, 0.35, 0.6, 0.02, 0.6, 0.1, 0.05, 0.5, 4, 0, 0.5, 0.2),
  a("Crocodile", "🐊", 0.7, 0.65, 0.45, 0.75, 0, 0.5, 0.95, 0.0, 0.15, 4, 0, 1.0, 0.15),
  a("Snake", "🐍", 0.3, 0.12, 0.4, 0.2, 0, 0.85, 0.7, 0.05, 0.15, 0, 0, 0.9, 0.05),
  a("Octopus", "🐙", 0.3, 0.15, 0.45, 1.0, 0, 0.0, 0.15, 0.0, 0.45, 8, 0, 0.75, 0.1),
  a("Bee", "🐝", 0.01, 0.0, 0.5, 0.0, 0.9, 0.35, 0.25, 0.35, 0.55, 6, 0, 0.1, 1.0),
  a("Butterfly", "🦋", 0.01, 0.0, 0.3, 0.0, 0.9, 0.3, 0.0, 0.02, 0.85, 6, 0, 0.0, 0.15),
  a("Elephant", "🐘", 0.95, 0.95, 0.4, 0.1, 0, 0.95, 0.4, 0.4, 0.75, 4, 1, 0.05, 0.9),
  a("Mouse", "🐭", 0.03, 0.01, 0.45, 0.02, 0, 0.95, 0.02, 0.4, 0.8, 4, 1, 0.05, 0.6)
];

export const lenses: Lens[] = [
  {
    id: "body",
    label: "Body lens",
    emoji: "📏",
    x: [["size", 0.6], ["weight", 0.4]],
    y: [["number_of_legs", 0.125]], // legs 0..8 scaled to 0..1
    xLabel: "small → large",
    yLabel: "no legs → many legs"
  },
  {
    id: "habitat",
    label: "Habitat lens",
    emoji: "🌍",
    x: [["water_life", 1], ["land_life", -1]],
    y: [["air_life", 1]],
    xLabel: "land → water",
    yLabel: "ground → sky"
  },
  {
    id: "human",
    label: "Human lens",
    emoji: "🏠",
    x: [["domestication", 1], ["danger_to_humans", -1]],
    y: [["cuteness", 1]],
    xLabel: "dangerous → domestic",
    yLabel: "less cute → cuter"
  },
  {
    id: "biology",
    label: "Biology lens",
    emoji: "🧬",
    x: [["mammal_score", 1]],
    y: [["predator_score", 1], ["social_score", -0.5]],
    xLabel: "not a mammal → mammal",
    yLabel: "social herbivore → lone hunter"
  }
];

/** Position of an animal under a lens, both axes normalized to [-1, 1]. */
export function lensPosition(animal: Animal, lens: Lens): { x: number; y: number } {
  const evalAxis = (axis: [string, number][]) =>
    axis.reduce((s, [f, w]) => s + (animal.features[f] ?? 0) * w, 0);
  const axisValues = (axis: [string, number][], an: Animal) =>
    axis.reduce((s2, [f, w]) => s2 + (an.features[f] ?? 0) * w, 0);
  const all = (axis: [string, number][]) => animals.map((an) => axisValues(axis, an));

  const rawX = evalAxis(lens.x);
  const rawY = evalAxis(lens.y);
  const xs = all(lens.x);
  const ys = all(lens.y);
  const nrm = (v: number, arr: number[]) => {
    const lo = Math.min(...arr);
    const hi = Math.max(...arr);
    return hi - lo < 1e-9 ? 0 : ((v - lo) / (hi - lo)) * 2 - 1;
  };
  return { x: nrm(rawX, xs), y: nrm(rawY, ys) };
}
