/**
 * M6 - Meaning Map dataset (3D edition).
 * TOY embedding coordinates, hand-placed to create meaningful clusters.
 * This is a teaching map, not a real embedding. To use real embeddings later,
 * replace this file with 3D-projected coordinates (e.g. PCA of real vectors)
 * keeping the same shape.
 */

export type EmbeddingPoint = {
  label: string;
  x: number;
  y: number;
  z: number;
  tags: string[];
};

export const embeddingPoints: EmbeddingPoint[] = [
  // royalty and people
  { label: "king", x: 5.8, y: 5.8, z: 1.2, tags: ["royalty", "person"] },
  { label: "queen", x: 5.7, y: 6.5, z: 1.4, tags: ["royalty", "person"] },
  { label: "prince", x: 5.2, y: 5.4, z: 1.1, tags: ["royalty", "person"] },
  { label: "princess", x: 5.1, y: 6.2, z: 1.3, tags: ["royalty", "person"] },
  { label: "man", x: 4.3, y: 4.8, z: 0.6, tags: ["person"] },
  { label: "woman", x: 4.2, y: 5.6, z: 0.8, tags: ["person"] },
  { label: "student", x: 3.3, y: 3.8, z: 0.9, tags: ["school", "person"] },
  { label: "teacher", x: 3.5, y: 4.3, z: 1.0, tags: ["school", "person"] },

  // cities and countries
  { label: "Milan", x: -5.7, y: 5.6, z: 0.4, tags: ["city", "Italy"] },
  { label: "Rome", x: -5.9, y: 5.2, z: 0.4, tags: ["city", "Italy"] },
  { label: "Italy", x: -6.4, y: 5.4, z: 0.2, tags: ["country"] },
  { label: "Paris", x: -4.8, y: 5.7, z: 0.5, tags: ["city", "France"] },
  { label: "France", x: -4.4, y: 5.2, z: 0.2, tags: ["country"] },
  { label: "Berlin", x: -4.1, y: 4.5, z: 0.5, tags: ["city", "Germany"] },
  { label: "Germany", x: -3.7, y: 4.1, z: 0.2, tags: ["country"] },
  { label: "Seoul", x: -3.0, y: 5.5, z: 0.6, tags: ["city", "Korea"] },

  // food and drink
  { label: "pizza", x: -6.2, y: -4.5, z: -0.6, tags: ["food", "Italy"] },
  { label: "pasta", x: -5.9, y: -4.1, z: -0.5, tags: ["food", "Italy"] },
  { label: "gelato", x: -5.6, y: -3.7, z: -0.4, tags: ["food", "Italy", "dessert"] },
  { label: "sushi", x: -4.8, y: -4.8, z: -0.2, tags: ["food"] },
  { label: "croissant", x: -5.1, y: -3.8, z: -0.3, tags: ["food", "breakfast"] },
  { label: "cereal", x: -4.3, y: -3.6, z: -0.4, tags: ["food", "breakfast"] },
  { label: "eggs", x: -4.0, y: -4.0, z: -0.4, tags: ["food", "breakfast"] },
  { label: "coffee", x: -4.6, y: -3.1, z: -0.5, tags: ["drink", "breakfast"] },
  { label: "bratwurst", x: -3.5, y: -4.4, z: -0.4, tags: ["food", "Germany"] },
  { label: "cake", x: -5.5, y: -3.2, z: -0.3, tags: ["food", "dessert"] },

  // animals
  { label: "cat", x: 1.4, y: -5.2, z: 1.0, tags: ["animal"] },
  { label: "dog", x: 1.1, y: -5.6, z: 1.0, tags: ["animal"] },
  { label: "lion", x: 2.2, y: -5.1, z: 1.1, tags: ["animal"] },
  { label: "duck", x: 0.2, y: -4.7, z: 0.8, tags: ["animal", "river"] },
  { label: "mouse (animal)", x: 1.0, y: -4.4, z: 1.0, tags: ["animal", "ambiguous"] },
  { label: "bat (animal)", x: 1.9, y: -4.2, z: 1.0, tags: ["animal", "ambiguous"] },

  // nature
  { label: "river", x: -0.8, y: -3.6, z: -0.2, tags: ["nature"] },
  { label: "water", x: -1.0, y: -4.0, z: -0.2, tags: ["nature"] },
  { label: "shore", x: -0.5, y: -3.2, z: -0.2, tags: ["nature"] },
  { label: "bank (river)", x: -0.6, y: -3.3, z: -0.1, tags: ["nature", "ambiguous"] },

  // finance, office, technology
  { label: "bank (money)", x: -0.7, y: 0.8, z: 1.2, tags: ["finance", "ambiguous"] },
  { label: "loan", x: -1.3, y: 1.2, z: 1.1, tags: ["finance"] },
  { label: "cash", x: -1.6, y: 0.6, z: 1.0, tags: ["finance"] },
  { label: "desk", x: -0.1, y: 0.9, z: 0.9, tags: ["office"] },
  { label: "customer", x: -0.4, y: 1.5, z: 1.0, tags: ["office", "person"] },
  { label: "mouse (computer)", x: 0.4, y: 1.8, z: 1.1, tags: ["technology", "ambiguous"] },
  { label: "keyboard", x: 0.8, y: 1.9, z: 1.0, tags: ["technology"] },
  { label: "screen", x: 1.0, y: 2.1, z: 1.0, tags: ["technology"] },

  // emotions
  { label: "happy", x: 6.1, y: -0.8, z: -0.7, tags: ["emotion"] },
  { label: "sad", x: 6.3, y: -2.0, z: -0.8, tags: ["emotion"] },
  { label: "angry", x: 7.0, y: -1.5, z: -0.6, tags: ["emotion"] },
  { label: "worried", x: 5.6, y: -1.9, z: -0.8, tags: ["emotion"] },
  { label: "excited", x: 6.6, y: -0.4, z: -0.5, tags: ["emotion"] },
  { label: "calm", x: 5.5, y: -0.6, z: -0.6, tags: ["emotion"] },

  // math and reasoning
  { label: "proof", x: 4.9, y: 2.8, z: 2.0, tags: ["math", "reasoning"] },
  { label: "theorem", x: 5.4, y: 3.1, z: 2.1, tags: ["math", "reasoning"] },
  { label: "number", x: 4.4, y: 2.3, z: 1.8, tags: ["math"] },
  { label: "square", x: 4.8, y: 2.1, z: 1.8, tags: ["math"] },
  { label: "odd", x: 4.1, y: 2.0, z: 1.7, tags: ["math"] },
  { label: "even", x: 4.0, y: 1.7, z: 1.7, tags: ["math"] },
  { label: "therefore", x: 5.3, y: 2.5, z: 2.0, tags: ["reasoning"] },

  // AI and computation
  { label: "token", x: 6.4, y: 5.0, z: 2.7, tags: ["AI", "language"] },
  { label: "embedding", x: 6.9, y: 5.4, z: 2.8, tags: ["AI", "vector"] },
  { label: "vector", x: 7.2, y: 5.1, z: 2.6, tags: ["math", "AI"] },
  { label: "probability", x: 6.1, y: 4.3, z: 2.5, tags: ["AI", "math"] },
  { label: "model", x: 6.8, y: 4.5, z: 2.6, tags: ["AI"] },
  { label: "neuron", x: 7.3, y: 4.2, z: 2.4, tags: ["AI", "NN"] },
  { label: "chatbot", x: 6.4, y: 5.8, z: 2.9, tags: ["AI", "language"] },
  { label: "language", x: 5.9, y: 5.1, z: 2.5, tags: ["language"] },
  { label: "grammar", x: 5.2, y: 4.8, z: 2.4, tags: ["language"] }
];

/** Category toggles shown in the UI: tag -> display color. */
export const embeddingCategories: { tag: string; label: string; color: string }[] = [
  { tag: "person", label: "People", color: "#3b64c0" },
  { tag: "royalty", label: "Royalty", color: "#7b5cd6" },
  { tag: "city", label: "Cities", color: "#1d9e9e" },
  { tag: "country", label: "Countries", color: "#0c7a68" },
  { tag: "food", label: "Food", color: "#d97e00" },
  { tag: "breakfast", label: "Breakfast", color: "#c05f2c" },
  { tag: "animal", label: "Animals", color: "#8a6d1a" },
  { tag: "nature", label: "Nature", color: "#2c9c6a" },
  { tag: "finance", label: "Finance", color: "#546073" },
  { tag: "office", label: "Office", color: "#7a8699" },
  { tag: "technology", label: "Technology", color: "#3a7ca5" },
  { tag: "emotion", label: "Emotions", color: "#d64550" },
  { tag: "math", label: "Math", color: "#123c8c" },
  { tag: "reasoning", label: "Reasoning", color: "#4053a3" },
  { tag: "AI", label: "AI", color: "#b0399f" },
  { tag: "language", label: "Language", color: "#2f7fc1" },
  { tag: "ambiguous", label: "Ambiguous", color: "#1b2233" }
];

export type EmbeddingPuzzle = {
  id: string;
  prompt: string;
  /** "analogy" draws the relation arrow; "question" is answered by clicking. */
  kind: "analogy" | "question";
  /** Analogy: reuse the direction relationFrom -> relationTo starting at start. */
  start?: string;
  relationFrom?: string;
  relationTo?: string;
  /** Question: labels the student chooses among (all clickable on the map too). */
  options?: string[];
  answer: string;
  explanation: string;
};

export const embeddingPuzzles: EmbeddingPuzzle[] = [
  {
    id: "royalty",
    kind: "analogy",
    prompt: "king is to queen as prince is to ?",
    start: "prince",
    relationFrom: "king",
    relationTo: "queen",
    answer: "princess",
    explanation: "The direction from king to queen is reused from prince."
  },
  {
    id: "capital-country",
    kind: "analogy",
    prompt: "Italy is to Rome as France is to ?",
    start: "France",
    relationFrom: "Italy",
    relationTo: "Rome",
    answer: "Paris",
    explanation: "This toy map encodes country to capital relations."
  },
  {
    id: "ambiguous-bank",
    kind: "question",
    prompt: "Which of the two 'bank' points is closer to 'river'?",
    options: ["bank (money)", "bank (river)"],
    answer: "bank (river)",
    explanation:
      "The same word form can have different meanings in different regions of the map."
  },
  {
    id: "food-neighbor",
    kind: "question",
    prompt: "Which point should be closest to pizza: pasta, theorem, duck, or loan?",
    options: ["pasta", "theorem", "duck", "loan"],
    answer: "pasta",
    explanation: "Similarity in meaning becomes closeness in the map."
  }
];
