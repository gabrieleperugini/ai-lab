# AI Lab — Patterns, predictions, and policies

An interactive, **no-code** lab platform for the Bocconi Machine Learning & AI Summer School
(high-school students). Students move knobs, click choices, drag vectors, and answer
questions — they never see code. Everything runs client-side in the browser: no backend,
no accounts, no API keys.

- **Day 1 — How chatbots speak: next-token prediction** (fully implemented, 8 modules)
- **Day 2 — How neural networks learn** (scaffolded placeholders)
- **Day 3 — Unsupervised learning and RL** (scaffolded placeholders)

## Install & run locally

Requires Node.js ≥ 20.

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

## Build

```bash
npm run build      # type-checks and builds the static site into dist/
npm run preview    # serve the production build locally
```

The output in `dist/` is a fully static site — deployable on any static host.

## Deploy to GitHub Pages

The Vite `base` is set to `/ai-lab/` for production builds (see `vite.config.ts`).
**If your repository has a different name**, change it there or build with
`VITE_BASE=/your-repo-name/ npm run build`.

### Option A — GitHub Actions (recommended, included)

1. Create a GitHub repository named `ai-lab` and push this folder to it.
2. In the repo: **Settings → Pages → Source → GitHub Actions**.
3. Push to `main`. The included workflow (`.github/workflows/deploy.yml`)
   builds and publishes automatically.
4. The site appears at `https://<your-user>.github.io/ai-lab/`.

### Option B — manual

```bash
npm run build
# publish the dist/ folder to the gh-pages branch, e.g. with:
npx gh-pages -d dist
```

Routing is hash-based (`#/day1/next-token-arena`), so page refreshes never 404 on
GitHub Pages. The app also works on Netlify/Vercel unchanged (set `VITE_BASE=/`).

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
(Slido, Mentimeter, Google Forms, Microsoft Forms — any URL):

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

## How to add or edit a module

All content lives in `src/content/`, separate from the visual components.
See [docs/CONTENT_EDITING.md](docs/CONTENT_EDITING.md) for details. In short:

1. **Edit examples**: change the data files in `src/content/day1-llm/` — no component
   changes needed.
2. **Add a module**: add an entry to `src/content/<day>/modules.ts` (metadata, mission,
   instructions, reflection questions, takeaway, teacher notes), create a component in
   `src/modules/<day>/`, and register it in `src/modules/registry.ts`.
3. **Replace a Day 2/3 placeholder**: build the component, then change the module's
   `component` key from `"Placeholder"` to the new name and remove `placeholder: true`.

## Teacher guide

A module-by-module script for Day 1, with timings and fallback plans, is in
[docs/TEACHER_GUIDE_DAY1.md](docs/TEACHER_GUIDE_DAY1.md).

## Design decisions

Recorded in [docs/DECISIONS.md](docs/DECISIONS.md).

## Tech

Vite + React + TypeScript. One notable dependency: `gpt-tokenizer` — the real GPT-4
tokenizer (cl100k_base), fully bundled and lazy-loaded only when the Tokenizer
Microscope module is opened. No network calls, no analytics, no student data leaves
the browser.
