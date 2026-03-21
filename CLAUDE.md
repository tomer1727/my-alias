# Alias Game

A browser-based Alias word-guessing game for personal use with friends over video call.
No backend, no auth, no real-time sync — purely a static web app deployed to GitHub Pages.
Features: configurable turn timer, per-turn and cumulative score tracking, 100 Hebrew phrases.

## Tech Stack

- React 18
- TypeScript
- Vite
- CSS (plain, no framework)

## Project Structure

```
src/
  components/       # Screen components (StartScreen, GameScreen, ResultsScreen)
  types.ts          # Shared TypeScript types
  phrases.ts        # Full phrase bank (plain string array)
  App.tsx           # Top-level state and phase switching
  main.tsx          # Vite entry point
context/            # Project planning docs
```

## Key Conventions

- All game state lives in `App.tsx` — screens are stateless and receive props
- Phase switching is controlled by a `phase` field: `'start' | 'game' | 'results'`
- The shuffled deck and deck index persist across turns within a single game
- `gameTotals` accumulates correct/skip/steal counts across all turns; score = correct − skipped
- `timerDuration` (seconds) is selected on Start screen and passed through to GameScreen
- Phrases are a plain `string[]` in `phrases.ts` — no metadata, no IDs
- Mobile-friendly layout — game is played on phones while on a video call

## Context Files

```
context/PLAN.md         — Implementation plan and phases
context/ARCHITECTURE.md — System design and technical decisions
context/PROGRESS.md     — Session tracking and current status
context/BACKLOG.md      — Future features and ideas
```

## Current Focus

> Currently working on: Phase 3 — GitHub Pages deployment + mobile validation
