# Progress

## Current Status

```
Phase 1 — Complete
Phase 2 — Complete
Phase 3 — Not started
```

## Phase Progress

### Phase 1 — Configurable Timer
- [x] Add `timerDuration: number` to `GameState` (default 60)
- [x] Update Start screen with 30 / 60 / 90 / Custom selector
- [x] Pass `timerDuration` into `GameScreen`, replacing hardcoded 60

### Phase 2 — Score Tracking
- [x] Add `gameTotals: { correct: number; skip: number; steal: number }` to `GameState`
- [x] Accumulate current turn into totals on `onEndTurn` in `App.tsx`
- [x] Update Results screen — two sections: "This Turn" + "Game Total" with score = correct − skipped
- [x] Add "New Game" button to Results screen (resets totals + reshuffles deck)

### Phase 3 — GitHub Pages Deployment + Mobile Validation
- [ ] Configure `vite.config.ts` `base` for GitHub Pages
- [ ] Add `gh-pages` package + `deploy` script to `package.json`
- [ ] Write deployment guide (repo setup → push → enable Pages)
- [ ] Mobile validation pass — viewport, tap targets, no horizontal scroll

## Completed Work

_(nothing yet this version)_

[2026-03-21] — Phase 1 + 2 complete: configurable timer stepper on Start screen, gameTotals accumulation, Results screen with "This Turn" + "Game Total" sections, score display, New Game button

## Implementation Decisions

[2026-03-21] — Timer selector implemented as +/− stepper (10s steps, 10s–300s range, default 60s) instead of preset buttons — simpler and more flexible
[2026-03-21] — gameTotals accumulated at the point of phase transition to results (inside `recordAndAdvance` on lastWord) — avoids needing a separate `onEndTurn` handler
[2026-03-21] — "New Game" reshuffles deck and resets totals but preserves `timerDuration` from the current game

## Open Questions / Blockers

_(none)_

## Next Session

Start Phase 3 — Configure `vite.config.ts` base for GitHub Pages

---

## Previous Version Summary

- Built complete game flow: Start screen → 60s game screen → Results screen
- Correct / Skip / Steal buttons with steal-on-last-word mechanic
- Shuffled deck persists across turns; wraps around when exhausted
- Timer with color coding (green → orange → red) and pulse animation for last 5s
- Full visual polish — mobile-friendly layout, tinted stat cards on Results screen
- 100 Hebrew phrases (80 single words + 20 two-word phrases, ~50/50 easy/hard, 10 categories)
- All state in `App.tsx`; screens are stateless and receive props only
