# Content editing guide

All teaching content lives in `src/content/`. You can change examples,
probabilities, datasets, and poll links without touching any component.
After editing, run `npm run dev` to check, `npm run build` to publish.

## Where things live

| File | What it controls |
| --- | --- |
| `src/content/days.ts` | Day titles, taglines, narratives, availability |
| `src/content/day1-llm/modules.ts` | Module metadata: missions, instructions, reflection questions, takeaways, teacher notes, **poll URLs**, durations |
| `src/content/day1-llm/nextTokenExamples.ts` | M1 rounds |
| `src/content/day1-llm/contextExamples.ts` | M2 prompt pairs |
| `src/content/day1-llm/branchingExamples.ts` | M3 trees |
| `src/content/day1-llm/samplingTrees.ts` | M4 prompt families (storylines, noise, fallback) |
| `src/content/day1-llm/tokenizationExamples.ts` | M5 presets, surprise strings, checklist |
| `src/content/day1-llm/embeddingDataset.ts` | M6 points, categories, analogy puzzles |
| `src/content/day1-llm/deembeddingExamples.ts` | M7 token vectors and hidden-state presets |
| `src/content/day1-llm/chatbotChallengePrompts.ts` | M8 prompt cards and external chatbot links |
| `src/content/day2-nn/modules.ts`, `src/content/day3-unsupervised-rl/modules.ts` | Day 2/3 scaffolding |

## How to change probabilities

Probabilities are plain numbers that should sum to roughly 1. An optional
`other` entry renders as a gray italic "other tokens" bar. Example (M1):

```ts
probabilities: { desks: 0.46, customers: 0.35, ducks: 0.06, lions: 0.03, other: 0.10 }
```

## How to add a new next-token round (M1)

Append to `nextTokenRounds` in `nextTokenExamples.ts`:

```ts
{
  id: "my-new-round",              // unique
  category: "context",             // shown as a chip
  prompt: "The pizza arrived and it was still",
  choices: ["hot", "cold", "alive", "lions"],
  probabilities: { hot: 0.7, cold: 0.2, alive: 0.02, lions: 0.08 },
  explanation: "Why the distribution looks like this.",
  takeaway: "One-sentence idea to remember."
}
```

The round appears automatically in the Arena rotation.

## How to add a sampling prompt family (M4)

Add an entry to `samplingFamilies` in `samplingTrees.ts`. The token tree is
generated from `storylines`: at each step the next-token distribution comes
from the storylines that match the text so far, so shared prefixes create
branch points automatically.

- `storylines`: weighted continuations (weights are relative).
- `noise` + `noiseMass`: rare weird tokens mixed in (visible at high temperature).
- `fallback`: used once generation wanders off every storyline — keep a large
  `"."` mass so sentences can always end.

## How to add embedding points (M6)

Append to `embeddingPoints` in `embeddingDataset.ts`:

```ts
{ label: "gelato", x: -5.8, y: -4.2, tags: ["food", "Italy"] }
```

Coordinates roughly span x ∈ [-7.5, 8], y ∈ [-6.5, 7.5]. The first matching
entry in `embeddingCategories` decides the point color; add new categories
there. Analogy puzzles are in `analogyPuzzles` (labels must exist on the map).

## How to add chatbot prompt cards (M8)

Append to `chatbotChallengePrompts` in `chatbotChallengePrompts.ts`:

```ts
{
  id: "my-card",
  title: "Short card title",
  prompt: "The exact text students copy into the chatbot.",
  beforeQuestion: "What students should predict before testing.",
  discussion: "What to discuss after testing."
}
```

External chatbot buttons are in `externalChatbots` in the same file.

## How to configure poll links

In `src/content/day1-llm/modules.ts`, find the module and fill in:

```ts
poll: {
  question: "Which token did your group choose?",
  classAUrl: "https://forms.gle/...",   // shown when ?class=A
  classBUrl: "https://forms.gle/..."    // shown when ?class=B
}
```

Leave URLs out to show the "ask your instructor for the QR code" placeholder.
Remove the whole `poll` field to hide the panel entirely.

## How to add a whole new module

1. Add metadata to the day's `modules.ts` (copy an existing entry).
2. Create the component in `src/modules/<day>/MyModule.tsx`. It receives
   `{ module, mode, onResult, resetSignal }` (see `src/lib/moduleProps.ts`):
   - call `onResult("...")` with a short description of the group's current
     result — it gets embedded in the copied reflection card;
   - re-initialize your state when `resetSignal` changes (one `useEffect`).
3. Register it in `src/modules/registry.ts`:
   `MyModule: lazy(() => import("./day1/MyModule"))`.
4. Set `component: "MyModule"` in the metadata. Done — routing, shell,
   reflection, polls, and teacher notes are automatic.
