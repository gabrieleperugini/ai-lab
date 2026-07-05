/**
 * M7 — De-embedding Lens. Toy output-token vectors and preset hidden states.
 * score(token) = dot(hiddenVector, tokenVector); probabilities = softmax(scores / T).
 * Teaching values only.
 */

export type TokenVector = { label: string; x: number; y: number };

export const deembeddingTokens: TokenVector[] = [
  { label: "time", x: -4.5, y: 3.8 },
  { label: "kingdom", x: -4.9, y: 4.3 },
  { label: "crime", x: -3.7, y: 3.0 },
  { label: "Paris", x: -5.0, y: 5.7 },
  { label: "pizza", x: -6.2, y: -4.5 },
  { label: "coffee", x: -4.6, y: -3.1 },
  { label: "ducks", x: -0.1, y: -4.4 },
  { label: "desks", x: -0.1, y: 0.9 },
  { label: "customers", x: -0.4, y: 1.5 },
  { label: "melted", x: -2.2, y: -3.8 },
  { label: "froze", x: -2.8, y: -4.4 },
  { label: "Let", x: 4.8, y: 3.0 },
  { label: "Then", x: 5.2, y: 2.6 },
  { label: "Therefore", x: 5.5, y: 2.3 },
  { label: "that", x: 2.0, y: 4.0 },
  { label: "what", x: 2.4, y: 3.4 },
  { label: "she", x: 3.2, y: 4.1 },
  { label: "hello", x: 6.1, y: 5.6 },
  { label: "I", x: 5.8, y: 5.2 },
  { label: "why", x: 6.5, y: 5.0 },
  { label: "lions", x: 1.8, y: -5.1 }
];

export type HiddenPreset = {
  label: string;
  vector: { x: number; y: number };
  prompt: string;
};

export const hiddenPresets: HiddenPreset[] = [
  { label: "Fairy tale", vector: { x: -4.6, y: 4.0 }, prompt: "Once upon a ..." },
  {
    label: "Proof",
    vector: { x: 5.0, y: 2.8 },
    prompt: "The square of an odd number is odd. Proof: ..."
  },
  {
    label: "Breakfast",
    vector: { x: -4.8, y: -3.5 },
    prompt: "For breakfast, Federico usually eats ..."
  },
  { label: "River bank", vector: { x: -0.4, y: -3.8 }, prompt: "I sat by the bank and saw some ..." },
  {
    label: "Financial bank",
    vector: { x: -0.2, y: 1.2 },
    prompt: "I entered my bank and saw some ..."
  },
  {
    label: "Chatbot greeting",
    vector: { x: 6.0, y: 5.4 },
    prompt: "The small stone looked at me and said ..."
  }
];
