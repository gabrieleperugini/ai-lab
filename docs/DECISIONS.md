# Decisions

Assumptions and implementation decisions for the AI Lab platform (v1, July 2026).

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
