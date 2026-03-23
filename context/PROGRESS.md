# Progress

## Current Status

```
Phase 1 — Complete
Phase 2 — Complete
Phase 3 — Not started
Phase 4 — Not started
Phase 5 — Not started
```

## Phase Progress

### Phase 1 — Firebase Setup + Room Create/Join
- [x] Install `firebase` package
- [x] Create `firebase/config.ts` — init app using `VITE_FIREBASE_*` env vars
- [x] Create `firebase/game.ts` — `createGame()`, `joinGame()`, `subscribeToGame()`, `updateGame()` helpers
- [x] Implement `utils/roomCode.ts` — 6-letter random uppercase code + collision check
- [x] Implement `utils/seededShuffle.ts` — seeded Fisher-Yates (mulberry32 PRNG)
- [x] Build `HomeScreen`, `CreateScreen`, `JoinScreen`
- [x] Wire `App.tsx` to use `useGame.ts` hook; remove old single-player state
- [x] Create `.env.example` documenting required `VITE_FIREBASE_*` variable names

### Phase 2 — Lobby
- [x] Build `LobbyScreen` — player list grouped by team A / B, self-assign buttons
- [x] "Start Game" button visible to host only; enabled when both teams have ≥1 player
- [x] Host config in lobby: timer duration + target score
- [x] Firebase `onDisconnect` — write `connected: false` on player disconnect
- [x] Host disconnection detection — show overlay when host disconnects

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

[2026-03-23] — Phase 1 complete: Firebase wired up, room create/join flow working end-to-end with real-time sync
[2026-03-23] — Phase 2 complete: Lobby with team self-assignment, host config (timer + target score steppers), Start Game flow, host disconnect overlay

## Implementation Decisions

[2026-03-23] — `CreateScreen` collects nickname only; timer/target score config moved to lobby (Phase 2)
[2026-03-23] — Used `crypto.randomUUID()` for `playerId` generation instead of adding a `uuid` package dependency
[2026-03-23] — Firebase database rules set to open read/write on `games/$roomCode` for development; Phase 5 will tighten
[2026-03-23] — Phase 2, Task 4 (onDisconnect) was already implemented in Phase 1 via `registerDisconnect`; marked complete
[2026-03-23] — Host disconnect overlay (Phase 2, Task 5) is lobby-only for now; full in-game overlay deferred to Phase 5
[2026-03-23] — `handleStartGame` initializes `currentTurn` (team A, first describer) when starting; Phase 3 `PreTurnScreen` reads it directly
[2026-03-23] — Team players shown in Firebase key insertion order; consistent across all clients

## Open Questions / Blockers

_(none)_

## Next Session

Start Phase 3 — Multiplayer Game Loop: PreTurnScreen, describer GameScreen, viewer GameScreen, Correct/Skip/Steal actions, timer expiry + last word handling

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
