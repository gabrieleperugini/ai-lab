/**
 * M5 — Tokenizer Microscope presets.
 * The module uses the real GPT-4 tokenizer (cl100k_base) bundled fully
 * client-side via the gpt-tokenizer package. No API calls.
 */

export const tokenizerPresets: string[] = [
  "Hello world!",
  "hello world!",
  " Hello world!",
  "bank",
  " bank",
  "Bank",
  "New York",
  "NewYork",
  "ChatGPT",
  "chatbot",
  "Bocconi",
  "Bocconi Summer School 2026",
  "BocconiSummerSchool2026",
  "Machine Learning and Artificial Intelligence Lab 2026",
  "unbelievable",
  "un-believ-able",
  "anti-dis-establishment",
  "antidisestablishmentarianism",
  "Once upon a time",
  "Once upon a crime",
  "The student opened the test and realized that she had studied the wrong chapter.",
  "The student opened the test and realized what the teacher meant.",
  "No coding needed. Your curiosity is the only requirement.",
  "ChatGPT is not magic; it is computation.",
  "Ciao! Sto studiando intelligenza artificiale.",
  "Non tutte le parole diventano un solo token.",
  "Ciao, come va?",
  "The capital of France is Paris.",
  "The capital of France is Berlin, she said jokingly.",
  "2 + 2 = 4",
  "n = 2k + 1",
  "ha ha ha ha ha",
  "pizza pizza pizza",
  "hhsdjh",
  "pizza 🍕",
  "I love AI!!!",
  "I looooove AI!!!"
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
  "Which preset has more tokens than expected?",
  "Does a leading space matter? Try 'bank' and ' bank'.",
  "Does capitalization matter? Try 'bank' and 'Bank'.",
  "What happens to a made-up word like 'hhsdjh'?",
  "What happens to repeated words? Try 'pizza pizza pizza'.",
  "What happens to Italian text? Compare it with English."
];
