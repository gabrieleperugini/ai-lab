# Decisions

Assumptions and implementation decisions for the AI Lab platform (v1, July 2026).

## Hidden Structure section (July 2026)

- Checkpoint tag `checkpoint-before-hidden-structure` (on origin); work
  merged from `feature/hidden-structure`.
- Navigation moved to semantic titles: Language Models (route stays `day1`
  because printed slide QR codes deep-link into it), Learning Machines,
  Hidden Structure (new, route `hidden-structure`), Learning by Consequences
  (coming soon, RL placeholders; the old `day3` route was replaced since it
  only ever held placeholders).
- Five modules, all plain TypeScript, no new dependencies. Spectral Springs
  runs REAL spectral clustering in the browser: symmetrized kNN Gaussian
  graph, normalized Laplacian, cyclic Jacobi eigendecomposition (N ≤ 120,
  ~20ms), Ng-Jordan-Weiss row-normalized first-k eigenvectors, k-means with
  farthest-point seeding. An earlier version clustered on the 2nd/3rd
  eigenvectors only and broke on disconnected graphs; the NJW form fixes it.
- Datasets were tuned against the actual pipeline (see the kNN sweep in the
  repo history): moons/circles/density solvable at default springs, spiral
  requires kNN=3 (teaches locality), bridge intentionally caps at ~93%.
- U1 lenses are hand-weighted feature axes, not PCA: positions are
  explainable ('land to water') and the whale/bat stories land exactly.
- The recommender is transparent on purpose: taste vector = mean(liked) -
  mean(disliked), cosine scores, greedy diversity, seeded explore swaps, and
  a heuristic filter-bubble detector.

## Learning Machines enrichment (July 2026)

- Backup: branch `backup/learning-machines-before-enrichment` (on origin);
  work merged from `feature/learning-machines-enrichment`.
- Three new modules (Data Detective, Feature Detector Lab, Fool the Network)
  plus a Parameter Budget Challenge panel inside the existing NN playground.
  Existing modules and the LLM section untouched (verified).
- Data Detective's "lazy learner" is deliberately simplified and labeled as
  such: it scans features in salience order (color, background, shape) and
  stops at the first one that reaches 85% training accuracy, so a strong
  color bias produces vivid shortcut learning; a logistic-regression learner
  is offered alongside. Reliance bars show the model's own feature weights.
- The digit modules share a transparent detector classifier: activations are
  overlap scores of 10 hand-made 8x8 stroke/corner/loop templates, and
  classification is nearest clean-digit signature. All 6 clean digits and
  the tested shifted/noisy variants classify correctly; turning the 7 into a
  1 takes exactly 6 pixel edits (the challenge limit).
- Budget challenge thresholds were tuned live: Tiny XOR is solvable with the
  default 17-parameter network (verified in-browser, '✅ solved with 17
  parameters'); spiral and noisy presets have looser caps.

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

## Learning Machines math revision (July 2026, from day2_math_revision_prompt.md)

- Checkpoint tag `checkpoint-before-learning-machines-math-revision`; work on
  branch `learning-machines-math-revision`.
- Added a `hidden: true` module flag (src/lib/types.ts): hidden modules keep
  their code, content, and direct route, disappear from student cards and
  prev/next navigation, and appear with a "hidden" tag in teacher mode.
  Data Detective and Feature Detector Lab are hidden this way; delete the
  flag line in src/content/learning-machines/modules.ts to restore them.
- Two new modules translated from the course Mathematica notebook slopes.nb
  (Mathematica -> TypeScript, documented in the lib file headers):
  - Gradient Explorer (src/lib/learning/gradients.ts): feasy/f/f3easy
    landscapes, central-difference derivatives, 1D tangent + descent arrow,
    2D banded contour map with uphill gradient and descent arrows.
  - One-Dimensional Neural Nets (src/lib/learning/oneDNets.ts): sigmoid
    neuron sigmoid(x-b), step target sigmoid(x-2.1), bump target
    sigmoid(x+2.1)*sigmoid(5-x), five-parameter network
    sigmoid(w1*h1 + w2*h2 - b3), MSE against the target curve, animated
    finite-difference gradient-descent optimizer (lr 3, up to 450 steps).
    The "Flat (trap)" preset demonstrates a symmetric saddle where the
    optimizer stalls.
- Section reordered to: see numbers -> fit line -> loss landscape ->
  Gradient Explorer -> descent race -> generalization -> 1D neural nets ->
  NN playground -> Fool the Network.
- Fool the Network made less trivial: the classifier is now
  nearest-prototype over the clean, SHIFTED, and THICK variants of each
  digit (noisy variants deliberately excluded), so shift-right/thicken are
  resisted while shift-left, occlusion, and noise still fool it; softmax
  T=0.08. Added digits 4 and 9 (ambiguous with 9 and 3/8), four-direction
  shift, thicken, cover-top/bottom perturbations, and challenges: smallest
  flip (<=4 px), 3->8, 4->9, confidently wrong (>=60%), maximum doubt
  (<30%), flip-and-restore.
- Numeric QA scripts kept in scripts/qa_classifier.ts and
  scripts/qa_onednets.ts (run with npx tsx).
- Day numbering: Learning by Consequences now shows "Day 3" (second
  thematic section of Day 3; there is no Day 4).

## Math revision round 2 (July 2026)

- "Under the hood" is now a content field (`underTheHood` in LabModule),
  rendered by ModulePage behind a toggle under the takeaway. ALL modules in
  Day 1, Learning Machines, and Hidden Structure have 1-3 lines stating what
  model/data/training is really behind the activity. The three old inline
  hood sections (Fit the Line, Gradient Explorer, 1D Neural Nets) were
  migrated there; slopes.nb references removed from student-facing text and
  teacher notes (obsolete reference).
- Gradient Explorer challenge audit (scripts/qa_challenges.ts): three
  challenges were mathematically unsolvable and are now fixed. 1D
  walk-into-valley: |slope| threshold 0.05 -> 0.15 (the dip's curvature
  makes lr >= 0.2 oscillate above 0.1). 1D overshoot: needs lr >= 1.5 near
  the x = 1 dip on the FULL landscape, so the lr slider max went 1 -> 2, the
  challenge names the spot, and it now has a real done flag. 2D overshoot:
  needs lr ~8 from the reset corner (the gradient shrinks near the trough),
  so the lr slider max went 3 -> 10 and the challenge says "8 or more".
  2D smooth landing verified solvable at lr 0.8-1.5.
- Gradient Explorer 2D got a "3D surface" toggle: oblique-projection quad
  mesh of f3easy (painter's algorithm, same color bands as the contour),
  with the tangent plane drawn from the numerical gradient at the draggable
  point. No 3D library; plain SVG.

## Math revision round 3 (July 2026)

- Module order: One-Dimensional Neural Nets moved to position 3, right after
  Fit the Line (same fit-the-data story, new model family); everything else
  keeps its relative order.
- 1D Neural Nets is now data-first: the dashed target curves are gone, the
  loss is MSE against the sampled 0/1 points (floors ~0.077 and ~0.098, see
  scripts/qa_onednets.ts), red error bars show per-point mistakes, and
  activity A gains a 1D loss-landscape plot (loss vs b, draggable) that
  foreshadows the loss landscape module. Activity B always starts random
  (good/almost-good presets removed) and the optimizer is behind a
  "reveal" button so students hand-tune first.
- Non-convexity: new "Two hills" dataset (two Gaussian bumps, heights 2 and
  1, centers ±0.7, sigma 0.25) shown ONLY in Loss Landscape and GD Race.
  There the model family switches to a movable bump
  y = m·exp(-(x-b)²/2σ²) (σ = 0.25, exact analytic gradients in
  src/lib/learning/regression.ts), because a linear model's MSE is always
  convex. The landscape has the global valley at (2.0, -0.7), loss 0.215,
  and a TRUE local minimum at (1.0, 0.7), loss 0.844, verified by
  simulation: descent from the trap start (1.2, 0.9) settles in the local
  valley at every lr up to ~0.95; the easy start (2.2, -1.2) reaches the
  global valley at the Good preset lr (larger rates overshoot the narrow
  valley and can strand on the zero-gradient plateau, which is honest).
- GD Race targets are now per-dataset (clean 0.05, noisy 0.3, outlier 0.75,
  curved 0.75, two-hills 0.28) because the old global "below 0.15" was only
  reachable on the clean dataset. New challenges: "The trap valley" (settle
  in the local min) and "Escape the trap".
- LossContour accepts lossFn/bestPoint/axis-label props; line modules are
  unchanged (FitTheLine never sees the two-hills dataset).
