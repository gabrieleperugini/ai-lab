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
  },

  // ---- Original pairs beyond the slides ----
  {
    id: "bat-animal-sport",
    title: "Animal or sports equipment?",
    leftLabel: "Cave",
    rightLabel: "Baseball",
    left: {
      prompt: "The bat flew out of the cave and into the",
      highlight: ["flew", "cave"],
      probabilities: { night: 0.57, sky: 0.2, stadium: 0.05, other: 0.18 }
    },
    right: {
      prompt: "The player picked up the bat and walked to the",
      highlight: ["player", "picked", "walked"],
      probabilities: { plate: 0.34, field: 0.29, stadium: 0.16, cave: 0.02, other: 0.19 }
    },
    explanation:
      "The word 'bat' stays the same, but the surrounding words select a different meaning.",
    takeaway: "One word, two worlds; the context picks the world."
  },
  {
    id: "mouse-animal-computer",
    title: "Animal or device?",
    leftLabel: "Kitchen",
    rightLabel: "Computer",
    left: {
      prompt: "I saw a mouse running under the kitchen",
      highlight: ["running", "kitchen"],
      probabilities: { table: 0.32, cabinet: 0.22, door: 0.12, cursor: 0.01, other: 0.33 }
    },
    right: {
      prompt: "I moved the mouse and clicked on the",
      highlight: ["moved", "clicked"],
      probabilities: { icon: 0.35, button: 0.24, file: 0.12, cheese: 0.01, other: 0.28 }
    },
    explanation: "Actions like running and clicking make different meanings likely.",
    takeaway: "Verbs are powerful context clues."
  },
  {
    id: "apple-fruit-company",
    title: "Fruit or company?",
    leftLabel: "Lunch",
    rightLabel: "Technology",
    left: {
      prompt: "For lunch she ate an apple and a",
      highlight: ["ate", "lunch"],
      probabilities: { sandwich: 0.32, banana: 0.2, yogurt: 0.12, laptop: 0.02, other: 0.34 }
    },
    right: {
      prompt: "She bought an Apple laptop and a",
      highlight: ["bought", "laptop"],
      probabilities: { charger: 0.24, phone: 0.18, case: 0.14, banana: 0.01, other: 0.43 }
    },
    explanation: "Capitalization and nearby words can change the meaning completely.",
    takeaway: "Even a capital letter is context."
  },
  {
    id: "cold-drink-illness",
    title: "Temperature or illness?",
    leftLabel: "Drink",
    rightLabel: "Illness",
    left: {
      prompt: "The water was cold, so I added some",
      highlight: ["water", "added"],
      probabilities: { ice: 0.22, lemon: 0.18, sugar: 0.12, medicine: 0.02, other: 0.46 }
    },
    right: {
      prompt: "I had a cold, so I took some",
      highlight: ["had", "took"],
      probabilities: { medicine: 0.44, tea: 0.16, rest: 0.08, ice: 0.01, other: 0.31 }
    },
    explanation: "The same word can describe temperature or illness.",
    takeaway: "Meaning lives in the sentence, not in the word alone."
  },
  {
    id: "light-weight-brightness",
    title: "Not heavy or not dark?",
    leftLabel: "Weight",
    rightLabel: "Brightness",
    left: {
      prompt: "The suitcase was light, so I could carry it with one",
      highlight: ["suitcase", "carry"],
      probabilities: { hand: 0.66, lamp: 0.03, candle: 0.02, other: 0.29 }
    },
    right: {
      prompt: "The room was light, so I could read without a",
      highlight: ["room", "read"],
      probabilities: { lamp: 0.44, flashlight: 0.18, problem: 0.05, hand: 0.02, other: 0.31 }
    },
    explanation: "The same surface word points to different concepts in context.",
    takeaway: "Adjectives can be ambiguous too."
  }
];
