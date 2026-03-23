# Firebase Setup — Prerequisites

Complete these steps **before** starting Phase 1 development. All steps are in the Firebase console and take about 10 minutes.

---

## Step 1: Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Name it (e.g. `my-alias`)
4. Disable Google Analytics — not needed
5. Click **Create project**

---

## Step 2: Register a Web App

1. From the project overview, click the **`</>`** (Web) icon
2. Give the app a nickname (e.g. `my-alias-web`)
3. Leave "Also set up Firebase Hosting" **unchecked** — you're using GitHub Pages
4. Click **Register app**
5. You'll see a `firebaseConfig` object like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "my-alias.firebaseapp.com",
  databaseURL: "https://my-alias-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "my-alias",
  appId: "1:...:web:..."
};
```

**Copy these values** — you'll need them in Step 4.

6. Click **Continue to console**

---

## Step 3: Enable Realtime Database

1. In the left sidebar: **Build → Realtime Database**
2. Click **Create Database**
3. Choose a region — pick **`europe-west1`** for lower latency from Israel
4. Choose **Start in test mode** (open read/write for 30 days)
   - This is fine for now — Phase 5 will lock it down with proper security rules
5. Click **Enable**

> **Important:** The `databaseURL` in your `firebaseConfig` must include the region, e.g.:
> `https://my-alias-default-rtdb.europe-west1.firebasedatabase.app`
> (Not the default US URL — make sure it matches the region you chose)

---

## Step 4: Set Up Local Environment Variables

Create a `.env.local` file in the project root (it's already in `.gitignore`, so it won't be committed):

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=my-alias.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://my-alias-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=my-alias
VITE_FIREBASE_APP_ID=1:...:web:...
```

Replace each value with the corresponding value from your `firebaseConfig` object (Step 2).

---

## Step 5: Add GitHub Secrets for Deployment

So `npm run deploy` can build with the right Firebase config:

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret** and add each of the 5 vars:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`

> **Note:** If you deploy manually from your local machine with `npm run deploy` and `.env.local` is present, Vite will pick up the vars automatically. The GitHub secrets are only needed if you ever set up a CI/CD deploy workflow.

---

## Step 6: Verify Setup

After Phase 1 code is written:

1. Run `npm run dev`
2. Open browser devtools → Console
3. If Firebase initializes without errors, you're good
4. You can also open the Firebase console → Realtime Database to see data being written as you test

---

## Troubleshooting

**"Firebase: No Firebase App '[DEFAULT]' has been created" error**
→ `.env.local` is missing or the var names are wrong. Make sure they start with `VITE_`.

**"Firebase: Error (app/invalid-api-key)"**
→ `VITE_FIREBASE_API_KEY` value is wrong or has extra whitespace.

**"Error: Invalid database URL"**
→ `VITE_FIREBASE_DATABASE_URL` must be the full URL including region, e.g. `https://my-alias-default-rtdb.europe-west1.firebasedatabase.app`. Copy it exactly from the Firebase console.

**"Firebase: Error (database/permission-denied)"**
→ The 30-day test mode has expired. Go to Firebase console → Realtime Database → Rules and temporarily set both `read` and `write` to `true` while developing. Phase 5 will replace this with proper rules.

**`npm run deploy` builds but the app shows blank / errors in production**
→ The `VITE_FIREBASE_*` env vars weren't available at build time. Make sure `.env.local` exists locally before running `npm run deploy`, or set up GitHub Actions with the secrets from Step 5.
