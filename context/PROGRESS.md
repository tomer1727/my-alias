# Progress

## Current Status

```
Phase 0 — Complete
Phase 1 — Complete
Phase 2 — Complete
Phase 3 — Complete
Phase 4 — Complete
```

## Phase Progress

### Phase 0 — Environment Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Install dependencies and confirm dev server starts
- [x] Clean up Vite boilerplate

### Phase 1 — App Skeleton + Types + Phase Switching
- [x] Define shared TypeScript types (GamePhase, TurnEntry, GameState)
- [x] Implement top-level App.tsx with game state and phase switching logic
- [x] Create placeholder StartScreen, GameScreen, ResultsScreen components
- [x] Wire phase transitions: Start → Game → Results → Game / Start

### Phase 2 — Game Screen
- [x] Display current word from the shuffled deck
- [x] Implement 60-second countdown timer; on expiry, set `lastWord: true` instead of auto-transitioning
- [x] Implement Correct button — record result, advance to next word
- [x] Implement Skip button — record result, advance to next word
- [x] Handle deck exhaustion (wrap around to beginning)
- [x] Add Steal button — always rendered, active only when `lastWord` is true; styled to show inactive vs. active
- [x] When `lastWord` is true, any button press records result and transitions to Results

### Phase 3 — Results Screen
- [x] Display correct, skip, and steal counts for the completed turn
- [x] Render word-by-word review list (word + correct/skip/steal label; include stolen word if any)
- [x] "Start New Turn" button resumes from current deck position

### Phase 4 — Start Screen + Polish
- [x] Design and implement the Start screen
- [x] Apply consistent styling across all screens — clean, mobile-friendly
- [x] Add visual feedback on Correct/Skip buttons
- [x] Add urgency styling when timer is low
- [x] Test full game flow end-to-end on mobile viewport

### Phase 5 — Phrase Bank
- [ ] Curate ~100 phrases across varied categories
- [ ] Mix of easy and hard, mostly single words with some two-word phrases
- [ ] Write phrases into src/phrases.ts

## Completed Work

- Phase 0 complete (2026-03-21): Vite + React + TS scaffolded, boilerplate removed, build passing
- Phase 1 complete (2026-03-21): types defined, App.tsx with state/phase switching, placeholder screens, Start→Game transition working
- Phase 2 complete (2026-03-21): game screen fully functional — timer with color coding and pulse animation, Correct/Skip/Steal buttons, deck wrap-around, last-word behavior
- Phase 3 complete (2026-03-21): results screen functional — counts, word-by-word list, Start New Turn button (was already implemented in Phase 1 placeholder)
- Phase 4 complete (2026-03-21): full visual polish — Start screen with large branded title, Results screen with stat cards and color-coded badges, consistent screen layout and typography across all screens

## Implementation Decisions

- Timer state (timeLeft) lives in GameScreen as local state; expiry notifies App.tsx via onTimerExpiry callback to set lastWord: true
- Timer color: green (>10s), orange (≤10s), red (0); pulse animation added for last 5s — included in Phase 2 since it's tied to timer state
- Steal button styled grey/muted when inactive, amber when active (lastWord=true)
- Results stat cards use soft tinted backgrounds (green/slate/amber) matching the game button palette
- Phase 4 "visual feedback on buttons" satisfied by existing static colors — no press animation added (user confirmed this is sufficient)

## Open Questions / Blockers

_(none)_

## Next Session

Start Phase 5 — Phrase Bank (curate ~100 phrases into src/phrases.ts)
