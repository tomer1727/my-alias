# Plan

## Project Goal

A browser-based Alias word-guessing game for personal use with a small group of friends playing over video call. Each player opens the app on their own device. The app handles one player's turn at a time: showing words, running a configurable timer, and recording correct/skip/steal results. Score is tracked within the game session automatically.

## This Version's Scope

- Configurable turn timer (30s / 60s / 90s / custom) on the Start screen
- Score tracking across turns — cumulative correct/skip/steal totals and a score (correct − skipped) visible on the Results screen
- GitHub Pages deployment so friends can open the app on their devices
- Mobile validation pass

## Out of Scope (this version)

- Real-time connectivity between players (still coordinated verbally over video call)
- Two-team score tracking (deferred until real-time connectivity is added)
- Growing the phrase bank beyond ~100 phrases
- Difficulty / category filters

## Implementation Phases

### Phase 1 — Configurable Timer
Goal: Players can choose their turn duration on the Start screen before starting a game.

1. Add `timerDuration: number` to `GameState` (default 60) [simple]
2. Update Start screen with 30 / 60 / 90 / Custom selector [medium]
3. Pass `timerDuration` into `GameScreen`, replacing hardcoded 60 [simple]

### Phase 2 — Score Tracking
Goal: Results screen shows both the current turn and accumulated game totals with a score.

1. Add `gameTotals: { correct: number; skip: number; steal: number }` to `GameState` [simple]
2. Accumulate current turn into totals on `onEndTurn` in `App.tsx` [simple]
3. Update Results screen — two sections: "This Turn" + "Game Total" with score = correct − skipped [medium]
4. Add "New Game" button to Results screen (resets totals + reshuffles deck) [simple]

### Phase 3 — GitHub Pages Deployment + Mobile Validation
Goal: App is live on GitHub Pages and confirmed playable on mobile devices.

1. Configure `vite.config.ts` `base` for GitHub Pages [simple]
2. Add `gh-pages` package + `deploy` script to `package.json` [simple]
3. Write deployment guide (repo setup → push → enable Pages) [simple]
4. Mobile validation pass — viewport, tap targets, no horizontal scroll [medium]
