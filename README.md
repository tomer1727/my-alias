# Alias

A browser-based Alias word-guessing game for personal use with friends over video call.
Real-time multiplayer via Firebase Realtime Database — players join a shared room by code, teams alternate turns, first to the target score wins. ~600 Hebrew phrases.

## Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Firebase project values:
   ```
   cp .env.example .env.local
   ```
   Required variables:
   ```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_DATABASE_URL=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_APP_ID=
   ```
   See `context/PREREQUISITES.md` for Firebase project setup steps.

3. Start the dev server:
   ```
   npm run dev
   ```

## Deploy

The app deploys to GitHub Pages. The Firebase env vars must be available at **build time** — they are injected by Vite as `import.meta.env.VITE_*` and baked into the static bundle.

Make sure `.env.local` is populated, then run:
```
npm run deploy
```

This runs `npm run build` followed by `gh-pages -d dist`.

## Firebase Security Rules

The current rules allow open read/write on `games/$roomCode`:

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

This is intentional — the app is a personal tool used among friends. There is no auth, and tightening rules beyond this adds complexity without meaningful benefit for this use case.

## Stale Game Cleanup

Each game document stores a `createdAt` timestamp. Old rooms are not automatically deleted. To clean up stale games, go to the Firebase console → Realtime Database and manually remove entries under `games/` that are no longer needed.
