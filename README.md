# Machine Learning and Artificial Intelligence Lab 2026

An interactive, **no-code** lab platform for the Bocconi Summer School
(high-school students). Students move knobs, click choices, drag vectors, and answer
questions; they never see code. Everything runs client-side in the browser: no backend,
no accounts, no API keys.

- **Language Models** (route `#/day1`, fully implemented, 9 modules)
- **Learning Machines** (route `#/learning-machines`, fully implemented, 9 modules)
- **Hidden Structure** (route `#/hidden-structure`, fully implemented, 5 modules)
- **Learning by Consequences** (RL, coming soon: scaffolded placeholders)

**The probabilities are real, from two models.** Day 1 modules M1-M4 and the
Reasoning Demo show next-token probabilities and sampled continuations computed
offline from **Qwen2.5-0.5B (2024, default)** and **GPT-2 small (2019,
fallback)**; a dropdown in each of those modules switches between them on the
same prompt, which makes model progress (and shared failures) visible. M6 shows
**real GloVe word embeddings**. A note for instructors: these are small open
models used for teaching; they are not meant to represent ChatGPT or any
current frontier model exactly. The M5 tokenizer (cl100k_base) and the sampling
settings shown are also real.

## Regenerating the Day 1 model content

The site never runs a model in the browser: an offline pipeline writes static
JSON into `src/content/generated/day1/`, and the app imports it at build time.

```bash
python3 -m venv --system-site-packages scripts/.venv
scripts/.venv/bin/pip install -r scripts/requirements.txt
scripts/.venv/bin/python scripts/generate_day1_llm_content.py --models "gpt2,Qwen/Qwen2.5-0.5B"
scripts/.venv/bin/python scripts/generate_day1_embeddings.py     # M6 (GloVe)
```

- `generate_day1_llm_content.py` computes next-token probabilities (single-token
  candidates use exact probabilities; multi-token candidates use chain-rule
  phrase probabilities), 3-level branching trees, cached sampled continuations
  at three randomness settings, and the Reasoning Demo scores, for EACH model
  in `--models`. Output goes to `src/content/generated/day1/<model-key>/`.
  `--only m1,m3` regenerates a subset.
- To add a model to the site's compare dropdown: run the script with its
  Hugging Face name, then register it in `src/content/models.ts` (imports plus
  one entry in `MODELS`; the first entry is the default).
- `generate_day1_embeddings.py` loads glove-wiki-gigaword-100, projects a curated
  vocabulary to 3D with PCA, and computes neighbors and puzzle answers from the
  full vectors.
- Diagnostics land in `scripts/output/day1_generation_report.md`.

### Switching back to the hand-made v1 content

The pre-round-2 version is preserved on branch `backup/day1-before-round2` and
tag `day1-v1-handmade-probs`. For M1 only, you can also set
`useGeneratedProbabilities: false` in `src/content/config.ts` to fall back to
the hand-made rounds without switching branches. Polls and reflection
submissions are currently disabled via the same file (`enablePolls`,
`enableSubmissions`).

## Install and run locally

Requires Node.js version 20 or later.

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

## Build

```bash
npm run build      # type-checks and builds the static site into dist/
npm run preview    # serve the production build locally
```

The output in `dist/` is a fully static site, deployable on any static host.

## Deploy to GitHub Pages

Short version: create a repo named `ai-lab`, push, set **Settings → Pages →
Source → GitHub Actions**, and the included workflow publishes to
`https://<your-user>.github.io/ai-lab/` on every push to `main`.

Full steps, including the base-path rule and collaborator access:
[docs/GITHUB_PAGES_SETUP.md](docs/GITHUB_PAGES_SETUP.md).

Routing is hash-based (`#/day1/next-token-arena`), so page refreshes never 404 on
GitHub Pages. The app also works on Netlify or Vercel unchanged (set `VITE_BASE=/`).

## Deep links for the slides (QR codes)

Day 1 activities can be linked directly from the slides. The Next Token Arena
categories follow the six Arena stops of the v2 slide deck:

| Slide stop | Link |
| --- | --- |
| Arena 1 (basics) | `.../ai-lab/#/day1/next-token-arena/basics` |
| Arena 2 (context) + Context Lens | `.../next-token-arena/context` and `.../context-lens` |
| Arena 3 (the suitcase) | `.../next-token-arena/suitcase` |
| Arena 4 (world knowledge) | `.../next-token-arena/world-knowledge` |
| Arena 5 (probability) + Branching Stories | `.../next-token-arena/probability` and `.../branching-stories` |
| Arena 6 (reasoning) + Reasoning Demo | `.../next-token-arena/reasoning` and `.../reasoning-demo` |
| Tokenizer Microscope | `.../ai-lab/#/day1/tokenizer-microscope` |
| Meaning Map | `.../ai-lab/#/day1/meaning-map` |
| De-embedding Lens | `.../ai-lab/#/day1/deembedding-lens` |
| Sampling Machine | `.../ai-lab/#/day1/sampling-machine` |
| Real Chatbot Bridge | `.../ai-lab/#/day1/real-chatbot-bridge` |

Matching bridge buttons inside the modules move students between related
activities (Arena → Context Lens / Branching Stories / Reasoning Demo and back).

## Classroom modes (URL parameters)

Parameters go **before** the `#`:

| URL | Effect |
| --- | --- |
| `.../?class=A#/day1` | Class A badge; class-A poll links are used |
| `.../?class=B#/day1` | Class B badge; class-B poll links are used |
| `.../?teacher=1#/day1` | Teacher mode: teacher notes, timeline, projector tools |
| `.../?teacher=1&class=A#/day1/next-token-arena` | Combined |

Give students the plain link with their class (`?class=A`); keep `teacher=1` for yourself.

## How to configure poll links

**Polls are currently disabled** (`enablePolls: false` in `src/content/config.ts`);
reflection prompts are local-only and nothing is collected. To re-enable later:
flip the flag, then configure per-module links. No polling backend is built in;
each module can show external poll links (Slido, Mentimeter, Google Forms,
Microsoft Forms, any URL):

1. Open `src/content/day1-llm/modules.ts`.
2. In a module's `poll` field set:

```ts
poll: {
  question: "Which token did your group choose?",
  classAUrl: "https://app.sli.do/event/XXXX",
  classBUrl: "https://app.sli.do/event/YYYY"
}
```

If no URL is configured, students see a clean placeholder. Groups can always use the
**Copy reflection** button, which copies a formatted submission card (class, group,
module, result, reflection) to paste into any form or chat.

## Learning Machines section

The second block (route `#/learning-machines`, shown as "Day 2: Learning
Machines") covers parameters, loss, gradients, gradient descent,
generalization, and neural networks with nine visible modules:

1. What does the computer see? (pixels and vectors)
2. Fit the line (slope, intercept, MSE)
3. The loss landscape (draggable parameter space)
4. Gradient Explorer (1D tangent line and 2D gradient arrows on a contour map)
5. Gradient descent race (learning-rate game with trajectory)
6. Generalization challenge (train vs test, overfitting)
7. One-Dimensional Neural Nets (one sigmoid neuron, then a five-parameter
   two-hidden-neuron network, with an animated finite-difference optimizer)
8. Neural network playground (tiny MLP with live decision boundary, plus a
   Parameter Budget Challenge panel: solve each dataset within a parameter cap)
9. Fool the Network (edit pixels to flip the detector classifier's prediction)

**Temporarily hidden modules:** Data Detective (shortcut learning) and
Feature Detector Lab (stroke/loop detectors) are hidden from the student
navigation via `hidden: true` in
`src/content/learning-machines/modules.ts`. Their code, content, and direct
routes are intact, and teacher mode still lists them with a "hidden" tag.
To restore one, delete its `hidden: true` line.

The two notebook-inspired modules (Gradient Explorer, One-Dimensional Neural
Nets) use formulas translated from Mathematica to TypeScript from the course
notebook `slopes.nb`: the sigmoid neuron and step/bump targets plus the
five-parameter network in `src/lib/learning/oneDNets.ts`, and the 1D/2D
landscape functions (`feasy`, `f`, `f3easy`) in
`src/lib/learning/gradients.ts`. Derivatives are numerical central
differences.

The enrichment modules share content and utilities: digit templates and
detector templates live in `src/content/learning-machines/digitTemplates.ts`
and `featureDetectors.ts`, the transparent detector classifier in
`src/lib/learning/detectorClassifier.ts` (nearest-prototype over clean,
shifted, and thickened digit variants, softmax confidences), the Data
Detective toy world in `src/content/learning-machines/dataDetective.ts`
(learners in `src/lib/learning/toyClassifier.ts`), and the budget presets in
`src/content/learning-machines/nnBudgetChallenges.ts`.

Everything runs in the browser with plain TypeScript (no new dependencies, no
TensorFlow.js): seeded datasets, exact regression gradients, Chebyshev
polynomial fits, and a small hand-written MLP with backpropagation.

Where things live:

- module metadata and teacher notes: `src/content/learning-machines/modules.ts`
- datasets/presets: `src/content/learning-machines/*.ts` (regression,
  generalization, classification, pixel examples). To add a dataset, append a
  seeded entry there; the selectors pick it up automatically.
- simulation math: `src/lib/learning/` (rng, regression, tinyNN)
- visual components: `src/components/learning/` and `src/modules/learning/`

Challenge cards are defined inline in each module component next to their
live completion checks. Reflection prompts are local-only (no submission), as
in the rest of the site. To verify Day 1 after changes here: open any Day 1
module; nothing under `src/content/day1-llm/`, `src/content/generated/` or
`src/modules/day1/` is touched by this section.

## Hidden Structure section

The unsupervised-learning block (route `#/hidden-structure`) has five modules:

1. What Makes Things Similar? (feature lenses over an animal map)
2. K-Means: The Centroid Game (draggable centers, live cluster cost)
3. When Blobs Break (predict-then-run k-means on moons, rings, spirals)
4. Spectral Springs (real spectral clustering: kNN Gaussian graph, normalized
   Laplacian, Jacobi eigenvectors, k-means in the embedding; all plain
   TypeScript, no numerical dependency)
5. Recommendation Engine (fictional catalog, taste vectors, filter bubbles)

Where things live:

- module metadata and teacher notes: `src/content/hidden-structure/modules.ts`
- animal features and lenses: `src/content/hidden-structure/animals.ts`
- seeded 2D cluster datasets: `src/content/hidden-structure/clusterDatasets.ts`
- the fictional movie catalog: `src/content/hidden-structure/movies.ts`
- algorithms: `src/lib/hidden/` (kmeans, spectral)
- visuals: `src/components/hidden/ClusterPlot.tsx` and `src/modules/hidden/`

Each spectral dataset is solvable: moons/circles/density at the default
springs, the spiral needs very local springs (kNN 3), and the bridge tops out
around 93% on purpose (the springs walk across the bridge: good discussion).
The optional Outlier Detective module was not implemented in this pass.

## Collaborator workflow

Edit **content files**, not components, whenever possible. All examples,
probabilities, presets, puzzles, and poll links live in `src/content/`, separate
from the visual components. See [docs/CONTENT_EDITING.md](docs/CONTENT_EDITING.md)
for exactly where each module's data lives and how to add new examples.

## Teacher guide

A module-by-module script for Day 1, with timings and fallback plans, is in
[docs/TEACHER_GUIDE_DAY1.md](docs/TEACHER_GUIDE_DAY1.md).

## Design decisions

Recorded in [docs/DECISIONS.md](docs/DECISIONS.md).

## License

Code in this repository is licensed under the MIT License. See `LICENSE`.

Educational content authored for this platform is licensed under Creative Commons
Attribution-NonCommercial 4.0 International unless otherwise noted. See
`CONTENT_LICENSE.md`.

Third-party materials and linked services retain their own licenses and terms.
See `THIRD_PARTY_NOTICES.md`.

## Tech

Vite + React + TypeScript. One notable dependency: `gpt-tokenizer`, the real GPT-4
tokenizer (cl100k_base), fully bundled and lazy-loaded only when the Tokenizer
Microscope module is opened. No network calls, no analytics, no student data leaves
the browser.
