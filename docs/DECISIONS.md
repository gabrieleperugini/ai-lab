# Decisions

Assumptions and implementation decisions for the AI Lab platform (v1, July 2026).

## Learning Machines section (July 2026)

- New section replacing the Day 2 placeholders: semantic id
  `learning-machines` (route `#/learning-machines`), shown as "Day 2:
  Learning Machines". Day 1 untouched (only additive changes: registry
  entries, days.ts day-2 entry, new files).
- Six modules: what-computer-sees, fit-the-line, loss-landscape,
  gradient-descent-race, generalization, neural-network-playground. The
  optional digits module (LM7) was deliberately skipped to keep the six
  required modules polished.
- All computation is plain TypeScript in the browser: seeded datasets
  (mulberry32), exact MSE gradients, closed-form least squares, Chebyshev
  basis polynomial fits (well-conditioned to degree 12), and a hand-written
  MLP (tanh/ReLU, sigmoid + BCE, full-batch backprop). No TensorFlow.js: the
  tiny nets train at hundreds of epochs per second without it and the bundle
  stays small.
- The loss landscape is a 48x48 banded heatmap (sqrt-scaled for valley
  contrast) rendered as SVG; 3D was skipped in favor of a polished 2D view,
  as the prompt allows.
- Divergence is handled visibly: LM4 clamps runaway parameters and shows
  'the model jumped out of the landscape'; LM6 detects NaN weights and
  pauses with a warning.
- Challenge cards live next to their completion checks in each module
  component; XOR reaches ~95% test accuracy with the default 1x4 tanh
  network in about 200 epochs (verified), the spiral needs 2-3 layers.

## Round 4 (July 2026): Qwen2.5-0.5B and model comparison

- Pre-round-4 state preserved on branch `backup/day1-before-round4` and tag
  `day1-v3-slides-sync` (pushed to origin).
- The offline pipeline now takes `--models` and writes one JSON set per model
  under `src/content/generated/day1/<model-key>/`. Current models:
  Qwen2.5-0.5B (2024, site default) and GPT-2 small (2019, kept as fallback
  and comparison).
- M1, M2, M3, M8 Sampling Machine, and the Reasoning Demo have a model
  dropdown; example ids/order are identical across models, so switching
  compares the two models on the same prompt. M3 resets the current path on
  switch (branch tokens differ per model); the Reasoning Demo steps are fixed
  by the slides, so only the scores swap.
- Pedagogical payoff spotted during generation: Qwen gets 'The capital of
  France is Paris' at 31.6% (GPT-2: 3.2%) but STILL fails the World Cup 1998
  chain (Paris 0.0%): progress on facts, no progress on chained reasoning.
- Bridges now deep-link to the relevant section of the target module:
  Context Lens pairs (#/day1/context-lens/<pairId>) and Branching trees
  (#/day1/branching-stories/<treeId>); Arena categories were already
  deep-linkable. Companion modules keep their back-links to Arena categories.
- The scripts venv is disposable and rebuilt from scripts/requirements.txt;
  it was destroyed once by a branch merge (tracked-to-untracked transition)
  and sync artifacts (`* 2.py`) were removed.

## Round 3 (July 2026): consistency with the v2 slides

- Pre-round-3 state preserved on branch `backup/day1-before-round3` and tag
  `day1-v2-real-probs` (pushed to origin).
- All v1-slide examples restored on top of the round-2 ones: M1 now has 30
  rounds in 6 categories matching the six "Next Token Arena" stops of the v2
  slides, in slide order, with v1 candidate options (including 'also', 'is',
  'lions', 'Schwarzwälderkirschtorte', 'thorium', 'diamonds').
- Categories are deep-linkable for slide QR codes:
  `#/day1/next-token-arena/<basics|context|suitcase|world-knowledge|probability|reasoning>`.
- New module: Reasoning Demo (the v1 "NTP part 5 - intelligence" proof as a
  ladder where only one option per step survives; dead ends explain
  themselves and force a restart). GPT-2 chain-rule scores per option are
  shown on demand; the small model prefers a dead end at most steps, which
  demonstrates that reasoning needs look-ahead.
- Module order now follows the v2 slides: Arena, Context Lens, Branching
  Stories, Reasoning Demo, Tokenizer, Meaning Map, De-embedding Lens,
  Sampling Machine, Real Chatbot Bridge (9 modules).
- Bridges: Arena categories link to their companion module and each companion
  links back to the matching Arena category.
- A trophy/suitcase pair was tried in M2 and removed: GPT-2 cannot resolve
  the Winograd pronoun, so the bars did not flip. The suitcase examples live
  in M1, where the model's own top tokens ('size', 'bag') are sensible.
- M6: point clicks are hit-tested on pointer-up (pointer capture had been
  retargeting click events to the svg, breaking selection and puzzles);
  map enlarged and both M6/M7 use a full-width layout (`wide` module flag).
- M7: canvas fills its box (align-start + larger viewBox); hover-only
  tooltips replaced with a visible "technical names" toggle.
- scripts/.venv accidentally tracked in round 2 is now untracked/ignored
  (history still contains it; the venv is rebuilt from scripts/requirements.txt).

## Round 2 (July 2026): real-model content

- Pre-round-2 state preserved on branch `backup/day1-before-round2` and tag
  `day1-v1-handmade-probs` (both pushed to origin).
- New offline pipeline (`scripts/generate_day1_llm_content.py`, GPT-2 via
  Hugging Face Transformers, CPU) produces static JSON consumed by the app;
  no model runs in the browser and no backend was added.
- Tokenization is handled explicitly: candidates are encoded with a leading
  space; single-token candidates get exact next-token probabilities, and
  multi-token candidates get chain-rule phrase probabilities (flagged in the
  data and the report). Every probability display includes an 'other' bar.
- M1 displays also include up to two of the model's OWN top word-tokens, so
  the bars show where GPT-2 actually puts its mass ('the', 'now', ...). This
  turns small-model quirks into the lesson: models continue text, they do not
  answer quizzes.
- Some M1 rounds intentionally show small-model failures (the World Cup 1998
  chain, the algebra round); the explanations frame them as such.
- M3 trees are 3 choices deep (4/3/3 options per level) with real
  probabilities at every node and GPT-2-sampled endings at the leaves.
- M4 replays cached GPT-2 samples at three fixed randomness settings
  (0.2/20/0.90, 0.8/50/0.95, 1.2/100/0.98) with a no-immediate-repeat queue;
  the low-randomness cache holding only a few distinct continuations is
  itself the lesson. A 'first step' inspector shows the real first-token bars.
- M6 uses real GloVe vectors (glove-wiki-gigaword-100): PCA to 3D for
  display, full-dimension vectors for neighbors and puzzle answers; the three
  analogy puzzles were verified against the vectors during generation. Zoom
  (wheel and buttons) plus rotate and reset-camera; puzzles live in a side
  panel so the map stays visible.
- Polls and reflection submissions are hidden behind flags in
  `src/content/config.ts` (`enablePolls`, `enableSubmissions`), not deleted.
- M8: prompts asking a chatbot to report its own next-token probabilities
  were rewritten to simple completions, and a 'plausible is not the same as
  true' card was added.

## Revision pass (July 2026)

- Title made explicit: "Machine Learning and Artificial Intelligence Lab",
  year 2026 shown on the home page and top bar.
- M2 simplified to flip-only interaction (side-by-side removed as redundant).
- M3 rebuilt as multi-step branching (nested choice trees, two levels).
- M4 gained 6 new prompt families, a New prompt button, and Generate 3 versions.
- M5 simplified to a single microscope; comparison is an opt-in
  "Compare with word split" toggle (the old Microscope A/B labels confused).
- M6 rebuilt as a rotatable 3D map: custom orthographic-with-perspective
  projection in plain SVG, drag to rotate, depth-scaled points, floating
  neighbor card, four puzzle cards (two analogy with arrows, two click-to-answer).
  Three.js was deliberately NOT added: the custom projection is ~30 lines,
  keeps the bundle small, and cannot break the static deployment.
- M7 canvas shrunk ~40%, labels renamed for students (thought vector, word
  directions, match scores) with technical names in tooltips.
- Licensing: MIT for code (LICENSE), CC BY-NC 4.0 for authored educational
  content (CONTENT_LICENSE.md), THIRD_PARTY_NOTICES.md for dependencies.
- Em dashes removed from visible UI text per style guidance.

## Placement and repo

- The app lives in `MLAISummerSchool/2026/ai-lab` as its own git repository
  (the surrounding Teaching folder is not a repo).
- Assumed GitHub repo name: **ai-lab** → Vite `base: "/ai-lab/"` for production.
  Override with `VITE_BASE=/other-name/ npm run build`.

## Stack

- **Vite + React + TypeScript**, no router library: a ~40-line hash router
  (`src/lib/router.tsx`) keeps dependencies minimal and is inherently
  GitHub-Pages-safe (no server rewrites, refresh never 404s).
- Class/teacher modes are plain query parameters (`?class=A&teacher=1`) kept
  *before* the hash so they survive all hash navigation and refreshes.
- No backend, no accounts, no API keys, no analytics. All simulations are
  client-side. This is a hard requirement for 100 students on classroom Wi-Fi.

## Content / component separation

- All examples, probabilities, datasets, poll URLs, and copy live under
  `src/content/`. Components consume data; they contain no examples.
- Modules are registered by string key in `src/modules/registry.ts` and
  lazy-loaded (`React.lazy`), so heavy modules don't slow the first paint.
- The shared module shell (`ModulePage`) provides: mission card, instructions,
  "What should I notice?", reset button (via a `resetSignal` prop), takeaway,
  poll panel, reflection box, teacher notes, prev/next navigation. Module
  components only implement the interactive center panel.

## Pedagogical honesty

- All probability distributions in M1–M3 are **hand-designed teaching
  distributions**, labeled as "model-like probabilities" in the UI. They are
  not claimed to be real model outputs.
- M4 Sampling Machine: the *sampling math is real* (temperature `p^(1/T)` +
  renormalize, then top-k cut + renormalize); only the token tree is hand-made.
  The tree is generated from weighted "storylines" (`src/content/day1-llm/
  samplingTrees.ts` + `src/lib/samplingTree.ts`), which keeps the content
  trivially editable while producing genuine branching behavior. Rare "noise"
  tokens are mixed in so high temperature visibly produces weirdness. A
  fallback distribution with sentence-ending punctuation guarantees
  generation terminates (plus a 30-token hard cap).
- M5 Tokenizer Microscope uses the **real cl100k_base tokenizer** via the
  `gpt-tokenizer` npm package, fully bundled client-side (~450 kB gzipped,
  lazy-loaded only when M5 opens). This was preferred over a toy tokenizer
  because "words are not tokens" lands much harder with the real thing.
- M6 Meaning Map is a hand-placed 2D toy map, labeled as such in the UI and
  teacher notes. The dataset file documents how to swap in projected real
  embeddings later.
- M7 De-embedding Lens: token vectors are **normalized for scoring** (score =
  dot(hidden, unit(token))), so alignment — not a token's distance from the
  origin on the drawing — decides its score. The hidden vector is not
  normalized: arrow length = confidence = sharper softmax. Without this,
  visually-far tokens (pizza) dominated every downward-pointing preset.
- M8 makes no API calls by design; it is copy-prompt + external links +
  a teacher-mode projector notepad.

## Robustness choices

- Poll links are optional everywhere; missing URLs show a friendly placeholder.
- Reflection collection is clipboard-based (formatted submission card) so it
  works with any external form/chat and requires no storage.
- Clipboard writes fall back to `document.execCommand("copy")` for older
  browsers / non-HTTPS contexts.
- System font stack only; no external font/CDN requests. After first load the
  Day 1 modules work offline.
- No slide imagery is bundled (copyright); all visuals are CSS/SVG.

## Deferred to later versions

- Day 2/3 interactive modules (placeholders show the plan + preview art).
- Real embedding projections for M6.
- Optional backend proxy for live LLM calls (explicitly out of scope for v1).
