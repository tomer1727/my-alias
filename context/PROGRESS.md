# Progress

## Current Status

```
Phase 0 — Not started
```

## Phase Progress

### Phase 0 — Environment Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies and confirm dev server starts
- [ ] Clean up Vite boilerplate

### Phase 1 — App Skeleton + Types + Phase Switching
- [ ] Define shared TypeScript types (GamePhase, TurnEntry, GameState)
- [ ] Implement top-level App.tsx with game state and phase switching logic
- [ ] Create placeholder StartScreen, GameScreen, ResultsScreen components
- [ ] Wire phase transitions: Start → Game → Results → Game / Start

### Phase 2 — Game Screen
- [ ] Display current word from the shuffled deck
- [ ] Implement 60-second countdown timer; on expiry, set `lastWord: true` instead of auto-transitioning
- [ ] Implement Correct button — record result, advance to next word
- [ ] Implement Skip button — record result, advance to next word
- [ ] Handle deck exhaustion (wrap around to beginning)
- [ ] Add Steal button — always rendered, active only when `lastWord` is true; styled to show inactive vs. active
- [ ] When `lastWord` is true, any button press records result and transitions to Results

### Phase 3 — Results Screen
- [ ] Display correct, skip, and steal counts for the completed turn
- [ ] Render word-by-word review list (word + correct/skip/steal label; include stolen word if any)
- [ ] "Start New Turn" button resumes from current deck position

### Phase 4 — Start Screen + Polish
- [ ] Design and implement the Start screen
- [ ] Apply consistent styling across all screens — clean, mobile-friendly
- [ ] Add visual feedback on Correct/Skip buttons
- [ ] Add urgency styling when timer is low
- [ ] Test full game flow end-to-end on mobile viewport

### Phase 5 — Phrase Bank
- [ ] Curate ~100 phrases across varied categories
- [ ] Mix of easy and hard, mostly single words with some two-word phrases
- [ ] Write phrases into src/phrases.ts

## Completed Work

_(nothing yet)_

## Implementation Decisions

_(decisions made during coding that weren't in the original plan)_

## Open Questions / Blockers

_(none)_

## Next Session

Start Phase 0 — Initialize Vite + React + TypeScript project
