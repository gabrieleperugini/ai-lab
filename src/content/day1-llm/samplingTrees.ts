/**
 * M4 — Sampling Machine prompt families.
 *
 * Each family is defined by:
 *  - `start`: the fixed prompt shown to students;
 *  - `storylines`: weighted continuations. At every step, the next-token
 *    distribution is computed from the storylines that match the text
 *    generated so far (see src/lib/samplingTree.ts). This gives a real
 *    branching token tree that is easy to edit: just add/remove storylines
 *    or change their weights.
 *  - `noise`: rare "weird" tokens that are always mixed in with small
 *    probability. They almost never appear at low temperature, and become
 *    visible at high temperature.
 *  - `fallback`: distribution used when the model wanders off every
 *    storyline (e.g. right after sampling a noise token). It contains glue
 *    words and sentence-ending punctuation so the text can always finish.
 *
 * All numbers are teaching values, not real model outputs.
 */

export type Storyline = { text: string; weight: number };

export type SamplingFamily = {
  id: string;
  label: string;
  emoji: string;
  start: string;
  storylines: Storyline[];
  noise: Record<string, number>;
  /** Total probability mass given to noise tokens at temperature 1. */
  noiseMass: number;
  fallback: Record<string, number>;
};

export const samplingFamilies: SamplingFamily[] = [
  {
    id: "fairy-tale",
    label: "Fairy tale",
    emoji: "🏰",
    start: "Once upon a",
    storylines: [
      { text: "time, there was a small robot who wanted to understand humans.", weight: 0.38 },
      { text: "time, there was a small robot who dreamed of becoming a poet.", weight: 0.2 },
      { text: "time, a young princess discovered a talking mirror in the attic.", weight: 0.12 },
      { text: "strange night, a stone opened its eyes and asked a question.", weight: 0.09 },
      { text: "dark evening, the castle lights went out one by one.", weight: 0.07 },
      { text: "crime, the detective realized the clue was a single missing word.", weight: 0.06 },
      { text: "small island, a lighthouse keeper collected bottles full of stories.", weight: 0.05 },
      { text: "quantum afternoon, the cat was both asleep and awake.", weight: 0.03 }
    ],
    noise: { lion: 0.3, spreadsheet: 0.2, thorium: 0.15, sneeze: 0.15, wifi: 0.2 },
    noiseMass: 0.05,
    fallback: {
      "and": 0.2,
      "the": 0.18,
      "magic": 0.08,
      "kingdom": 0.08,
      "slowly": 0.07,
      "everyone": 0.06,
      "forever": 0.05,
      ".": 0.28
    }
  },
  {
    id: "student-test",
    label: "Student test",
    emoji: "📝",
    start: "The student opened the test and realized",
    storylines: [
      { text: "that she had studied the wrong chapter.", weight: 0.26 },
      { text: "that the first question was about her favorite topic.", weight: 0.1 },
      { text: "what the teacher meant by reasoning.", weight: 0.16 },
      { text: "it was not a memory test but a thinking test.", weight: 0.14 },
      { text: "she had forgotten her calculator.", weight: 0.12 },
      { text: "how little the practice exercises had helped.", weight: 0.09 },
      { text: "for the first time that memorizing was not enough.", weight: 0.06 },
      { text: "suddenly that silence can be very loud.", weight: 0.04 }
    ],
    noise: { lions: 0.35, pizza: 0.25, beep: 0.2, thorium: 0.2 },
    noiseMass: 0.04,
    fallback: {
      "the": 0.2,
      "and": 0.16,
      "answer": 0.1,
      "question": 0.1,
      "slowly": 0.06,
      "everything": 0.08,
      ".": 0.3
    }
  },
  {
    id: "mineral-chatbot",
    label: "Mineral chatbot",
    emoji: "🪨",
    start: "The small stone with googly eyes looked at the scientist and said",
    storylines: [
      { text: "I have been waiting for someone to ask the right question.", weight: 0.2 },
      { text: "I am made of minerals, yet you taught me to speak.", weight: 0.08 },
      { text: "hello, carbon-based friend.", weight: 0.18 },
      { text: "nothing, because stones cannot speak without electricity.", weight: 0.12 },
      { text: "why do you call it intelligence when I call it probability?", weight: 0.13 },
      { text: "we should talk about what happens between your questions.", weight: 0.09 },
      { text: "beep beep, I am pretending to understand you.", weight: 0.08 },
      { text: "according to my calculations, you are mostly water.", weight: 0.06 },
      { text: "mineral matter has opinions too, you know.", weight: 0.04 },
      { text: "pizza is the only human invention I truly respect.", weight: 0.02 }
    ],
    noise: { lions: 0.3, granite: 0.25, "404": 0.2, volcano: 0.25 },
    noiseMass: 0.05,
    fallback: {
      "and": 0.18,
      "the": 0.16,
      "human": 0.09,
      "question": 0.08,
      "quietly": 0.07,
      "again": 0.07,
      ".": 0.35
    }
  },
  {
    id: "proof",
    label: "Proof",
    emoji: "🧮",
    start: "The square of an odd number is odd. Proof:",
    storylines: [
      { text: "Let n = 2k + 1. Then n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1. QED.", weight: 0.55 },
      { text: "By definition, an odd number can be written as 2k + 1.", weight: 0.15 },
      { text: "The result follows because the square keeps one unit beyond an even number.", weight: 0.12 },
      { text: "Suppose n is odd. Then n = 2k + 1 for some integer k.", weight: 0.08 },
      { text: "Since n is odd, n = 2k + 1 for some integer k.", weight: 0.06 },
      { text: "Pizza is not a sensible way to begin this proof.", weight: 0.01 }
    ],
    noise: { lions: 0.4, banana: 0.3, maybe: 0.3 },
    noiseMass: 0.03,
    fallback: {
      "therefore": 0.18,
      "the": 0.16,
      "number": 0.1,
      "odd": 0.1,
      "integer": 0.08,
      "follows": 0.08,
      ".": 0.3
    }
  }
];
