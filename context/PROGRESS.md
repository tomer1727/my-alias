# Progress

## Current Status

```
Phase 1 — Not started
Phase 2 — Not started
Phase 3 — Not started
Phase 4 — Not started
Phase 5 — Not started
```

## Phase Progress

### Phase 1 — Firebase Setup + Room Create/Join
- [ ] Install `firebase` package
- [ ] Create `firebase/config.ts` — init app using `VITE_FIREBASE_*` env vars
- [ ] Create `firebase/game.ts` — `createGame()`, `joinGame()`, `subscribeToGame()`, `updateGame()` helpers
- [ ] Implement `utils/roomCode.ts` — 6-letter random uppercase code + collision check
- [ ] Implement `utils/seededShuffle.ts` — seeded Fisher-Yates (mulberry32 PRNG)
- [ ] Build `HomeScreen`, `CreateScreen`, `JoinScreen`
- [ ] Wire `App.tsx` to use `useGame.ts` hook; remove old single-player state
- [ ] Create `.env.example` documenting required `VITE_FIREBASE_*` variable names

### Phase 2 — Lobby
- [ ] Build `LobbyScreen` — player list grouped by team A / B, self-assign buttons
- [ ] "Start Game" button visible to host only; enabled when both teams have ≥1 player
- [ ] Host config in lobby: timer duration + target score
- [ ] Firebase `onDisconnect` — write `connected: false` on player disconnect
- [ ] Host disconnection detection — show overlay when host disconnects

### Phase 3 — Multiplayer Game Loop
- [ ] `PreTurnScreen` — upcoming describer's name + team; tap Start writes `startedAt` to Firebase
- [ ] Describer `GameScreen` — word, Correct/Skip/Steal, timer from `startedAt`
- [ ] Viewer `GameScreen` — timer, scores, whose turn — no word, no buttons
- [ ] Correct/Skip/Steal actions write to `currentTurn.entries`, increment `deckIndex`
- [ ] Timer expiry: describer writes `lastWord: true` when remaining ≤ 0
- [ ] Last word handling: Steal activates; any action writes `phase: 'results'`

### Phase 4 — Turn Results + Score + Win
- [ ] `TurnResultsScreen` — turn summary + team scores; "Start Next Turn" for next describer
- [ ] "Start Next Turn" accumulates score, advances turn rotation, clears `currentTurn`
- [ ] Win check: if `score >= targetScore`, write `winner` and `status: 'finished'`
- [ ] `WinScreen` — winning team, final scores, Play Again

### Phase 5 — Polish + Edge Cases
- [ ] Reconnection: check `localStorage` for `playerId`, re-subscribe to active game
- [ ] "Host disconnected" blocking overlay
- [ ] Stale game cleanup — write `createdAt`, document manual cleanup
- [ ] Update deploy docs — `VITE_FIREBASE_*` vars required at build time
- [ ] Firebase security rules — lock down `games/{roomCode}`

## Completed Work

_(nothing yet this version)_

## Implementation Decisions

_(none yet)_

## Open Questions / Blockers

- Firebase project and `.env.local` must be set up by the developer before Phase 1 can run — see `context/PREREQUISITES.md`

## Next Session

Start Phase 1 — Firebase setup + room create/join flow

---

## Previous Version Summary

- v1 was a single-player turn manager: Start screen → Game screen → Results screen
- Configurable timer (stepper, 10s–300s, default 60s)
- Score tracking: "This Turn" + "Game Total" sections on Results screen; score = correct − skipped
- New Game button resets totals, reshuffles deck, preserves timer setting
- Timer implemented as `setInterval` countdown with color coding (green → orange → red) and last-5s pulse
- Shuffled deck persists across turns within a game; wraps around when exhausted
- ~600 Hebrew phrases (started at 100, grew to ~600 via manual additions)
- All state owned by `App.tsx`; screens were stateless props receivers
- Deployed to GitHub Pages via `npm run deploy` (gh-pages package)
- SSH alias `github-second` used to deploy as tomer1727 from this machine
