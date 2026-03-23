# Alias Game

A browser-based Alias word-guessing game for personal use with friends over video call.
Real-time multiplayer via Firebase Realtime Database — players join a shared room by code, teams alternate turns, first to the target score wins.
~600 Hebrew phrases, configurable timer, deployed to GitHub Pages.

## Tech Stack

- React 18
- TypeScript
- Vite
- CSS (plain, no framework)
- Firebase Realtime Database (real-time game state sync)

## Project Structure

```
src/
  screens/          # Screen components (HomeScreen, CreateScreen, JoinScreen,
                    #   LobbyScreen, PreTurnScreen, GameScreen,
                    #   TurnResultsScreen, WinScreen)
  hooks/
    useGame.ts      # Firebase subscription + all game state and actions
  firebase/
    config.ts       # Firebase app init (reads VITE_FIREBASE_* env vars)
    game.ts         # createGame, joinGame, subscribeToGame, updateGame, registerDisconnect helpers
  utils/
    seededShuffle.ts  # Deterministic Fisher-Yates with mulberry32 PRNG
    roomCode.ts       # 6-letter uppercase room code generation + collision check
  types.ts          # Shared TypeScript types (Firebase data model)
  phrases.ts        # Full phrase bank (plain string array, ~600 phrases)
  App.tsx           # Thin router — reads phase from useGame, renders correct screen
  main.tsx          # Vite entry point
context/            # Project planning docs
  PREREQUISITES.md  # Firebase setup guide — complete this before Phase 1
```

## Key Conventions

- All game state lives in Firebase and is read via `useGame.ts` hook — screens receive props only
- `App.tsx` is a thin router; it does not own game state
- Timer sync: `startedAt` timestamp stored in Firebase; each client computes `remaining = timerDuration - (Date.now() - startedAt)` locally
- Deck sync: `deckSeed` stored in Firebase; all clients run the same seeded Fisher-Yates shuffle locally — only `deckIndex` is synced
- `playerId` (UUID) is stored in `localStorage` for reconnection without login
- Phrases are a plain `string[]` in `phrases.ts` — no metadata, no IDs
- Mobile-friendly layout — game is played on phones while on a video call
- Firebase config injected at build time via `VITE_FIREBASE_*` env vars in `.env.local`

## Context Files

```
context/PLAN.md           — Implementation plan and phases (v2)
context/ARCHITECTURE.md   — System design and technical decisions
context/PROGRESS.md       — Session tracking and current status
context/BACKLOG.md        — Future features and ideas
context/PREREQUISITES.md  — Firebase setup steps (complete before Phase 1)
context/archive/PLAN_v1.md — Archived v1 plan (all phases complete)
```

## Current Focus

> v2 Multiplayer — Phase 4 not started
> Phase 3 complete: full game turn loop (PreTurnScreen, GameScreen describer/viewer, Correct/Skip/Steal, timer expiry, last-word handling). TurnResultsScreen is a placeholder.
> Run `session-execute` to continue with Phase 4 (Turn Results + Score + Win).
> Deploy with `npm run deploy` (requires `VITE_FIREBASE_*` vars in `.env.local`)
