# Deployment Guide — GitHub Pages

## Prerequisites

- The remote is set to `git@github-second:tomer1727/my-alias.git` (already configured)
- The repo is **public** on GitHub (required for free GitHub Pages)

## First-time setup (do once)

### 1. Enable GitHub Pages on the repo

1. Go to [github.com/tomer1727/my-alias](https://github.com/tomer1727/my-alias)
2. **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Set branch to `gh-pages`, folder to `/ (root)` → **Save**

The live URL will be: `https://tomer1727.github.io/my-alias/`

## Deploying

### Push source code (first time or after changes)

```bash
git add .
git commit -m "your message"
git push -u origin main
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the app (`npm run build`) and pushes the `dist/` folder to the `gh-pages` branch automatically.

Wait ~30–60 seconds, then open: **https://tomer1727.github.io/my-alias/**

## Subsequent updates

After making changes:
1. `git add . && git commit -m "..." && git push` — update source code
2. `npm run deploy` — publish the new build to GitHub Pages
