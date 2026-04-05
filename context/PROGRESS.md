# Progress

## Current Status

```
Phase 1 — Live viewer feedback    — Not started
Phase 2 — Editable entries        — Not started
```

## Phase Progress

### Phase 1 — Live viewer feedback
- [ ] Derive running turn score from `currentTurn.entries` in viewer GameScreen
- [ ] Display "This turn: +N" alongside the game total in viewer view
- [ ] Detect new entry additions and trigger badge animation
- [ ] Build fade-out +1 / −1 badge component

### Phase 2 — Editable entries in TurnResultsScreen
- [ ] Add `updateEntryResult()` helper to `firebase/game.ts`
- [ ] Add toggle button to each word row in TurnResultsScreen, visible to describer only
- [ ] Cycle result on tap: correct ↔ skip for all words; correct / skip / steal for last word
- [ ] Show updated running turn total in TurnResultsScreen reactively

## Completed Work

_(nothing yet this version)_

## Implementation Decisions

_(none yet)_

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
