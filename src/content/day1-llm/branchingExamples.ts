/**
 * M3 - Branching Stories, multi-step edition.
 * Each example is a root prompt plus a nested tree of token choices.
 * Students pick a token, see new probabilities, pick again, and reach a
 * short ending. The text so far is always root + chosen tokens.
 * Probabilities are teaching distributions, not measured model outputs.
 */

export type BranchChoice = {
  token: string;
  probability: number;
  /** Shown right after this token is chosen. */
  explanation?: string;
  /** Next-step choices. Omit when `ending` is present. */
  choices?: BranchChoice[];
  /** Final continuation revealed when this token is a leaf. */
  ending?: string;
};

export type BranchingExample = {
  id: string;
  title: string;
  /** "story" or "proof"; the proof gets a ladder-of-commitments framing. */
  flavor: "story" | "proof";
  root: string;
  choices: BranchChoice[];
  takeaway: string;
};

export const branchingExamples: BranchingExample[] = [
  {
    id: "student-test-multistep",
    title: "The test",
    flavor: "story",
    root: "The student opened the test and realized",
    takeaway:
      "Generation is a sequence of commitments. Small early choices can force very different futures.",
    choices: [
      {
        token: "that",
        probability: 0.3,
        explanation: "This starts a full clause: something is true.",
        choices: [
          { token: "she", probability: 0.32, ending: "had studied the wrong chapter." },
          { token: "the", probability: 0.28, ending: "questions were about a different topic." },
          { token: "memorizing", probability: 0.13, ending: "was not enough." }
        ]
      },
      {
        token: "what",
        probability: 0.2,
        explanation: "This expects an object or idea to be understood.",
        choices: [
          { token: "the", probability: 0.44, ending: "teacher meant by 'show your reasoning'." },
          { token: "was", probability: 0.18, ending: "missing from her preparation." }
        ]
      },
      {
        token: "she",
        probability: 0.12,
        explanation: "This shifts the sentence toward the student's action or state.",
        choices: [
          { token: "had", probability: 0.55, ending: "forgotten her calculator." },
          { token: "could", probability: 0.2, ending: "solve it by thinking step by step." }
        ]
      },
      {
        token: "for",
        probability: 0.05,
        explanation: "This is less likely, but can still become grammatical.",
        choices: [
          { token: "the", probability: 0.6, ending: "first time that guessing was a bad strategy." }
        ]
      }
    ]
  },
  {
    id: "mineral-chatbot-multistep",
    title: "The talking stone",
    flavor: "story",
    root: "The small stone looked at the scientist and said",
    takeaway: "Each sampled token becomes context for the next prediction.",
    choices: [
      {
        token: "I",
        probability: 0.24,
        explanation: "A first-person continuation begins.",
        choices: [
          { token: "am", probability: 0.42, ending: "not alive, but I can still compute." },
          { token: "have", probability: 0.24, ending: "been waiting for your prompt." }
        ]
      },
      {
        token: "hello",
        probability: 0.2,
        explanation: "A greeting sets a friendly register.",
        choices: [
          { token: ",", probability: 0.5, ending: "carbon-based friend." },
          { token: "there", probability: 0.18, ending: ". I am a very polite mineral." }
        ]
      },
      {
        token: "why",
        probability: 0.12,
        explanation: "A question is coming; the sentence must now ask something.",
        choices: [
          { token: "do", probability: 0.55, ending: "you call prediction intelligence?" },
          { token: "am", probability: 0.18, ending: "I suddenly in a summer school?" }
        ]
      }
    ]
  },
  {
    id: "proof-multistep",
    title: "Proof as a sequence of commitments",
    flavor: "proof",
    root: "The square of an odd number is odd. Proof:",
    takeaway: "Reasoning can also be represented as a chain of next-token choices.",
    choices: [
      {
        token: "Let",
        probability: 0.56,
        explanation: "The classic way to open a proof: introduce a variable.",
        choices: [
          {
            token: "n",
            probability: 0.64,
            ending: "= 2k + 1. Then n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1."
          },
          {
            token: "x",
            probability: 0.12,
            ending: "be an odd integer, so x = 2k + 1 for some integer k."
          }
        ]
      },
      {
        token: "Since",
        probability: 0.16,
        explanation: "This opening commits to a justification structure.",
        choices: [
          { token: "n", probability: 0.4, ending: "is odd, n = 2k + 1 for some integer k." },
          {
            token: "every",
            probability: 0.2,
            ending: "odd number has the form 2k + 1, the result follows by expanding."
          }
        ]
      },
      {
        token: "Pizza",
        probability: 0.01,
        explanation: "A very unlikely token can derail the whole task.",
        choices: [
          { token: "is", probability: 0.5, ending: "not a useful way to start this proof." }
        ]
      }
    ]
  }
];
