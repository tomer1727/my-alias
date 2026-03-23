# Architecture

## System Overview

A fully static single-page web app deployed to GitHub Pages. Game state is synchronized in real time via **Firebase Realtime Database** — no custom server, no auth. Each player opens the app on their own device, joins a room via a 6-letter code, and sees the same live game state.

## Component Structure

```
App.tsx
  — Reads all game state from useGame.ts hook
  — Routes to the correct screen based on game phase and player role
  — No longer owns game state directly

screens/
  HomeScreen       — Create Game / Join Game entry point
  CreateScreen     — Host configures game (nickname, timer, target score) → room code
  JoinScreen       — Guest enters room code + nickname
  LobbyScreen      — Player list, team self-assignment, host starts game
  PreTurnScreen    — "Team X — [Name]'s turn" — describer taps Start
  GameScreen       — Two roles:
                     Describer: word + Correct/Skip/Steal + timer
                     Viewer: timer + team scores + whose turn (no word)
  TurnResultsScreen — Turn word-by-word summary + team scores; next describer taps Start Next Turn
  WinScreen        — Winning team + final scores + Play Again

hooks/
  useGame.ts       — Firebase subscription, derived state, all action handlers

firebase/
  config.ts        — Firebase app init from VITE_ env vars
  game.ts          — createGame(), joinGame(), subscribeToGame(), updateGame(), onDisconnect helpers

utils/
  seededShuffle.ts — Deterministic Fisher-Yates using mulberry32 PRNG
  roomCode.ts      — Generate 6-letter uppercase room code, check against Firebase for collisions
```

## Data Model

```
Firebase Realtime Database — games/{roomCode}:

  status: 'lobby' | 'playing' | 'finished'
  hostId: string
  createdAt: number              // epoch ms — for stale game tracking

  config:
    timerDuration: number        // seconds per turn
    targetScore: number          // first team to reach this wins

  players:
    {playerId}:
      name: string
      team: 'A' | 'B' | null
      connected: boolean

  teams:
    A: { score: number; turnDescIndex: number }
    B: { score: number; turnDescIndex: number }

  globalTurnIndex: number        // even = Team A's turn, odd = Team B's turn

  deckSeed: string               // random seed — all clients regenerate deck locally
  deckIndex: number              // current position in the shuffled deck

  currentTurn:
    team: 'A' | 'B'
    describerId: string          // playerId
    phase: 'waiting' | 'active' | 'results'
    startedAt: number | null     // epoch ms; null until describer taps Start
    entries: TurnEntry[]         // { word, result } for each word played
    lastWord: boolean

  winner: 'A' | 'B' | null

Local (React state / localStorage):
  playerId: string               // UUID, persisted in localStorage for reconnection
```

### Legacy types (removed in v2)
`GameState`, `GamePhase` from v1 — replaced by the Firebase data model above.

## Key Technical Decisions

**Decision:** No backend or persistence layer (v1)
**Reason:** The app is a personal tool used over video call. No login, no history needed.

**[v2] Firebase Realtime Database for sync**
**Reason:** Free tier, JSON-native, real-time push updates without polling. Perfect fit for a small-group turn-based game. No custom server to maintain.

**[v2] startedAt timestamp for timer sync**
**Reason:** Storing a timestamp and computing `remaining = timerDuration - (Date.now() - startedAt)` on each client keeps all timers in sync with zero ongoing writes. Much cleaner than trying to sync a countdown value.

**[v2] Seeded deck shuffle**
**Reason:** All clients generate an identical shuffled deck from the same seed (mulberry32 PRNG + Fisher-Yates). Only `deckIndex` needs to be synced — avoids writing 600 phrases to Firebase.

**[v2] playerId in localStorage**
**Reason:** Allows a player to rejoin a game in progress if they accidentally close their tab, without any login or session management.

**Decision:** All state in App.tsx, screens receive props only (v1)
**Reason (updated):** In v2, state moves to `useGame.ts` hook which owns the Firebase subscription. App.tsx becomes a thin router. Screens still receive props — the pattern is preserved, the source shifts.

**Decision:** Deck shuffled once per game, position persists across turns
**Reason:** Prevents words from repeating within a game.

**Decision:** Phrases stored as a plain string[] in phrases.ts
**Reason:** No metadata needed now. Easy for a human to edit and grow. Can be enriched with categories/difficulty later.

**Decision:** Mobile-first layout
**Reason:** Players use phones during a video call.

**Decision:** GitHub Pages for deployment
**Reason:** Free static hosting. Firebase config values are injected at build time via VITE_ env vars.

## External Dependencies

- **React 18** — UI rendering
- **TypeScript** — type safety
- **Vite** — build tool and dev server
- **firebase** — Realtime Database SDK (runtime dependency, added in v2)
- **gh-pages** (dev) — deploy script to push built output to GitHub Pages

## Firebase Security Rules (Phase 5 target)

```json
{
  "rules": {
    "games": {
      "$roomCode": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

Phase 5 will tighten these rules to prevent arbitrary data writes while keeping the personal-use simplicity.
