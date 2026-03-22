# Workout Plan Builder

A small [Next.js](https://nextjs.org/) app that asks a few questions (gender, age, days per week, session length, equipment, goals), then generates a starter workout plan. Data is stored only in the visitor’s browser (`localStorage`). Deploy it free on [Vercel](https://vercel.com/) from a [GitHub](https://github.com/) repo.

---

## Run it on your computer

1. **Install Node.js** (LTS) from [https://nodejs.org](https://nodejs.org) if you don’t have it. That gives you `node` and `npm`.
2. Open a terminal in this folder (`workout_plan`).
3. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

To confirm the production build works (same command Vercel runs):

```bash
npm run build
```

---

## Put the code on GitHub (first time)

You already have a GitHub account. This turns the project folder into a Git repository and uploads it.

### 1. Install Git (if needed)

- Download from [https://git-scm.com/download/win](https://git-scm.com/download/win) and install with the default options.

### 2. Create an empty repository on GitHub

1. Log in at [https://github.com](https://github.com).
2. Click the **+** menu (top right) → **New repository**.
3. Name it (e.g. `workout-plan`).
4. Leave it **Public** (fine for a free Vercel hobby site).
5. **Do not** add a README, `.gitignore`, or license (this project already has those files).
6. Click **Create repository**.

GitHub will show you commands; you can ignore them and use the steps below.

### 3. Initialize Git in this folder and push

In **PowerShell** or **Command Prompt**, run these commands **from your project folder** (adjust the path if yours differs):

```bash
cd C:\Users\curti\Documents\cursor_projects\workout_plan
git init
git add .
git commit -m "Initial workout plan app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and the repo name you created.

- If Git asks you to log in, follow the prompts (GitHub often uses a **personal access token** instead of a password for HTTPS).
- After this succeeds, refresh the repo page on GitHub; you should see all project files.

---

## Deploy on Vercel (first time)

You already have a Vercel account. Vercel will build from GitHub on every push.

### 1. Import the GitHub repository

1. Log in at [https://vercel.com](https://vercel.com).
2. Click **Add New…** → **Project** (or **Import Project**).
3. When asked to **Import Git Repository**, find **GitHub** and **Connect** if you haven’t already. Approve access so Vercel can see your repos.
4. Pick the repository you just pushed (`workout-plan` or whatever you named it).
5. Vercel should detect **Next.js** automatically. You do **not** need to add environment variables for this app.

### 2. Deploy

1. Click **Deploy** and wait for the build to finish (a minute or two).
2. When it’s done, Vercel shows a **production URL** like `https://workout-plan-xxx.vercel.app`.

**Anyone with that link can open your site.** You don’t need to “make it public” beyond using the normal production deployment. (Avoid turning on **Deployment Protection** for production if you want strangers to use it without logging in.)

### 3. Later: update the live site

Whenever you change the code:

```bash
git add .
git commit -m "Describe your change"
git push
```

Vercel will build and deploy the new version automatically.

### Optional: custom domain

In the Vercel project: **Settings** → **Domains** → add a domain you own and follow the DNS instructions from your domain registrar.

---

## What this app does

- **First visit:** questionnaire → generated program → opens the editor for that program.
- **Home:** lists programs; open, delete, or run **New questionnaire** to generate another plan (saved answers update; old programs stay unless you delete them).
- **Reset everything** clears saved answers and all programs on that browser only.

---

## Disclaimer

Generated workouts are for general fitness only, not medical advice.
