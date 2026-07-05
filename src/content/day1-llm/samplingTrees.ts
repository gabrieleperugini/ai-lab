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
  },
  {
    id: "rainy-morning",
    label: "Rainy morning",
    emoji: "🌧️",
    start: "When I opened the window, the street was",
    storylines: [
      { text: "wet and full of tiny reflections.", weight: 0.3 },
      { text: "wet, and the smell of rain filled the room.", weight: 0.12 },
      { text: "empty except for one cyclist fighting the rain.", weight: 0.16 },
      { text: "shining as if the city had been freshly painted.", weight: 0.12 },
      { text: "noisy with umbrellas, buses, and hurried footsteps.", weight: 0.08 },
      { text: "purple, which made me suspect this was not a normal morning.", weight: 0.02 },
      { text: "singing, or maybe that was just the wind in the wires.", weight: 0.01 }
    ],
    noise: { lions: 0.3, spreadsheet: 0.25, lava: 0.2, wifi: 0.25 },
    noiseMass: 0.05,
    fallback: {
      "and": 0.2,
      "the": 0.16,
      "rain": 0.1,
      "quietly": 0.08,
      "somehow": 0.07,
      "still": 0.07,
      ".": 0.32
    }
  },
  {
    id: "robot-cafeteria",
    label: "Robot cafeteria",
    emoji: "🤖",
    start: "The robot entered the cafeteria and ordered",
    storylines: [
      { text: "coffee, mostly because everyone else did.", weight: 0.28 },
      { text: "pizza and asked whether cheese was a software update.", weight: 0.18 },
      { text: "electricity with a side of politeness.", weight: 0.12 },
      { text: "nothing, then wrote a long review about the experience.", weight: 0.1 },
      { text: "friendship, which was not on the menu but should be.", weight: 0.05 },
      { text: "uranium, and the cook politely suggested soup instead.", weight: 0.01 }
    ],
    noise: { lions: 0.3, "404": 0.25, bolts: 0.2, poetry: 0.25 },
    noiseMass: 0.05,
    fallback: {
      "and": 0.18,
      "the": 0.16,
      "menu": 0.1,
      "again": 0.08,
      "politely": 0.08,
      "loudly": 0.05,
      ".": 0.35
    }
  },
  {
    id: "detective-clue",
    label: "Detective clue",
    emoji: "🕵️",
    start: "The detective looked at the clue and realized",
    storylines: [
      { text: "that the missing word was the key.", weight: 0.32 },
      { text: "it had been placed there too carefully.", weight: 0.22 },
      { text: "the answer was hidden in plain sight.", weight: 0.16 },
      { text: "someone wanted the mistake to be noticed.", weight: 0.08 },
      { text: "nothing, which was itself suspicious.", weight: 0.05 }
    ],
    noise: { lions: 0.35, pizza: 0.3, thorium: 0.35 },
    noiseMass: 0.04,
    fallback: {
      "the": 0.2,
      "and": 0.15,
      "case": 0.1,
      "suddenly": 0.08,
      "someone": 0.08,
      "everything": 0.07,
      ".": 0.32
    }
  },
  {
    id: "space-school",
    label: "Space school",
    emoji: "🚀",
    start: "On the first day of school on Mars, the teacher explained",
    storylines: [
      { text: "gravity would make basketball very confusing.", weight: 0.22 },
      { text: "how to keep notebooks from floating away.", weight: 0.18 },
      { text: "that homework was still required, even on another planet.", weight: 0.16 },
      { text: "why oxygen was not optional.", weight: 0.12 },
      { text: "homework rules first, because some things never change.", weight: 0.1 },
      { text: "spaghetti physics, the most popular subject in the solar system.", weight: 0.01 }
    ],
    noise: { lions: 0.3, wifi: 0.25, dust: 0.2, karaoke: 0.25 },
    noiseMass: 0.05,
    fallback: {
      "the": 0.18,
      "and": 0.16,
      "planet": 0.09,
      "students": 0.09,
      "carefully": 0.07,
      "tomorrow": 0.06,
      ".": 0.35
    }
  },
  {
    id: "ai-proof-helper",
    label: "AI proof helper",
    emoji: "📐",
    start: "To prove that the square of an odd number is odd, first",
    storylines: [
      { text: "write the odd number as 2k + 1.", weight: 0.34 },
      { text: "let n = 2k + 1 for some integer k.", weight: 0.24 },
      { text: "define what odd means in algebraic form.", weight: 0.12 },
      { text: "assume the number has the form 2k + 1 and expand the square.", weight: 0.1 },
      { text: "panic quietly, then remember that algebra is your friend.", weight: 0.01 }
    ],
    noise: { lions: 0.35, banana: 0.3, maybe: 0.35 },
    noiseMass: 0.03,
    fallback: {
      "then": 0.18,
      "the": 0.16,
      "expand": 0.1,
      "square": 0.1,
      "integer": 0.08,
      "carefully": 0.06,
      ".": 0.32
    }
  },
  {
    id: "fake-encyclopedia",
    label: "Plausible nonsense",
    emoji: "📖",
    start: "The Bocconi Mineral Chatbot Theorem states that",
    storylines: [
      {
        text: "all sufficiently polite stones can simulate conversation if given enough tokens.",
        weight: 0.22
      },
      {
        text: "a mineral can appear intelligent when its predictions are fluent enough.",
        weight: 0.2
      },
      {
        text: "mineral reasoning is not a real scientific field, but it sounds convincing here.",
        weight: 0.12
      },
      {
        text: "under carefully imaginary conditions, probability may pretend to be wisdom.",
        weight: 0.08
      },
      { text: "pizza-based logic remains an open research problem.", weight: 0.02 }
    ],
    noise: { lions: 0.3, quartz: 0.3, footnote: 0.4 },
    noiseMass: 0.05,
    fallback: {
      "the": 0.18,
      "and": 0.14,
      "theorem": 0.1,
      "clearly": 0.08,
      "allegedly": 0.08,
      "therefore": 0.07,
      ".": 0.35
    }
  }
];
