/**
 * M3 — Branching Stories. Each example is a root prompt plus first-token
 * branches; choosing a branch commits the story to a different future.
 */

export type Branch = {
  token: string;
  probability: number;
  continuation: string;
  consequence: string;
};

export type BranchingExample = {
  id: string;
  label: string;
  /** "story" gets a tree look; "proof" gets a ladder-of-commitments look. */
  flavor: "story" | "proof";
  root: string;
  branches: Branch[];
  takeaway: string;
};

export const branchingExamples: BranchingExample[] = [
  {
    id: "student-test",
    label: "The student and the test",
    flavor: "story",
    root: "The student opened the test and realized",
    branches: [
      {
        token: "that",
        probability: 0.28,
        continuation: "that she had studied the wrong chapter.",
        consequence: "This branch introduces a full clause: something is true."
      },
      {
        token: "what",
        probability: 0.18,
        continuation: "what the teacher meant by 'show your reasoning'.",
        consequence: "This branch expects an object or explanation."
      },
      {
        token: "it",
        probability: 0.15,
        continuation: "it was much harder than the practice exercises.",
        consequence: "This branch makes the test itself the subject."
      },
      {
        token: "she",
        probability: 0.12,
        continuation: "she had forgotten her calculator at home.",
        consequence: "This branch shifts attention to the student's action or state."
      },
      {
        token: "for",
        probability: 0.06,
        continuation: "for the first time that memorizing was not enough.",
        consequence: "This is less likely, but still grammatical after a continuation."
      }
    ],
    takeaway:
      "Generation is a sequence of commitments. Small early choices can force very different futures."
  },
  {
    id: "proof-odd-square",
    label: "A proof, one token at a time",
    flavor: "proof",
    root: "The square of an odd number is odd. Proof:",
    branches: [
      {
        token: "Let",
        probability: 0.55,
        continuation: "Let n = 2k + 1. Then n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1.",
        consequence: "This branch starts a standard mathematical proof."
      },
      {
        token: "By",
        probability: 0.15,
        continuation: "By definition, an odd number can be written as 2k + 1.",
        consequence: "This branch begins with a justification."
      },
      {
        token: "The",
        probability: 0.12,
        continuation: "The result follows because the square keeps one unit beyond an even number.",
        consequence: "This branch is more verbal and less formal."
      },
      {
        token: "Pizza",
        probability: 0.01,
        continuation: "Pizza is not a sensible way to begin this proof.",
        consequence: "Very low probability tokens can break the task."
      }
    ],
    takeaway: "Reasoning can also be represented as a sequence of next-token choices."
  }
];
