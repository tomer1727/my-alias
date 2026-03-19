# Backlog

Ideas and future features that aren't part of the current plan.
Add items here as they come up. Use the `add-feature` skill to promote them to the plan.

## Real-time Multiplayer
What: Sync game state between players so everyone sees the same word, timer, and scores in real time — no need for a video call to coordinate.
Why deferred: Significant complexity (requires a backend with WebSockets or a managed service like Supabase/Firebase). Not needed for the personal use case in v1.

## Configurable Timer
What: Let players set the turn duration (e.g., 30s, 60s, 90s) on the Start screen.
Why deferred: Not needed for MVP — 60 seconds is a good default. Easy to add later.

## Score Tracking Across Turns
What: Track each team's cumulative score within a game, removing the need for paper scorekeeping.
Why deferred: Requires knowing the team/player setup. Out of scope for v1.

## Phrase Bank Growth (to ~2000)
What: Expand the phrase bank from ~100 to ~2000 diverse phrases across many categories.
Why deferred: Content work — best done after the game is working and the team has played a few sessions to understand what kinds of phrases work well.

## Difficulty / Category Filters
What: Tag phrases with difficulty (easy/hard) and category, and let players filter which subset to play with.
Why deferred: Requires enriching the phrase data model. Worthwhile once the bank is large enough to make filtering meaningful.
