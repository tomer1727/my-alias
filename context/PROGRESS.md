# Progress

## Phase Progress

### Phase 1 — Live viewer feedback
- [x] Derive running turn score from `currentTurn.entries` in viewer GameScreen
- [x] Display "This turn: +N" alongside the game total in viewer view
- [x] Detect new entry additions and trigger badge animation
- [x] Build fade-out +1 / −1 badge component

### Phase 2 — Editable entries in TurnResultsScreen
- [x] Add `updateEntryResult()` helper to `firebase/game.ts`
- [x] Add toggle button to each word row in TurnResultsScreen, visible to describer only
- [x] Cycle result on tap: correct ↔ skip for all words; correct / skip / steal for last word
- [x] Show updated running turn total in TurnResultsScreen reactively

## Completed Work

2026-04-05 — Phase 1 complete: live running turn score and +1/−1 entry badge animation for viewers
2026-04-05 — Phase 2 complete: editable turn entries in TurnResultsScreen

## Implementation Decisions

2026-04-05 — Turn score = corrects − skips; steal excluded (steal immediately transitions to results screen)
2026-04-05 — Badge is centered overlay (position: fixed, 50% from bottom), slides up + fades over 1.2s; describer does not see it
2026-04-05 — `entries` defaults to `[]` in GameScreen destructure — Firebase omits the key until first entry is written
2026-04-05 — Steal is only valid on the last word; non-last entries cycle correct ↔ skip only
2026-04-05 — Used dashed border (currentColor) on badge buttons as the edit affordance — matches badge color, no extra UI elements
2026-04-05 — Score delta in results screen is already reactive (derived from entryList on every render); no extra Firebase writes needed

## Open Questions / Blockers

_(none)_

---

## Previous Version Summary

- v2 added full real-time multiplayer via Firebase Realtime Database
- Room create/join with 6-letter codes; lobby with team self-assignment and host config
- Full multiplayer game loop: describer and viewer roles, synced timer (startedAt timestamp), seeded deck (mulberry32 PRNG + Fisher-Yates, only deckIndex synced)
- Turn results screen, score accumulation, win condition, Play Again
- Reconnection: opt-in rejoin prompt on HomeScreen using localStorage playerId + roomCode
- Host disconnect overlay on both LobbyScreen and GameScreen (reuses .lobby-overlay CSS)
- Firebase open rules kept intentionally for personal-use tool; documented in README
- Deployed to GitHub Pages via `npm run deploy`; VITE_FIREBASE_* vars required at build time
