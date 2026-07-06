import type { LabDay, LabModule } from "../lib/types";
import { day1Modules } from "./day1-llm/modules";
import { learningMachinesModules } from "./learning-machines/modules";
import { day3Modules } from "./day3-unsupervised-rl/modules";

export const days: LabDay[] = [
  {
    id: "day1",
    index: 1,
    title: "How chatbots speak: next-token prediction",
    tagline: "Tokens, context, probability, sampling, and a look inside the brain",
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
    id: "day3",
    index: 3,
    title: "How AI discovers and acts: unsupervised learning and RL",
    tagline: "Finding structure without labels, and learning from rewards",
    narrative:
      "Not all learning comes with answers. Today machines find groups nobody labeled, recommend what you might like, and learn to act by trial, error, and reward (including rewards that backfire).",
    available: false,
    modules: day3Modules
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
