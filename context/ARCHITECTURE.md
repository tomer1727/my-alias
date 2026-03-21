# Architecture

## System Overview

A fully static single-page web app. No server, no database, no network requests at runtime.
The entire app runs in the browser. The phrase bank is bundled as a TypeScript module.
State lives in React component memory — refreshing the page resets the game, which is acceptable.
Deployed to GitHub Pages as a static site.

## Component Structure

```
App.tsx
  — Owns all game state
  — Controls which screen is rendered based on `phase`
  — Passes state and callbacks down to screen components

StartScreen
  — Displays title and "Start New Game" button
  — Timer duration selector (30s / 60s / 90s / Custom)
  — Calls onStartGame(timerDuration) which shuffles the deck and transitions to 'game'

GameScreen
  — Displays current word (deck[deckIndex])
  — Runs the configurable countdown timer (timerDuration from GameState)
  — Correct button: records { word, result: 'correct' }, advances deckIndex (or ends turn if lastWord)
  — Skip button: records { word, result: 'skip' }, advances deckIndex (or ends turn if lastWord)
  — Steal button: always rendered; active only when lastWord is true; records { word, result: 'steal' } and ends turn
  — Timer expiry: sets lastWord = true (does NOT auto-transition)

ResultsScreen
  — "This Turn" section: correct/skip/steal counts + word-by-word review for completed turn
  — "Game Total" section: accumulated correct/skip/steal across all turns + score (correct − skipped)
  — "Start New Turn" button: accumulates turn into totals, clears currentTurn, transitions back to 'game'
  — "New Game" button: resets all state (totals, deck, index) and transitions to 'start'
```

## Data Model

```
GamePhase
  'start' | 'game' | 'results'

TurnEntry
  word: string
  result: 'correct' | 'skip' | 'steal'

TurnTotals
  correct: number
  skip: number
  steal: number

GameState (held in App.tsx)
  phase: GamePhase
  deck: string[]          — shuffled copy of all phrases, set once per game
  deckIndex: number       — current position in deck, persists across turns
  currentTurn: TurnEntry[] — entries for the turn in progress
  lastWord: boolean       — true when timer has hit 0; cleared when a new turn starts
  timerDuration: number   — turn duration in seconds, set on Start screen (default 60)
  gameTotals: TurnTotals  — accumulated counts across all completed turns
```

## Key Technical Decisions

**Decision:** No backend or persistence layer
**Reason:** The app is a personal tool used over video call. No login, no history needed. Simplicity is the priority.

**Decision:** Deck shuffled once per game, position persists across turns
**Reason:** Prevents words from repeating within a game. As the bank grows, wrap-around becomes negligible.

**Decision:** All state in App.tsx, screens receive props only
**Reason:** The app is small enough that a single state owner is simpler than context or a state library. Easy to reason about and extend.

**Decision:** Phrases stored as a plain string[] in phrases.ts
**Reason:** No metadata needed now. Easy for a human to edit and grow. Can be enriched with categories/difficulty later without changing the game logic.

**Decision:** Mobile-first layout
**Reason:** Players will use their phones during a video call. The game screen especially must be thumb-friendly.

**Decision:** GitHub Pages for deployment
**Reason:** Free static hosting that fits perfectly with a no-backend app. Friends can open the URL on any device with no install required.

## External Dependencies

- **React 18** — UI rendering
- **TypeScript** — type safety
- **Vite** — build tool and dev server
- **gh-pages** (dev) — deploy script to push built output to GitHub Pages

No runtime external dependencies beyond React itself.
