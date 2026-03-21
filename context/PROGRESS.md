# Progress

## Current Status

```
Phase 1 — Not started
Phase 2 — Not started
Phase 3 — Not started
```

## Phase Progress

### Phase 1 — Configurable Timer
- [ ] Add `timerDuration: number` to `GameState` (default 60)
- [ ] Update Start screen with 30 / 60 / 90 / Custom selector
- [ ] Pass `timerDuration` into `GameScreen`, replacing hardcoded 60

### Phase 2 — Score Tracking
- [ ] Add `gameTotals: { correct: number; skip: number; steal: number }` to `GameState`
- [ ] Accumulate current turn into totals on `onEndTurn` in `App.tsx`
- [ ] Update Results screen — two sections: "This Turn" + "Game Total" with score = correct − skipped
- [ ] Add "New Game" button to Results screen (resets totals + reshuffles deck)

### Phase 3 — GitHub Pages Deployment + Mobile Validation
- [ ] Configure `vite.config.ts` `base` for GitHub Pages
- [ ] Add `gh-pages` package + `deploy` script to `package.json`
- [ ] Write deployment guide (repo setup → push → enable Pages)
- [ ] Mobile validation pass — viewport, tap targets, no horizontal scroll

## Completed Work

_(nothing yet this version)_

## Implementation Decisions

_(none yet)_

## Open Questions / Blockers

_(none)_

## Next Session

Start Phase 1 — Add `timerDuration` to `GameState` and build the timer selector on Start screen

---

## Previous Version Summary

- Built complete game flow: Start screen → 60s game screen → Results screen
- Correct / Skip / Steal buttons with steal-on-last-word mechanic
- Shuffled deck persists across turns; wraps around when exhausted
- Timer with color coding (green → orange → red) and pulse animation for last 5s
- Full visual polish — mobile-friendly layout, tinted stat cards on Results screen
- 100 Hebrew phrases (80 single words + 20 two-word phrases, ~50/50 easy/hard, 10 categories)
- All state in `App.tsx`; screens are stateless and receive props only
