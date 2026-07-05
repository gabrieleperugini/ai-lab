/**
 * M8 — Real Chatbot Bridge prompt cards + external chatbot links.
 * No API calls: students copy prompts into an external chatbot, or the
 * teacher runs them on the projector.
 */

export type ChallengePrompt = {
  id: string;
  title: string;
  prompt: string;
  beforeQuestion: string;
  discussion: string;
};

export const chatbotChallengePrompts: ChallengePrompt[] = [
  {
    id: "one-token-student-test",
    title: "One-token continuation",
    prompt:
      "Complete the sentence with exactly one word: The student opened the test and realized",
    beforeQuestion: "Which token do you expect?",
    discussion:
      "Does the chatbot obey the one-word constraint? Does it choose a function word like 'that'?"
  },
  {
    id: "bank-disambiguation",
    title: "Context changes meaning",
    prompt:
      "For each sentence, give the three most likely next words: (1) I entered my bank and saw some ___ (2) I sat by the bank and saw some ___",
    beforeQuestion: "Which continuation changes the most?",
    discussion: "Compare with the Context Lens module."
  },
  {
    id: "world-knowledge",
    title: "World knowledge",
    prompt:
      "Complete each sentence in one word: He put the ice cream in the oven and it ___. He put the ice cream in the freezer and it ___.",
    beforeQuestion: "What knowledge is needed?",
    discussion: "Is the model using physics, text statistics, or both?"
  },
  {
    id: "proof-step",
    title: "Reasoning as next tokens",
    prompt:
      "Continue this proof one line at a time: The square of an odd number is odd. Proof:",
    beforeQuestion: "What is the first useful token?",
    discussion: "Does the model produce a structured proof? Where are the commitments?"
  },
  {
    id: "plausible-not-true",
    title: "Plausibility is not truth",
    prompt:
      "Write a clearly fictional encyclopedia paragraph about the imaginary 'Bocconi Mineral Chatbot Theorem'. Make it sound plausible, but start by saying that it is fictional.",
    beforeQuestion: "Can a model produce plausible text about something fake?",
    discussion: "This separates fluency/plausibility from factual correctness."
  },
  {
    id: "style-control",
    title: "Same content, different style",
    prompt:
      "Explain next-token prediction twice: first to a 10-year-old, then as a dramatic movie trailer.",
    beforeQuestion: "What stays the same? What changes?",
    discussion: "The task is still text continuation, but the context controls style."
  }
];

/** External chatbot links (edit freely; shown as buttons in M8). */
export const externalChatbots: { label: string; url: string }[] = [
  { label: "ChatGPT", url: "https://chatgpt.com" },
  { label: "Claude", url: "https://claude.ai" },
  { label: "Gemini", url: "https://gemini.google.com" }
];
