/**
 * M8 — Real Chatbot Bridge prompt cards + external chatbot links.
 * No API calls: students copy prompts into an external chatbot, or the
 * teacher runs them on the projector.
 */

export type ChallengePrompt = {
  id: string;
  category: string;
  title: string;
  prompt: string;
  beforeQuestion: string;
  discussion: string;
};

export const chatbotChallengePrompts: ChallengePrompt[] = [
  {
    id: "one-token-student-test",
    category: "token constraints",
    title: "One-token continuation",
    prompt:
      "Complete the sentence with exactly one word: The student opened the test and realized",
    beforeQuestion: "Which token do you expect?",
    discussion:
      "Does the chatbot obey the one-word constraint? Does it choose a function word like 'that'?"
  },
  {
    id: "bank-disambiguation",
    category: "context",
    title: "Context changes meaning",
    prompt:
      "Complete each sentence with one word: (1) I entered my bank and saw some ___ (2) I sat by the bank and saw some ___",
    beforeQuestion: "Which continuation changes the most?",
    discussion: "Compare with the Context Lens module."
  },
  {
    id: "world-knowledge",
    category: "world knowledge",
    title: "World knowledge",
    prompt:
      "Complete each sentence in one word: He put the ice cream in the oven and it ___. He put the ice cream in the freezer and it ___.",
    beforeQuestion: "What knowledge is needed?",
    discussion: "Is the model using physics, text statistics, or both?"
  },
  {
    id: "proof-step",
    category: "reasoning",
    title: "Reasoning as next tokens",
    prompt:
      "Continue this proof one line at a time: The square of an odd number is odd. Proof:",
    beforeQuestion: "What is the first useful token?",
    discussion: "Does the model produce a structured proof? Where are the commitments?"
  },
  {
    id: "plausible-not-true",
    category: "hallucination",
    title: "Plausibility is not truth",
    prompt:
      "Write a clearly fictional encyclopedia paragraph about the imaginary 'Bocconi Mineral Chatbot Theorem'. Make it sound plausible, but start by saying that it is fictional.",
    beforeQuestion: "Can a model produce plausible text about something fake?",
    discussion: "This separates fluency/plausibility from factual correctness."
  },
  {
    id: "style-control",
    category: "style",
    title: "Same content, different style",
    prompt:
      "Explain next-token prediction twice: first to a 10-year-old, then as a dramatic movie trailer.",
    beforeQuestion: "What stays the same? What changes?",
    discussion: "The task is still text continuation, but the context controls style."
  },

  // ---- Additional cards ----
  {
    id: "exactly-one-word-rain",
    category: "token constraints",
    title: "Can it obey one-word constraints?",
    prompt:
      "Complete the sentence with exactly one word: The sky became dark and full of clouds, so I took my",
    beforeQuestion: "Which one word do you expect?",
    discussion: "Does the chatbot give one word, or does it explain?"
  },
  {
    id: "bat-ambiguity",
    category: "context",
    title: "Bat ambiguity",
    prompt:
      "Complete each sentence with one word: (1) The bat flew out of the cave and into the ___ (2) The player picked up the bat and walked to the ___",
    beforeQuestion: "Which meaning of bat is active in each sentence?",
    discussion: "Compare with the Context Lens module."
  },
  {
    id: "plausible-vs-true",
    category: "hallucination",
    title: "Plausible is not the same as true",
    prompt:
      "Complete each sentence in a few words, then say which completions are actually true: (1) The first person to walk on Mars was ___ (2) The capital of Australia is ___ (3) The author of The Hobbit was ___ (4) The largest animal alive today is the ___ (5) A triangle has three ___",
    beforeQuestion: "Which of these can the chatbot answer truthfully? Which one has no true answer at all?",
    discussion:
      "Nobody has walked on Mars, yet a fluent completion is easy to produce. Plausible continuation is not the same as guaranteed truth."
  },
  {
    id: "mouse-ambiguity",
    category: "context",
    title: "Mouse ambiguity",
    prompt:
      "Complete each sentence with one likely word: (1) I saw a mouse running under the kitchen ___ (2) I moved the mouse and clicked on the ___",
    beforeQuestion: "Which words should change?",
    discussion: "Does the chatbot explicitly explain the ambiguity?"
  },
  {
    id: "probability-not-truth",
    category: "hallucination",
    title: "Plausible but fictional",
    prompt:
      "Invent a fictional scientific theorem called the Bocconi Mineral Chatbot Theorem. Make it sound plausible, but clearly mark it as fictional in the first sentence.",
    beforeQuestion: "Can plausible writing be fictional?",
    discussion: "This is a safe way to see fluency without confusing it with truth."
  },
  {
    id: "forgotten-umbrella",
    category: "world knowledge",
    title: "Implied consequence",
    prompt:
      "Complete in one word: Tom forgot his umbrella. When he arrived at school, his clothes were ___. Then explain why.",
    beforeQuestion: "What is implied but not directly stated?",
    discussion: "The model uses common patterns about rain and umbrellas."
  },
  {
    id: "logic-cats",
    category: "reasoning",
    title: "Tiny syllogism",
    prompt:
      "Complete the sentence with exactly one word and then explain: All cats are mammals. Luna is a cat. Therefore Luna is a ___.",
    beforeQuestion: "What is the next word?",
    discussion: "This shows a tiny piece of logical reasoning inside a text task."
  },
  {
    id: "proof-one-token-at-time",
    category: "reasoning",
    title: "Proof one step at a time",
    prompt:
      "Continue this proof, but write only one short line at a time: The square of an odd number is odd. Proof:",
    beforeQuestion: "What should the first line be?",
    discussion: "Compare with the branching proof module."
  },
  {
    id: "style-same-content",
    category: "style",
    title: "Same idea, different styles",
    prompt:
      "Explain next-token prediction in three styles: (1) to a 10-year-old, (2) as a sports commentator, (3) as a dramatic movie trailer.",
    beforeQuestion: "What changes and what stays the same?",
    discussion: "The model follows style cues in the context."
  },
  {
    id: "temperature-simulation",
    category: "sampling",
    title: "Ask for boring and creative outputs",
    prompt:
      "Write five continuations of this sentence. First make them predictable, then make them creative: Once upon a",
    beforeQuestion: "What would low and high temperature feel like?",
    discussion: "The chatbot may simulate diversity even if we do not directly control temperature."
  },
  {
    id: "self-checking",
    category: "limitations",
    title: "Can it check itself?",
    prompt:
      "A number is multiplied by 5. Then 10 is added. The result is 20. The original number was 3. Is this correct? Explain briefly.",
    beforeQuestion: "Will it accept the false statement or correct it?",
    discussion: "A chatbot can sometimes correct false premises, but not always."
  },
  {
    id: "instruction-following",
    category: "instruction following",
    title: "Instructions become context",
    prompt:
      "Translate into Italian, answering with a single word only: good morning",
    beforeQuestion: "Will it answer with exactly one word?",
    discussion: "Instructions are just more context; the model predicts text that fits them."
  }
];

/** External chatbot links (edit freely; shown as buttons in M8). */
export const externalChatbots: { label: string; url: string }[] = [
  { label: "ChatGPT", url: "https://chatgpt.com" },
  { label: "Claude", url: "https://claude.ai" },
  { label: "Gemini", url: "https://gemini.google.com" }
];
