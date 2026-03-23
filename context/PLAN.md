# Plan

## Project Goal

A browser-based Alias word-guessing game for personal use with a small group of friends playing over video call. v2 adds full real-time multiplayer: a shared game room with synced timer, team-based score tracking, and a win condition — so everyone sees the same state automatically without verbal coordination.

## This Version's Scope

- Firebase Realtime Database backend for real-time game state sync
- Room creation and joining via 6-letter room codes
- Lobby with team self-assignment (Team A / Team B)
- Multiplayer game loop: describer sees word + buttons, others see timer + scores
- Teams alternate turns; describer rotates within each team
- First team to a configurable target score wins
- Host disconnection detection and overlay warning
- Reconnection support (rejoin via localStorage playerId)
- Firebase security rules for production

## Out of Scope (this version)

- Solo / single-player mode (removed)
- Difficulty / category filters (phrase bank not yet tagged)
- Phrase bank growth beyond current ~600 phrases
- Full anonymous game access without room code

## Implementation Phases

### Phase 1 — Firebase Setup + Room Create/Join
Goal: Players can create and join a game room; Firebase is wired up.

1. Install `firebase` package [simple]
2. Create `firebase/config.ts` — init app using `VITE_FIREBASE_*` env vars [simple]
3. Create `firebase/game.ts` — `createGame()`, `joinGame()`, `subscribeToGame()`, `updateGame()` helpers [medium]
4. Implement `utils/roomCode.ts` — 6-letter random uppercase code + collision check against Firebase [simple]
5. Implement `utils/seededShuffle.ts` — seeded Fisher-Yates (mulberry32 PRNG) [simple]
6. Build `HomeScreen`, `CreateScreen`, `JoinScreen` [medium]
7. Wire `App.tsx` to use `useGame.ts` hook for all state; remove old single-player state [medium]
8. Create `.env.example` documenting the required `VITE_FIREBASE_*` variable names [simple]

### Phase 2 — Lobby
Goal: Players can join a room, pick a team, and the host can start the game.

1. Build `LobbyScreen` — player list grouped by team A / B, self-assign buttons [medium]
2. "Start Game" button visible to host only; enabled when both teams have ≥1 player [simple]
3. Host config in lobby: timer duration + target score [simple]
4. Firebase `onDisconnect` — write `connected: false` on player disconnect [simple]
5. Host disconnection detection — if `hostId` player's `connected` flips to false, show overlay [simple]

### Phase 3 — Multiplayer Game Loop
Goal: Full turn cycle runs with real-time sync — describer plays, others watch.

1. `PreTurnScreen` — shows upcoming describer's name + team; tap "Start" writes `startedAt` and `phase: 'active'` to Firebase [simple]
2. Describer `GameScreen` — word from seeded deck at `deckIndex`, Correct/Skip/Steal buttons, timer derived from `startedAt` [medium]
3. Viewer `GameScreen` — timer, scores, "Team X / [Name] is describing" — no word, no buttons [simple]
4. Correct/Skip/Steal actions: write entry to `currentTurn.entries`, increment `deckIndex` in Firebase [medium]
5. Timer expiry: client-side check; describer's device writes `lastWord: true` when remaining ≤ 0 [simple]
6. Last word handling: Steal activates; any action writes `phase: 'results'` to Firebase [simple]

### Phase 4 — Turn Results + Score + Win
Goal: Scores accumulate correctly, turns rotate, game ends when a team wins.

1. `TurnResultsScreen` — turn word-by-word summary + both team scores; "Start Next Turn" button shown to the next describer [medium]
2. "Start Next Turn" action: accumulate turn score into `teams.{team}.score`, advance `globalTurnIndex` + `turnDescIndex`, clear `currentTurn`, write `phase: 'waiting'` [medium]
3. Win check after score accumulation: if `score >= targetScore`, write `winner` and `status: 'finished'` [simple]
4. `WinScreen` — winning team, final scores, "Play Again" (resets game in Firebase back to lobby) [simple]

### Phase 5 — Polish + Edge Cases
Goal: Handles reconnection, cleanup, and deployment.

1. Reconnection: on app load, check `localStorage` for `playerId`; re-subscribe to any active game that player is part of [medium]
2. "Host disconnected" overlay — blocking UI with "Waiting for host to reconnect…" [simple]
3. Stale game cleanup — write `createdAt` timestamp; document manual cleanup via Firebase console [simple]
4. Update `npm run deploy` — document that `VITE_FIREBASE_*` env vars must be set before building [simple]
5. Update Firebase security rules — lock down `games/{roomCode}` to prevent arbitrary writes [medium]
