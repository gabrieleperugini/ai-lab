import type { LabDay, LabModule } from "../lib/types";
import { day1Modules } from "./day1-llm/modules";
import { learningMachinesModules } from "./learning-machines/modules";
import { hiddenStructureModules } from "./hidden-structure/modules";
import { learningConsequencesModules } from "./day3-unsupervised-rl/modules";

export const days: LabDay[] = [
  {
    // Route stays "day1": the printed slide QR codes deep-link into it.
    id: "day1",
    index: 1,
    title: "Language Models",
    tagline: "Tokens, probabilities, meaning: how chatbots speak",
    narrative:
      "How does mineral matter talk to us through a chatbot? A machine does not receive grammar rules and human understanding directly. Instead, it learns a task: predict the next token. That simple task becomes powerful when repeated, conditioned on context, represented in vectors, and scaled up.",
    available: true,
    modules: day1Modules
  },
  {
    id: "learning-machines",
    index: 2,
    title: "Learning Machines",
    tagline: "Parameters, loss, gradient descent, and neural networks",
    narrative:
      "In the LLM section, we saw a model producing tokens. Now we look at how models learn. We start with the simplest possible trainable model, a line, then climb toward neural networks.",
    available: true,
    modules: learningMachinesModules
  },
  {
    id: "hidden-structure",
    index: 3,
    title: "Hidden Structure",
    tagline: "Clustering, similarity, recommendations",
    narrative:
      "In supervised learning, every example came with an answer. Here, the answers are missing. Can we still discover groups, similarities, strange points, or recommendations? Yes, but only after we decide what 'similar' means.",
    available: true,
    modules: hiddenStructureModules
  },
  {
    // Second thematic section of Day 3 (there is no Day 4).
    id: "learning-consequences",
    index: 3,
    title: "Learning by Consequences",
    tagline: "Rewards, agents, policies",
    narrative:
      "The last kind of learning: no labels and no fixed dataset, just an agent acting in a world and learning from rewards (including rewards that backfire).",
    available: false,
    modules: learningConsequencesModules
  }
];

export function getDay(dayId: string): LabDay | undefined {
  return days.find((d) => d.id === dayId);
}

export function getModule(dayId: string, moduleId: string): LabModule | undefined {
  return getDay(dayId)?.modules.find((m) => m.id === moduleId);
}

export function getAdjacentModules(dayId: string, moduleId: string): {
  prev: LabModule | null;
  next: LabModule | null;
} {
  const day = getDay(dayId);
  if (!day) return { prev: null, next: null };
  const i = day.modules.findIndex((m) => m.id === moduleId);
  return {
    prev: i > 0 ? day.modules[i - 1] : null,
    next: i >= 0 && i < day.modules.length - 1 ? day.modules[i + 1] : null
  };
}
