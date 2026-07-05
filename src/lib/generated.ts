/** Types for the JSON files produced by scripts/generate_day1_llm_content.py
 * and scripts/generate_day1_embeddings.py. */

export type GenOption = {
  label: string;
  tokenText?: string;
  tokenIds?: number[];
  tokenStrings?: string[];
  probability: number;
  rank?: number | null;
  multiToken?: boolean;
  /** True when this option was added because the model itself ranked it high. */
  fromModel?: boolean;
};

export type GenM1Example = {
  id: string;
  category: string;
  prompt: string;
  displayMode: string;
  options: GenOption[];
  other: number;
  explanation: string;
  takeaway: string;
  /** Bridge button to a related module, shown after reveal. */
  link?: { module: string; label: string } | null;
};

export type GenM1 = { model: string; examples: GenM1Example[]; notes: string };

export type GenM2Side = { prompt: string; options: { label: string; probability: number }[]; other: number };

export type GenM2Pair = {
  id: string;
  title: string;
  labelA: string;
  labelB: string;
  a: GenM2Side;
  b: GenM2Side;
  candidates: string[];
  explanation: string;
};

export type GenM2 = { model: string; pairs: GenM2Pair[] };

export type GenBranchOption = {
  text: string;
  probability: number;
  next: string | null;
  ending?: string;
};

export type GenBranchNode = { context: string; options: GenBranchOption[]; other: number };

export type GenM3Tree = {
  id: string;
  title: string;
  root: string;
  nodes: Record<string, GenBranchNode>;
};

export type GenM3 = { model: string; trees: GenM3Tree[]; notes: string };

export type GenSampleSet = {
  label: string;
  temperature: number;
  top_k: number;
  top_p: number;
  samples: string[];
};

export type GenM4Prompt = {
  id: string;
  prompt: string;
  firstStep: { options: { text: string; probability: number }[]; other: number };
  sampleSets: GenSampleSet[];
};

export type GenM4 = { model: string; prompts: GenM4Prompt[]; notes: string };

export type GenReasoningOption = {
  display: string;
  deadEnd: boolean;
  note: string;
  relativeScore: number;
};

export type GenReasoningStep = {
  context: string;
  why: string;
  options: GenReasoningOption[];
};

export type GenReasoning = {
  model: string;
  root: string;
  finalText: string;
  steps: GenReasoningStep[];
  notes: string;
};

export type GenEmbeddingPoint = {
  label: string;
  x: number;
  y: number;
  z: number;
  category: string;
  neighbors: { label: string; similarity: number }[];
};

export type GenEmbeddingPuzzle = {
  id: string;
  kind: "analogy" | "odd-one-out" | "question" | "explore";
  prompt: string;
  a?: string;
  b?: string;
  c?: string;
  options?: string[];
  answer: string;
  explanation: string;
};

export type GenM6 = {
  model: string;
  projection: string;
  points: GenEmbeddingPoint[];
  puzzles: GenEmbeddingPuzzle[];
};
