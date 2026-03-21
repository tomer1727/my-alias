# Backlog

Ideas and future features that aren't part of the current plan.
Add items here as they come up. Use the `add-feature` skill to promote them to the plan.

## Real-time Multiplayer
What: Sync game state between players so everyone sees the same word, timer, and scores in real time — no need for a video call to coordinate.
Why deferred: Significant complexity (requires a backend with WebSockets or a managed service like Supabase/Firebase). Not needed for the personal use case in v2.

## Two-Team Score Tracking
What: Track Team A and Team B scores separately, alternating turns between teams, with a leaderboard visible on the Results screen.
Why deferred: Depends on real-time connectivity so both teams can see a shared score. Deferred until multiplayer is added.

## Phrase Bank Growth (to ~2000)
What: Expand the phrase bank from ~100 to ~2000 diverse phrases across many categories.
Why deferred: Content work — best done after the team has played more sessions to understand what kinds of phrases work well.

## Difficulty / Category Filters
What: Tag phrases with difficulty (easy/hard) and category, and let players filter which subset to play with.
Why deferred: Requires enriching the phrase data model. Worthwhile once the bank is large enough to make filtering meaningful.
