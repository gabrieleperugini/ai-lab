/**
 * M2 — Context Lens pairs. Same-shaped prompts whose few different words
 * flip the probability distribution. Teaching distributions, not real model
 * outputs.
 */

export type ContextSide = {
  prompt: string;
  /** Words of the prompt to highlight as "the words that changed". */
  highlight: string[];
  probabilities: Record<string, number>;
};

export type ContextPair = {
  id: string;
  title: string;
  left: ContextSide;
  right: ContextSide;
  leftLabel: string;
  rightLabel: string;
  explanation: string;
  takeaway: string;
};

export const contextPairs: ContextPair[] = [
  {
    id: "bank",
    title: "One word, two worlds",
    leftLabel: "Financial bank",
    rightLabel: "River bank",
    left: {
      prompt: "I entered my bank and saw some",
      highlight: ["entered"],
      probabilities: { desks: 0.46, customers: 0.35, ducks: 0.06, lions: 0.03, other: 0.1 }
    },
    right: {
      prompt: "I sat by the bank and saw some",
      highlight: ["sat", "by"],
      probabilities: { ducks: 0.62, water: 0.26, desks: 0.05, lions: 0.03, other: 0.04 }
    },
    explanation:
      "The surrounding words decide whether 'bank' means a financial institution or a river bank.",
    takeaway: "Meaning is contextual."
  },
  {
    id: "ice-cream",
    title: "Physics from language",
    leftLabel: "Oven",
    rightLabel: "Freezer",
    left: {
      prompt: "He put the ice cream in the oven and it",
      highlight: ["oven"],
      probabilities: { melted: 0.78, burned: 0.06, froze: 0.03, other: 0.13 }
    },
    right: {
      prompt: "He put the ice cream in the freezer and it",
      highlight: ["freezer"],
      probabilities: { froze: 0.66, stayed: 0.16, melted: 0.05, other: 0.13 }
    },
    explanation: "The model has seen many patterns linking heat to melting and cold to freezing.",
    takeaway: "World regularities appear as language regularities."
  },
  {
    id: "fire",
    title: "Cause and effect",
    leftLabel: "Water",
    rightLabel: "Gasoline",
    left: {
      prompt: "He poured water on the fire, and the flames",
      highlight: ["water"],
      probabilities: { died: 0.32, went: 0.28, disappeared: 0.12, grew: 0.05, other: 0.23 }
    },
    right: {
      prompt: "He poured gasoline on the fire, and the flames",
      highlight: ["gasoline"],
      probabilities: { grew: 0.42, exploded: 0.22, spread: 0.14, died: 0.03, other: 0.19 }
    },
    explanation: "Different causes imply different likely effects.",
    takeaway: "Prediction can require causal expectations."
  },
  {
    id: "umbrella",
    title: "A missing object implies an outcome",
    leftLabel: "Remembered",
    rightLabel: "Forgot",
    left: {
      prompt: "Tom remembered his umbrella. When he arrived at school, his clothes were",
      highlight: ["remembered"],
      probabilities: { dry: 0.48, wet: 0.1, clean: 0.1, other: 0.32 }
    },
    right: {
      prompt: "Tom forgot his umbrella. When he arrived at school, his clothes were",
      highlight: ["forgot"],
      probabilities: { wet: 0.68, dry: 0.08, clean: 0.05, other: 0.19 }
    },
    explanation:
      "The consequence of forgetting the umbrella is not explicit, but it is easy to infer.",
    takeaway: "The model must often use information that is implied rather than stated."
  }
];
