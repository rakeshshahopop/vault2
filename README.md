# Vault — setup guide for beginners

This walks through everything, in order, assuming you've never done this
before. Don't skip steps — each one depends on the last.

There are 3 phases:
1. Set up Fire base (the login system + storage) — **do this first**
2. Run the site on your own computer to test it
3. Put it on GitHub so it's live on the internet

---

## Phase 1 — Firebase setup

### 1.1 Create the project

1. Go to https://console.firebase.google.com
2. Click **Add project** → give it any name (e.g. "my-vault") → follow the
   prompts (you can disable Google Analytics, you don't need it) → **Create
   project**.

### 1.2 Turn on login (Authentication)

1. In the left sidebar of the Firebase console: **Build → Authentication**.
2. Click **Get started**.
3. Click **Email/Password** in the provider list → toggle it **Enable** →
   **Save**.
4. Go to the **Users** tab (still inside Authentication) → **Add user**.
5. Type in an email and password — this is what *you* will log in with.
   There is no public sign-up page in this app; you're the only one who can
   create accounts, right here in this console. Add as many as you want,
   one per person who needs access.

### 1.3 Turn on the database (Firestore)

1. Left sidebar: **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** → pick any location close to you →
   **Enable**.

### 1.4 Get your config keys (Authentication + Firestore)

1. Click the **gear icon** (top left, next to "Project Overview") →
   **Project settings**.
2. Scroll down to **Your apps** → click the **`</>`** (web) icon.
3. Give it a nickname (e.g. "vault-web") → **Register app**. Skip the
   "Firebase Hosting" checkbox.
4. You'll see a code block that looks like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "my-vault-1234.firebaseapp.com",
     projectId: "my-vault-1234",
     storageBucket: "my-vault-1234.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
   **Keep this browser tab open** — you'll copy these values in the next
   phase.

> **Note on Firebase Storage**: this project does **not** use Firebase
> Storage for uploaded files, because Google now requires the paid Blaze
> plan just to enable it. Instead, uploads go to **Cloudinary** (free tier,
> no card required) — set up in the next section. Firestore is still used
> for the folder tree and file/link records, and that stays free.

## Phase 1B — Cloudinary setup (for file uploads)

1. Go to https://cloudinary.com/users/register/free and create a free
   account (no credit card needed).
2. Once logged in, your **Dashboard** page shows a **Cloud name** near the
   top — copy it.
3. Go to **Settings** (gear icon) → **Upload** tab.
4. Scroll to **Upload presets** → click **Add upload preset**.
5. Set:
   - **Signing Mode**: change it from "Signed" to **Unsigned** (this is
     required — it's what lets the browser upload directly without
     exposing any secret key).
   - Leave everything else default, or optionally set a **Folder** name
     like `vault` to keep things tidy in your Cloudinary media library.
6. Click **Save**. Copy the **preset name** it's given (or the custom name
   you set).
7. Open `src/cloudinary.js` in this project and fill in:
   ```js
   export const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
   export const CLOUDINARY_UPLOAD_PRESET = 'your-preset-name';
   ```

That's it — no server, no secret key in your code. The free tier gives you
~25 GB of combined storage/bandwidth per month, which resets monthly.

One limitation worth knowing: because the upload preset is unsigned (safe
for browser use), deleting a file in the Vault app removes it from your
folder view but does **not** delete the underlying file from Cloudinary —
proper deletion needs your Cloudinary API secret, which must never sit in
browser code. If you want actual deletion later, that needs a small
server-side function; ask if you want that built.

---

## Phase 2 — Run it on your computer

### 2.1 Install Node.js

If you don't already have it: go to https://nodejs.org, download the
**LTS** version, install it like any normal program. This gives you the
`node` and `npm` commands used below.

To check it worked, open a terminal (Command Prompt / PowerShell on
Windows, Terminal on Mac) and type:
```bash
node -v
npm -v
```
Both should print a version number, not an error.

### 2.2 Unzip the project

Unzip the `vault.zip` file you were given, anywhere you like (e.g. your
Desktop). You should see a folder called `vault` with files like
`package.json`, `src`, etc.

### 2.3 Open a terminal inside that folder

- **Windows**: open the `vault` folder in File Explorer, click the address
  bar, type `cmd`, hit Enter.
- **Mac**: right-click the `vault` folder → Services → New Terminal at
  Folder (or open Terminal and type `cd ` then drag the folder in).

### 2.4 Paste in your config

1. In the `vault` folder, open `src/firebase.js` in any text editor
   (Notepad, VS Code, etc.). Replace the placeholder values with the real
   ones from step 1.4. Save the file.
2. Open `src/cloudinary.js` and fill in your cloud name and upload preset
   from Phase 1B. Save the file.

### 2.5 Install and run

In the terminal you opened (still inside the `vault` folder), run:
```bash
npm install
```
Wait for it to finish (this downloads the pieces the project needs — only
needed once). Then run:
```bash
npm run dev
```
It will print something like:
```
Local:   http://localhost:5173/
```
Open that link in your browser. You should see the login screen. Log in
with the email/password you created in step 1.2 (adding a user).

If you see a blank page or an error, open the browser's console (press
F12 → Console tab) and check for a red error message — it usually says
exactly what's wrong (commonly: a typo in `firebase.js`, or Firestore/
Firestore not enabled yet, or rules not published).

Press `Ctrl+C` in the terminal any time to stop the local server.

---

## Phase 3 — Put it on GitHub (so it's live on the internet)

### 3.1 Create a GitHub account and a new repository

1. If you don't have one: https://github.com/join
2. Once logged in, click the **+** icon (top right) → **New repository**.
3. Name it something simple, e.g. `vault` (no spaces). Keep it **Public**
   (GitHub Pages needs this on free accounts). Don't check any of the
   "initialize with README" boxes. Click **Create repository**.
4. **Write down the exact repo name you chose** — you need it in the next
   step.

### 3.2 Set the correct base path

1. Open `vite.config.js` in the `vault` folder.
2. Find this line:
   ```js
   base: '/REPO_NAME/',
   ```
3. Replace `REPO_NAME` with your actual repo name from step 3.1. For
   example, if your repo is called `vault`, it should read:
   ```js
   base: '/vault/',
   ```
   (Keep the slashes exactly as shown.)
4. Save the file.

### 3.3 Upload your code to GitHub

Back in your terminal, inside the `vault` folder, run these one at a time:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```
Replace `YOUR-USERNAME` and `YOUR-REPO-NAME` with your actual GitHub
username and the repo name from step 3.1. GitHub may prompt you to log in
in a browser window — follow that prompt.

(If `git` isn't recognized, install it from https://git-scm.com/downloads
first, then repeat this step.)

### 3.4 Turn on GitHub Pages

1. On your repository's GitHub page, click **Settings** (top tab).
2. Left sidebar → **Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it — this repo already includes a workflow file
(`.github/workflows/deploy.yml`) that automatically builds and publishes
the site every time you push to the `main` branch. Since you just pushed in
step 3.3, it should already be running.

### 3.5 Check the deployment

1. Click the **Actions** tab on your repo. You should see a run in
   progress (or already finished with a green checkmark).
2. Once it's green, go back to **Settings → Pages** — it will show your
   live URL, something like:
   ```
   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
   ```
3. Open that link. You should see the login screen, live on the internet.

### 3.6 Making changes later

Any time you edit files and want the live site updated:
```bash
git add .
git commit -m "describe what you changed"
git push
```
The GitHub Action re-builds and re-publishes automatically within a minute
or two.

---

## Securing the database (important — do this too)

By default your Firestore rules already only allow signed-in users (the
ones you created in step 1.2, "adding a user") — this project includes a `firestore.rules`
file that enforces that. Firebase doesn't apply it automatically from a
zip file though — you need to publish it once. Easiest way, right in the
console:

1. Firebase console → **Build → Firestore Database** → click the **Rules**
   tab (next to "Data").
2. Delete whatever is in the box, and paste in the contents of
   `firestore.rules` from this project.
3. Click **Publish**.

Without this step, Firestore may default to fully locked (nothing works,
including your own app) or, if you started in test mode, fully open to
anyone on the internet — so don't skip it.

For your Cloudinary uploads: since the upload preset is unsigned, anyone
who discovers your cloud name + preset name could technically upload to
your account too (they can't read your existing files or your app's login,
just add new files to your Cloudinary media library). For a personal vault
this is a minor risk, but if you want to lock it down further later,
Cloudinary lets you add upload restrictions (file size/type limits, folder
restrictions) on the preset itself under Settings → Upload.

---

## Quick troubleshooting

- **Blank white page on the live GitHub Pages site**: almost always the
  `base` in `vite.config.js` doesn't exactly match your repo name. Double
  check step 3.2, then push again.
- **"Access denied" on login**: double-check the email/password you typed
  matches exactly what you created in Firebase Authentication → Users.
- **Blank page with a Firebase error in the console (F12)**: check
  `src/firebase.js` — a copy-paste mistake in the config values is the
  most common cause.
- **Uploads or folders don't appear**: usually means the Firestore rules
  weren't published yet (see the section above), or `src/firebase.js` /
  `src/cloudinary.js` still has placeholder values.
- **Upload button shows an error like "Cloudinary is not configured yet"**:
  you haven't filled in `src/cloudinary.js` with your real cloud name and
  preset name yet.
- **Upload fails with a Cloudinary error message**: double-check your
  upload preset is set to **Unsigned** (not Signed) in Cloudinary's
  Settings → Upload tab.
