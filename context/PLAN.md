# Plan

## Project Goal

A browser-based Alias word-guessing game for personal use with a small group of friends playing over video call. v3 adds real-time feedback for viewers during a turn and lets the describer correct entry mistakes in the results screen — making the game feel more responsive and reducing frustration from accidental button presses.

## This Version's Scope

- Live running turn score on viewer GameScreen (derived from `currentTurn.entries`, no extra Firebase writes)
- Animated +1 / −1 badge on viewer GameScreen when a new entry lands
- Editable word entries in TurnResultsScreen — describer only can toggle each word's result
- Score total in TurnResultsScreen updates reactively as entries are changed

## Out of Scope (this version)

- Phrase bank growth (still deferred — content work)
- Difficulty / category filters (requires tagging all phrases first)
- Sound effects or haptic feedback

## Implementation Phases

### Phase 1 — Live viewer feedback
Goal: Viewers see the running turn score and a brief animation on each Correct/Skip action.
Depends on: (none)

1. Derive running turn score from `currentTurn.entries` in viewer GameScreen [simple]
2. Display "This turn: +N" alongside the game total in viewer view [simple]
3. Detect new entry additions (entries array length change) and trigger badge animation [medium]
4. Build fade-out +1 / −1 badge component [simple]

### Phase 2 — Editable entries in TurnResultsScreen
Goal: Describer can fix mis-tapped results before the turn score is committed.
Depends on: (none)

1. Add `updateEntryResult()` helper to `firebase/game.ts` [simple]
2. Add toggle button to each word row in TurnResultsScreen, visible to describer only [simple]
3. Cycle result on tap: correct ↔ skip for all words; correct / skip / steal for the last word [medium]
4. Show updated running turn total in TurnResultsScreen reactively [simple]
