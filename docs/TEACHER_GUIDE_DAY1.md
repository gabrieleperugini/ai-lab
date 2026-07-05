# Teacher guide — Day 1: LLMs and next-token prediction

Total lab time: **150–180 min**, split into short sessions between slides.
Two classes run in parallel (~50 students each), students work in groups of 3–4
on laptops.

## Links to hand out

- Students, class A: `https://<user>.github.io/ai-lab/?class=A#/day1`
- Students, class B: `https://<user>.github.io/ai-lab/?class=B#/day1`
- You (projector): add `&teacher=1` — this reveals teacher notes, the timeline,
  and projector tools. Don't share this link with students.

## Suggested timeline

| Session | Slides | Lab | Time |
| --- | --- | --- | --- |
| A — What does a chatbot do? | mineral, computation, language, learning from examples | M1 Next Token Arena | 20 min |
| B — Context and probability | NTP basics, context, world knowledge, probability | M2 Context Lens, M3 Branching Stories | 20 + 20 min |
| C — From probabilities to text | repeated NTP, sampling, issues | M4 Sampling Machine | 30–35 min |
| D — Inside the chatbot's brain | tokens, embeddings, de-embedding | M5 Tokenizer, M6 Meaning Map, M7 De-embedding Lens | 20–25 + 30–35 + 20–25 min |
| E — Real chatbot bridge | — | M8 Real Chatbot Bridge | 15–25 min |

Cut list if running late: shorten M1 to 4 rounds; make M7 a 10-minute
projector demo; fold M8's discussion into the wrap-up.

## Module-by-module script

### M1 — Next Token Arena (20 min)
1. Project round 1 ("Once upon a"). Groups shout their token, then reveal.
2. Do "capital of France" and "World Cup 1998" together — the second needs a
   knowledge chain; make that explicit.
3. Free exploration (~10 min). The categories escalate: context → world
   knowledge → probability/stereotypes → reasoning.
4. **Expected observations**: obvious answers are still probabilistic; some
   blanks need knowledge or computation; 'lions' never quite dies.
5. Discussion: "Where do these probabilities come from?" (patterns in training
   text — bridge to the learning-from-examples slides).

### M2 — Context Lens (20 min)
1. Start with the bank pair (echoes the slides). Flip mode is the dramatic one.
2. Push on the umbrella pair: nothing says "rain", yet "wet" wins — the model
   uses *implied* information.
3. **Expected observations**: one word flips the distribution; physics and
   causality show up as language statistics.

### M3 — Branching Stories (20 min)
1. Demo "that" vs "what" on the projector; ask "what did this choice make
   impossible?" every time.
2. Let groups explore, then switch everyone to the proof example — point out
   it feels like a ladder, not a tree.
3. **Expected observations**: generation commits one token at a time; humble
   function words steer huge branches; reasoning is also sequential commitment.

### M4 — Sampling Machine (30–35 min)
1. Explain the two knobs ONCE on the projector: temperature reshapes the bars,
   top-k cuts the tail. The math is real.
2. Challenge sequence: (a) boring machine — T=0.2, top-k=1: every run identical;
   (b) chaotic machine — T=2.0, all tokens; (c) find the sweet spot.
3. Optional race: weirdest complete sentence at T=2.0 wins.
4. **Expected observations**: the model does not always pick the best token;
   low T = reliable and repetitive, high T = creative and unhinged.
5. Discussion: "Is creativity the same as correctness?" Mention temperature is
   a real API setting in real LLMs.

### M5 — Tokenizer Microscope (20–25 min)
1. Reveal that the lecture simplified: token ≠ word. This microscope is the
   REAL GPT-4 tokenizer running in their browser.
2. Set the checklist as a detective hunt (capitals, spaces, emoji, Italian,
   made-up words). Best surprises: `BocconiSummerSchool2026`,
   `antidisestablishmentarianism`, `pizza 🍕`, ` Hello` vs `Hello`.
3. Toggle token IDs: "to the model, your sentence is literally these numbers."
4. **Expected observations**: common words = 1 token; rare/made-up words
   shatter; Italian splits into more pieces than English (ask why!).

### M6 — Meaning Map (30–35 min)
1. Say it plainly: this is a hand-made teaching map; real embeddings have
   hundreds of dimensions. The *geometry idea* is the real thing.
2. Search "bank" → two points. Bridge back to Context Lens.
3. Category toggles → clusters. Nearest neighbors of "pizza", then "proof".
4. Analogy puzzle: king→queen as prince→? The same arrow = same relationship.
5. Finale: each group places "gelato" (or any word) — placement forces a
   debate about meaning. Poll: food cluster, Italy cluster, or in between?

### M7 — De-embedding Lens (20–25 min)
1. The lighthouse metaphor: the hidden state shines toward some words.
2. Walk the presets in this order: Fairy tale → Proof → River bank →
   Financial bank (the two banks are the payoff).
3. Let them drag freely. Challenge: find a direction where "lions" wins.
4. Show arrow length: longer arrow = more confident = sharper bars; same
   temperature slider as M4.
5. **Expected observations**: score = alignment (dot product); softmax turns
   scores into probabilities; presets reproduce earlier modules' behavior.

### M8 — Real Chatbot Bridge (15–25 min)
1. Teacher-led on the projector if chatbot access is blocked/limited.
2. Non-negotiable rule: groups write their PREDICTION before testing.
3. Give most time to "Plausibility is not truth" — fluent ≠ correct is the
   safety takeaway of the day.
4. Paste real outputs into the projector notepad (teacher mode) and annotate
   together: find tokens, context effects, sampling variety.

## Collecting answers

- Configure poll links per module in `src/content/day1-llm/modules.ts`
  (see CONTENT_EDITING.md). Separate URLs for class A and B.
- Without polls: groups press **Copy reflection** — a formatted card
  (class, group, module, result, reflection) lands in their clipboard; they
  paste it into a Google Form, Teams/chat, or email.

## Fallback plan if Wi-Fi fails

The site is fully client-side: **once loaded, everything except M8 keeps
working offline**. Tell students not to close the tab.

- Total failure before load: one teacher laptop + projector can run every
  module as a class activity (they were designed to be projectable).
- M8 without internet: use the prediction step as a discussion, compare
  against the M4 simulator instead of a real chatbot.
- Polls down: use raised hands + the reflection cards afterwards.
