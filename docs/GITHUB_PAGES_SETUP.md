# GitHub Pages setup

Concise steps to publish the lab platform.

## 1. Create the repository

Create a GitHub repository named `ai-lab` (public, so GitHub Pages is free).

```bash
# from this folder
git remote add origin https://github.com/<your-user>/ai-lab.git
git push -u origin main
```

Or with the GitHub CLI in one step:

```bash
gh repo create ai-lab --public --source . --push
```

## 2. Enable GitHub Pages

In the repository: **Settings → Pages → Build and deployment → Source →
GitHub Actions**.

The included workflow (`.github/workflows/deploy.yml`) builds and publishes
automatically on every push to `main`.

Expected URL:

```text
https://<your-user>.github.io/ai-lab/
```

## 3. Check the base path

`vite.config.ts` sets `base: "/ai-lab/"` for production builds. If the
repository is renamed, update it there or build with:

```bash
VITE_BASE=/new-name/ npm run build
```

## 4. Share access with a collaborator

Repository **Settings → Collaborators → Add people**, then enter their GitHub
username. `Write` access lets them push content changes; the site redeploys
automatically on push.

## 5. Run locally and preview the production build

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
npm run build      # static production build into dist/
npm run preview    # serve the production build (http://localhost:4173/ai-lab/)
```
