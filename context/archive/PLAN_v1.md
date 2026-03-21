# Plan

## Project Goal

A browser-based Alias word-guessing game for personal use with a small group of friends playing over video call (Zoom, etc.). Each player opens the app on their own device. There is no real-time connectivity between players — coordination happens verbally. The app handles one player's turn at a time: showing words, running a 60-second timer, and recording correct/skip results. Scoring across turns is tracked on paper. The long-term goal is a rich phrase bank of ~2000 diverse phrases.

## This Version's Scope

- Start screen with "Start New Game" button
- Game screen: current word, 60s countdown timer, Correct and Skip buttons
- Results screen: correct count, skip count, word-by-word turn review, "Start New Turn" button
- Shuffled deck that persists across turns within a game (deck position carries over between turns)
- Initial phrase bank of ~100 phrases (diverse categories, mix of easy/hard)

## Out of Scope (this version)

- Real-time connectivity between players
- Score tracking across turns (done on paper)
- Configurable timer duration
- Growing the phrase bank beyond ~100 phrases (post-MVP content work)
- User accounts, persistence, or any backend

## Implementation Phases

### Phase 0 — Environment Setup
Goal: Working dev environment with the project running in the browser.

1. Initialize Vite + React + TypeScript project [simple]
2. Install dependencies and confirm dev server starts [simple]
3. Clean up Vite boilerplate (remove default styles and placeholder content) [simple]

### Phase 1 — App Skeleton + Types + Phase Switching
Goal: All three screens render (as placeholders) and phase transitions work correctly.

1. Define shared TypeScript types (`GamePhase`, `TurnEntry`, `GameState`) [simple]
2. Implement top-level `App.tsx` with game state and phase switching logic [medium]
3. Create placeholder `StartScreen`, `GameScreen`, `ResultsScreen` components [simple]
4. Wire phase transitions: Start → Game → Results → Game (new turn) / Start (new game) [medium]

### Phase 2 — Game Screen
Goal: Fully functional game screen — words advance, timer counts down, turn ends on last word.

1. Display current word from the shuffled deck [simple]
2. Implement 60-second countdown timer; on expiry, set `lastWord: true` instead of auto-transitioning [medium]
3. Implement Correct button — record result, advance to next word [simple]
4. Implement Skip button — record result, advance to next word [simple]
5. Handle deck exhaustion (wrap around to beginning) [simple]
6. Add Steal button — always rendered, active only when `lastWord` is true; use color/style to indicate inactive vs. active state [simple]
7. When `lastWord` is true, any button press (Correct / Skip / Steal) records the result and transitions to Results instead of advancing to next word [simple]

### Phase 3 — Results Screen
Goal: Results screen shows accurate turn summary and correctly resumes the game.

1. Display correct, skip, and steal counts for the completed turn [simple]
2. Render word-by-word review list (word + correct/skip/steal label; include the stolen word if any) [simple]
3. "Start New Turn" button resumes from current deck position [simple]

### Phase 4 — Start Screen + Polish
Goal: App looks good and feels complete across all screens.

1. Design and implement the Start screen (title, tagline, "Start New Game" button) [simple]
2. Apply consistent styling across all screens — clean, mobile-friendly [medium]
3. Add visual feedback on Correct/Skip buttons (color, animation) [simple]
4. Ensure timer is visually prominent; add urgency styling when time is low [simple]
5. Test full game flow end-to-end on mobile viewport [simple]

### Phase 5 — Phrase Bank
Goal: App ships with ~100 high-quality, diverse phrases ready to play.

1. Curate ~100 phrases across varied categories (objects, nature, people, sports, food, emotions, places, etc.) [medium]
2. Mix of easy and hard, mostly single words with some two-word phrases [medium]
3. Write phrases into `src/phrases.ts` [simple]
