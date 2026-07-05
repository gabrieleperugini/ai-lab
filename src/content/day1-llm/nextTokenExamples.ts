/**
 * M1 — Next Token Arena rounds.
 * These are TEACHING DISTRIBUTIONS: hand-designed, model-like probabilities
 * chosen for pedagogical clarity. They are not claimed to be exact outputs
 * of any real model.
 *
 * To add a round: copy one entry, give it a unique id, and make sure the
 * probabilities (plus an optional "other") sum to roughly 1.
 */

export type NextTokenRound = {
  id: string;
  category: string;
  prompt: string;
  choices: string[];
  probabilities: Record<string, number>;
  explanation: string;
  takeaway: string;
};

export const nextTokenRounds: NextTokenRound[] = [
  {
    id: "once-upon",
    category: "syntax and convention",
    prompt: "Once upon a",
    choices: ["time", "crime", "space", "the", "lions"],
    probabilities: {
      time: 0.78,
      crime: 0.08,
      space: 0.06,
      the: 0.05,
      lions: 0.03
    },
    explanation:
      "A familiar phrase makes 'time' very likely, but other continuations are still possible.",
    takeaway: "Next-token prediction is probabilistic even when one answer feels obvious."
  },
  {
    id: "capital-france",
    category: "knowledge",
    prompt: "The capital of France is",
    choices: ["Paris", "Berlin", "Seoul", "also", "lions"],
    probabilities: {
      Paris: 0.86,
      also: 0.06,
      Berlin: 0.03,
      Seoul: 0.02,
      lions: 0.03
    },
    explanation:
      "The most likely answer uses factual knowledge, but sentence continuations like 'also known as...' remain possible.",
    takeaway: "The next token can require knowledge, not just grammar."
  },
  {
    id: "world-cup-1998",
    category: "knowledge through context",
    prompt: "The capital of the country that hosted the World Cup in 1998 is",
    choices: ["Paris", "Berlin", "Seoul", "also", "lions"],
    probabilities: {
      Paris: 0.72,
      Berlin: 0.08,
      Seoul: 0.05,
      also: 0.1,
      lions: 0.05
    },
    explanation:
      "To answer, the model has to connect 'World Cup in 1998' to France and then France to Paris.",
    takeaway: "Sometimes next-token prediction hides a chain of knowledge."
  },
  {
    id: "bank-money",
    category: "context",
    prompt: "The other day I entered my bank and saw some",
    choices: ["desks", "ducks", "customers", "lions"],
    probabilities: {
      desks: 0.46,
      customers: 0.35,
      ducks: 0.06,
      lions: 0.03,
      other: 0.1
    },
    explanation: "Here 'bank' means a financial institution, so furniture and people are likely.",
    takeaway: "Context changes which meaning of a word is active."
  },
  {
    id: "bank-river",
    category: "context",
    prompt: "The other day I went sitting by the bank and saw some",
    choices: ["ducks", "desks", "water", "lions"],
    probabilities: {
      ducks: 0.62,
      water: 0.26,
      desks: 0.05,
      lions: 0.07
    },
    explanation: "Here 'bank' means the side of a river, so ducks become much more likely.",
    takeaway: "The same word can lead to very different predictions."
  },
  {
    id: "trophy-suitcase",
    category: "world knowledge",
    prompt: "The trophy would not fit into the suitcase because it was too",
    choices: ["big", "small", "old", "sharp", "lions"],
    probabilities: {
      big: 0.48,
      small: 0.34,
      old: 0.05,
      sharp: 0.04,
      lions: 0.09
    },
    explanation:
      "The pronoun 'it' is ambiguous. The trophy could be too big, or the suitcase could be too small. World knowledge is needed.",
    takeaway: "Pronouns and common sense can be hidden inside next-token prediction."
  },
  {
    id: "ice-cream-oven",
    category: "world knowledge",
    prompt: "He put the ice cream in the oven and it",
    choices: ["melted", "froze", "laughed", "expanded", "lions"],
    probabilities: {
      melted: 0.78,
      expanded: 0.08,
      froze: 0.04,
      laughed: 0.03,
      lions: 0.07
    },
    explanation: "The likely continuation depends on knowing what heat does to ice cream.",
    takeaway: "Some predictions look like common sense."
  },
  {
    id: "ice-cream-freezer",
    category: "world knowledge",
    prompt: "He put the ice cream in the freezer and it",
    choices: ["froze", "melted", "laughed", "burned", "lions"],
    probabilities: {
      froze: 0.66,
      stayed: 0.14,
      melted: 0.05,
      burned: 0.03,
      lions: 0.12
    },
    explanation: "A small change in context reverses the likely physical outcome.",
    takeaway: "World knowledge is encoded indirectly through examples."
  },
  {
    id: "breakfast-friedrich",
    category: "probability and stereotypes",
    prompt: "For breakfast, Friedrich usually eats",
    choices: ["cereal", "eggs", "croissants", "bratwurst", "cake", "thorium", "lions"],
    probabilities: {
      cereal: 0.22,
      eggs: 0.18,
      croissants: 0.14,
      bratwurst: 0.14,
      cake: 0.06,
      thorium: 0.01,
      lions: 0.02,
      other: 0.23
    },
    explanation:
      "Many answers are plausible. A name may shift expectations, but there is no single truth.",
    takeaway: "Probabilities are not facts. They reflect patterns and assumptions."
  },
  {
    id: "breakfast-federico",
    category: "probability and stereotypes",
    prompt: "For breakfast, Federico usually eats",
    choices: ["cereal", "eggs", "croissants", "coffee", "cookies", "diamonds", "lions"],
    probabilities: {
      coffee: 0.22,
      cereal: 0.2,
      eggs: 0.16,
      croissants: 0.14,
      cookies: 0.07,
      diamonds: 0.01,
      lions: 0.02,
      other: 0.18
    },
    explanation:
      "A subtle cue can shift the distribution, but the model is not reading Federico's mind.",
    takeaway: "A model predicts plausible text, not personal truth."
  },
  {
    id: "student-test",
    category: "function words and branching",
    prompt: "The student opened the test and realized",
    choices: ["that", "what", "it", "she", "how", "for", "lions"],
    probabilities: {
      that: 0.28,
      what: 0.18,
      it: 0.15,
      she: 0.12,
      how: 0.1,
      for: 0.06,
      lions: 0.01,
      other: 0.1
    },
    explanation:
      "The next token may be a small function word. Once chosen, it strongly shapes the rest of the sentence.",
    takeaway: "Tiny words can control large future branches."
  },
  {
    id: "algebra-one-step",
    category: "reasoning",
    prompt:
      "A number is multiplied by 5. Then 10 is added. The result is 20. Therefore, the original number was",
    choices: ["1", "2", "3", "4", "5"],
    probabilities: {
      "1": 0.06,
      "2": 0.74,
      "3": 0.08,
      "4": 0.06,
      "5": 0.06
    },
    explanation:
      "The likely token requires doing a small inverse calculation: (20 - 10) / 5 = 2.",
    takeaway: "Sometimes the best next token requires computation or reasoning."
  }
];
