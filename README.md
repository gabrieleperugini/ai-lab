# Machine Learning and Artificial Intelligence Lab 2026

An interactive, **no-code** lab platform for the Bocconi Summer School
(high-school students). Students move knobs, click choices, drag vectors, and answer
questions; they never see code. Everything runs client-side in the browser: no backend,
no accounts, no API keys.

- **Day 1: How chatbots speak, next-token prediction** (fully implemented, 8 modules)
- **Day 2: How neural networks learn** (scaffolded placeholders)
- **Day 3: Unsupervised learning and RL** (scaffolded placeholders)

All probability distributions shown in the modules are **teaching distributions**:
hand-designed, model-like values chosen for clarity. They are not measured outputs
of any real model. The sampling math (temperature, top-k, softmax) and the M5
tokenizer (real cl100k_base) are real.

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

No polling backend is built in. Each module can show external poll links
(Slido, Mentimeter, Google Forms, Microsoft Forms, any URL):

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
