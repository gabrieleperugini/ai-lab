/**
 * M5 — Tokenizer Microscope presets.
 * The module uses the real GPT-4 tokenizer (cl100k_base) bundled fully
 * client-side via the gpt-tokenizer package. No API calls.
 */

export const tokenizerPresets: string[] = [
  "Hello world!",
  "hello world!",
  " Hello world!",
  "ChatGPT",
  "chatbot",
  "Bocconi",
  "BocconiSummerSchool2026",
  "unbelievable",
  "anti-dis-establishment",
  "antidisestablishmentarianism",
  "Ciao, come va?",
  "Sto studiando intelligenza artificiale.",
  "The capital of France is Paris.",
  "The capital of France is Berlin, she said jokingly.",
  "2 + 2 = 4",
  "n = 2k + 1",
  "ha ha ha ha ha",
  "hhsdjh",
  "pizza 🍕",
  "I love AI!!!",
  "I looooove AI!!!",
  "New York",
  "NewYork"
];

/** Random-ish strings for the "Surprise me" button. */
export const surpriseStrings: string[] = [
  "supercalifragilisticexpialidocious",
  "Il gatto è sul tavolo.",
  "The mitochondria is the powerhouse of the cell.",
  "🤖🤖🤖 beep boop 🤖🤖🤖",
  "aaaaaaaaaaaaaaaaaaaaaa",
  "E = mc^2 and n = 2k + 1",
  "Once upon a time in Milano",
  "Wi-Fi wifi WIFI wi fi",
  "Schwarzwälderkirschtorte",
  "l'intelligenza artificiale non dorme mai",
  "0.0000001% of the time",
  "GPT LLM NTP AI ML",
  "The lions ate the spreadsheet."
];

export const tokenizerActivities: string[] = [
  "Which sentence has more tokens than you expected?",
  "Does capitalization matter? Compare 'Hello world!' and 'hello world!'.",
  "Do spaces matter? Try adding a space before 'Hello'.",
  "Are emojis one token or several?",
  "Are Italian and English split similarly?",
  "What happens to made-up words like 'hhsdjh'?"
];
