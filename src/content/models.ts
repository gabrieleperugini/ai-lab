/**
 * Registry of the precomputed language models. Every model listed here has a
 * full set of JSON files under src/content/generated/day1/<key>/ produced by
 * scripts/generate_day1_llm_content.py (run it with
 * --models "gpt2,Qwen/Qwen2.5-0.5B").
 *
 * To add a model: run the script with its Hugging Face name, add the imports
 * below, and append an entry to MODELS. The compare dropdown picks it up
 * automatically. The first entry is the default shown to students.
 */
import type { GenM1, GenM2, GenM3, GenM4, GenReasoning } from "../lib/generated";

import m1Qwen from "./generated/day1/qwen2.5-0.5b/m1_next_token.json";
import m2Qwen from "./generated/day1/qwen2.5-0.5b/m2_context_switch.json";
import m3Qwen from "./generated/day1/qwen2.5-0.5b/m3_branching.json";
import m4Qwen from "./generated/day1/qwen2.5-0.5b/m4_sampling.json";
import reasoningQwen from "./generated/day1/qwen2.5-0.5b/reasoning_demo.json";

import m1Gpt2 from "./generated/day1/gpt2/m1_next_token.json";
import m2Gpt2 from "./generated/day1/gpt2/m2_context_switch.json";
import m3Gpt2 from "./generated/day1/gpt2/m3_branching.json";
import m4Gpt2 from "./generated/day1/gpt2/m4_sampling.json";
import reasoningGpt2 from "./generated/day1/gpt2/reasoning_demo.json";

export const MODELS = [
  { key: "qwen2.5-0.5b", label: "Qwen2.5 0.5B (2024)" },
  { key: "gpt2", label: "GPT-2 small (2019)" }
] as const;

export type ModelKey = (typeof MODELS)[number]["key"];

export const DEFAULT_MODEL: ModelKey = MODELS[0].key;

export const m1Data: Record<ModelKey, GenM1> = {
  "qwen2.5-0.5b": m1Qwen as GenM1,
  gpt2: m1Gpt2 as GenM1
};

export const m2Data: Record<ModelKey, GenM2> = {
  "qwen2.5-0.5b": m2Qwen as GenM2,
  gpt2: m2Gpt2 as GenM2
};

export const m3Data: Record<ModelKey, GenM3> = {
  "qwen2.5-0.5b": m3Qwen as GenM3,
  gpt2: m3Gpt2 as GenM3
};

export const m4Data: Record<ModelKey, GenM4> = {
  "qwen2.5-0.5b": m4Qwen as GenM4,
  gpt2: m4Gpt2 as GenM4
};

export const reasoningData: Record<ModelKey, GenReasoning> = {
  "qwen2.5-0.5b": reasoningQwen as GenReasoning,
  gpt2: reasoningGpt2 as GenReasoning
};

export function modelLabel(key: ModelKey): string {
  return MODELS.find((m) => m.key === key)?.label ?? key;
}
