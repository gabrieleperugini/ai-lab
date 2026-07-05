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
  },

  // ---- Original examples beyond the slides ----
  {
    id: "weather-clouds",
    category: "common sense",
    prompt: "The sky became dark and full of clouds, so I took my",
    choices: ["umbrella", "sunglasses", "piano", "sandwich", "lions"],
    probabilities: {
      umbrella: 0.66,
      sunglasses: 0.08,
      sandwich: 0.06,
      piano: 0.02,
      lions: 0.01,
      other: 0.17
    },
    explanation: "The sentence suggests rain without explicitly saying rain.",
    takeaway: "Next-token prediction often uses implied information."
  },
  {
    id: "restaurant-menu",
    category: "context",
    prompt: "The waiter handed us the menu and asked what we wanted to",
    choices: ["order", "wear", "download", "repair", "lions"],
    probabilities: {
      order: 0.74,
      wear: 0.04,
      download: 0.03,
      repair: 0.03,
      lions: 0.01,
      other: 0.15
    },
    explanation: "The restaurant context makes 'order' much more likely.",
    takeaway: "Context narrows the space of plausible next tokens."
  },
  {
    id: "doctor-stethoscope",
    category: "world knowledge",
    prompt: "The doctor put the stethoscope on the patient's",
    choices: ["chest", "shoe", "sandwich", "keyboard", "lions"],
    probabilities: {
      chest: 0.71,
      shoe: 0.04,
      sandwich: 0.02,
      keyboard: 0.02,
      lions: 0.01,
      other: 0.2
    },
    explanation: "The likely token depends on knowing how a stethoscope is used.",
    takeaway: "Some predictions look like practical knowledge."
  },
  {
    id: "library-whisper",
    category: "social context",
    prompt: "In the library, everyone started to",
    choices: ["whisper", "shout", "swim", "explode", "lions"],
    probabilities: {
      whisper: 0.46,
      read: 0.2,
      study: 0.14,
      shout: 0.04,
      swim: 0.01,
      lions: 0.01,
      other: 0.14
    },
    explanation: "Social norms make quiet behaviors more likely in a library.",
    takeaway: "Language models pick up social patterns from text."
  },
  {
    id: "recipe-flour",
    category: "procedural knowledge",
    prompt: "To bake a cake, first mix the flour with the",
    choices: ["sugar", "engine", "umbrella", "moon", "lions"],
    probabilities: {
      sugar: 0.41,
      eggs: 0.22,
      butter: 0.14,
      milk: 0.08,
      engine: 0.01,
      umbrella: 0.01,
      lions: 0.01,
      other: 0.12
    },
    explanation: "A recipe context makes ingredients likely.",
    takeaway: "Prediction can encode sequences of actions."
  },
  {
    id: "music-concert",
    category: "event context",
    prompt: "When the singer walked on stage, the crowd began to",
    choices: ["cheer", "sleep", "calculate", "melt", "lions"],
    probabilities: {
      cheer: 0.64,
      clap: 0.18,
      sing: 0.05,
      sleep: 0.02,
      calculate: 0.01,
      lions: 0.01,
      other: 0.09
    },
    explanation: "The event frame makes audience reactions likely.",
    takeaway: "The prompt activates a scenario."
  },
  {
    id: "ambiguous-bat",
    category: "ambiguity",
    prompt: "The bat flew out of the cave and into the",
    choices: ["night", "stadium", "drawer", "spreadsheet", "lions"],
    probabilities: {
      night: 0.57,
      sky: 0.2,
      stadium: 0.05,
      drawer: 0.01,
      spreadsheet: 0.01,
      lions: 0.01,
      other: 0.15
    },
    explanation: "Here 'bat' is an animal, not sports equipment.",
    takeaway: "Nearby words select the relevant meaning."
  },
  {
    id: "ambiguous-bat-sport",
    category: "ambiguity",
    prompt: "The player picked up the bat and stepped onto the",
    choices: ["field", "cave", "night", "freezer", "lions"],
    probabilities: {
      field: 0.49,
      plate: 0.22,
      diamond: 0.12,
      cave: 0.02,
      night: 0.02,
      lions: 0.01,
      other: 0.12
    },
    explanation: "Here 'bat' is sports equipment.",
    takeaway: "The same token can sit in different worlds."
  },
  {
    id: "fake-news-plausibility",
    category: "plausibility versus truth",
    prompt: "According to the imaginary Institute of Cloud Statistics, clouds are made of",
    choices: ["water", "dreams", "cotton", "data", "lions"],
    probabilities: {
      water: 0.44,
      cotton: 0.19,
      data: 0.1,
      dreams: 0.08,
      lions: 0.01,
      other: 0.18
    },
    explanation:
      "The prompt is fictional, but the model can still produce plausible-sounding completions.",
    takeaway: "Plausibility and truth are different goals."
  },
  {
    id: "logic-all-mammals",
    category: "reasoning",
    prompt: "All cats are mammals. Luna is a cat. Therefore, Luna is a",
    choices: ["mammal", "dog", "planet", "proof", "lions"],
    probabilities: {
      mammal: 0.82,
      dog: 0.03,
      proof: 0.02,
      planet: 0.01,
      lions: 0.01,
      other: 0.11
    },
    explanation: "This needs a tiny logical inference.",
    takeaway: "Some next-token choices require reasoning over the prompt."
  },
  {
    id: "translation-cue",
    category: "instruction following",
    prompt: "Translate into Italian: good morning =",
    choices: ["buongiorno", "merci", "hola", "night", "lions"],
    probabilities: {
      buongiorno: 0.82,
      hola: 0.03,
      merci: 0.03,
      night: 0.01,
      lions: 0.01,
      other: 0.1
    },
    explanation: "The prompt tells the model what kind of continuation is expected.",
    takeaway: "Instructions become part of the context."
  },
  {
    id: "style-poem",
    category: "style",
    prompt: "Write like a pirate: The treasure is hidden in the",
    choices: ["cave", "ship", "sea", "spreadsheet", "lions"],
    probabilities: {
      cave: 0.32,
      ship: 0.23,
      sea: 0.19,
      chest: 0.1,
      spreadsheet: 0.01,
      lions: 0.01,
      other: 0.14
    },
    explanation: "The style instruction changes the likely vocabulary.",
    takeaway: "The context controls not only facts, but style."
  },
  {
    id: "phone-battery",
    category: "common sense",
    prompt: "My phone battery was at 1 percent, so I looked for a",
    choices: ["charger", "pizza", "pillow", "map", "lions"],
    probabilities: {
      charger: 0.72,
      map: 0.03,
      pillow: 0.02,
      pizza: 0.02,
      lions: 0.01,
      other: 0.2
    },
    explanation: "Everyday problems come with typical solutions.",
    takeaway: "Common situations create strong expectations."
  },
  {
    id: "goalkeeper-save",
    category: "event context",
    prompt: "The striker kicked the ball and the goalkeeper made an incredible",
    choices: ["save", "sandwich", "speech", "nap", "lions"],
    probabilities: {
      save: 0.78,
      speech: 0.03,
      sandwich: 0.02,
      nap: 0.01,
      lions: 0.01,
      other: 0.15
    },
    explanation: "The football scenario makes 'save' by far the most likely.",
    takeaway: "A scenario is a strong probability magnet."
  }
];
