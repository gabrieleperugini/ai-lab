# Content editing guide

Content now comes in two kinds:

1. **Generated content** (M1-M4 probabilities/samples, M6 embeddings) lives in
   `src/content/generated/day1/*.json`. Do NOT edit these by hand: change the
   prompt/candidate lists inside `scripts/generate_day1_llm_content.py` (or the
   vocabulary/puzzles in `scripts/generate_day1_embeddings.py`) and re-run the
   script (see README, "Regenerating the Day 1 model content").
2. **Curated content** (module metadata, M5 presets, M7 vectors, M8 cards,
   Day 2/3) lives in `src/content/` TypeScript files and is edited directly.

After editing, run `npm run dev` to check, `npm run build` to publish.
Feature flags (polls, submissions, generated-vs-handmade M1) are in
`src/content/config.ts`.

## Where things live

| File | What it controls |
| --- | --- |
| `src/content/days.ts` | Day titles, taglines, narratives, availability |
| `src/content/day1-llm/modules.ts` | Module metadata: missions, instructions, reflection questions, takeaways, teacher notes, **poll URLs**, durations |
| `src/content/day1-llm/nextTokenExamples.ts` | M1 rounds (26 rounds; slide examples first, then original ones) |
| `src/content/day1-llm/contextExamples.ts` | M2 flip pairs (9 pairs) |
| `src/content/day1-llm/branchingExamples.ts` | M3 multi-step branching trees (nested choices with endings) |
| `src/content/day1-llm/samplingTrees.ts` | M4 prompt families (10 families: storylines, noise, fallback) |
| `src/content/day1-llm/tokenizationExamples.ts` | M5 presets, surprise strings, checklist |
| `src/content/day1-llm/embeddingDataset.ts` | M6 3D points, categories, **puzzles** |
| `src/content/day1-llm/deembeddingExamples.ts` | M7 word directions and thought-vector presets |
| `src/content/day1-llm/chatbotChallengePrompts.ts` | M8 prompt cards (with categories) and external chatbot links |
| `src/content/day2-nn/modules.ts`, `src/content/day3-unsupervised-rl/modules.ts` | Day 2/3 scaffolding |

## How to change probabilities

Probabilities are plain numbers that should sum to roughly 1. An optional
`other` entry renders as a gray italic "other tokens" bar. Example (M1):

```ts
probabilities: { desks: 0.46, customers: 0.35, ducks: 0.06, lions: 0.03, other: 0.10 }
```

## M1: add a next-token round

Append to `nextTokenRounds` in `nextTokenExamples.ts`:

```ts
{
  id: "my-new-round",              // unique
  category: "context",             // used by the category filter
  prompt: "The pizza arrived and it was still",
  choices: ["hot", "cold", "alive", "lions"],
  probabilities: { hot: 0.7, cold: 0.2, alive: 0.02, lions: 0.08 },
  explanation: "Why the distribution looks like this.",
  takeaway: "One-sentence idea to remember."
}
```

The round appears automatically in the Arena rotation and in the filter.

## M2: add a context pair

Append to `contextPairs` in `contextExamples.ts`. Each pair has `left` and
`right` sides with `prompt`, `highlight` (the changed words), and
`probabilities`, plus `leftLabel` / `rightLabel` for the flip button.

## M3: add a branching example

Append to `branchingExamples` in `branchingExamples.ts`. Choices nest:

```ts
{ token: "that", probability: 0.3, explanation: "...", choices: [
  { token: "she", probability: 0.32, ending: "had studied the wrong chapter." }
]}
```

A choice with `ending` is a leaf; a choice with `choices` asks again.
Two levels are standard; deeper nesting works too.

## M4: add a sampling prompt family

Add an entry to `samplingFamilies` in `samplingTrees.ts`. The token tree is
generated from `storylines`: at each step the next-token distribution comes
from the storylines that match the text so far, so shared prefixes create
branch points automatically.

- `storylines`: weighted continuations (weights are relative).
- `noise` and `noiseMass`: rare weird tokens mixed in (visible at high temperature).
- `fallback`: used once generation wanders off every storyline; keep a large
  `"."` mass so sentences can always end.

## M5: add tokenizer presets

Append strings to `tokenizerPresets` (buttons) or `surpriseStrings` (the
Surprise me button) in `tokenizationExamples.ts`.

## M6: add embedding points and puzzles

Points now have three coordinates:

```ts
{ label: "espresso", x: -4.9, y: -3.0, z: -0.5, tags: ["drink", "Italy"] }
```

Coordinates roughly span x in [-7.5, 8], y in [-6.5, 7.6], z in [-1, 3].
The first matching entry in `embeddingCategories` decides the point color.

Puzzles live in `embeddingPuzzles`; two kinds:

- `kind: "analogy"` with `start`, `relationFrom`, `relationTo`, `answer`
  (draws the relation arrow and a dashed ghost arrow);
- `kind: "question"` with `options` and `answer` (answered by chips or by
  clicking the map).

All labels referenced by a puzzle must exist in `embeddingPoints`.

## M7: add word directions and presets

Append to `deembeddingTokens` (the words on the plane) and `hiddenPresets`
(the thought-vector presets) in `deembeddingExamples.ts`. Keep preset vectors
pointing roughly at the words they should activate.

## M8: add chatbot prompt cards

Append to `chatbotChallengePrompts` in `chatbotChallengePrompts.ts`:

```ts
{
  id: "my-card",
  category: "reasoning",          // used by the category filter
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
     result; it gets embedded in the copied reflection card;
   - re-initialize your state when `resetSignal` changes (one `useEffect`).
3. Register it in `src/modules/registry.ts`:
   `MyModule: lazy(() => import("./day1/MyModule"))`.
4. Set `component: "MyModule"` in the metadata. Routing, shell, reflection,
   polls, and teacher notes are automatic.
