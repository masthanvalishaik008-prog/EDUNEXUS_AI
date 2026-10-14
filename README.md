# EduNexus AI

EduNexus AI is a student success and placement-readiness dashboard. It brings academic progress, attendance, learning activity, engagement, feedback, and career preparation into one place so students and faculty can identify strengths and decide what to work on next.

## What it does

- Shows an executive dashboard and 360-degree student profiles.
- Tracks early-support alerts, mentoring interventions, engagement, and feedback.
- Helps students explore growth plans and placement readiness.
- Provides AI-generated student insight reports and an academic chatbot using the Gemini API.
- Includes data governance views and CSV import/export workflows.
- Supports student and faculty experiences, including guest access and Google sign-in.

## Built with

- React, TypeScript, Vite, and Tailwind CSS
- Express and Node.js
- Firebase Authentication and Cloud Firestore
- Google Gemini API

## Run locally

### Requirements

- Node.js (LTS recommended)
- npm
- A Gemini API key for Gemini-powered features

### Install and start

```powershell
npm install
Copy-Item .env.example .env
```

Open `.env` and replace `MY_GEMINI_API_KEY` with your Gemini API key. Then start the app:

```powershell
npm run dev
```

Open the local URL printed in the terminal (usually `http://localhost:3000`).

The server starts the Vite development app and provides the backend API. Without a valid Gemini API key, Gemini-powered features will not work as expected.

## Firebase

The frontend initializes Firebase using [`firebase-applet-config.json`](./firebase-applet-config.json). To use your own Firebase project, replace that configuration with your project's web app settings, enable the sign-in providers you intend to use, and configure Firestore.

Review [`firestore.rules`](./firestore.rules) and tighten its access controls for your application before deploying any rules or using real student data. The rules in this repository are not a production security policy.

## Build and check

```powershell
npm run lint
npm run build
```

To preview a production build locally:

```powershell
npm run preview
```

## Deploy (Vercel + Render)

The Vercel project serves the Vite frontend. Its `/api/*` rewrite forwards API requests to the Express service on Render.

1. Push this repository to GitHub, then import it into Vercel as a new project. Use the repository root as the project root, `npm install` as the install command, `npm run build` as the build command, and `dist` as the output directory. Add no Gemini key to Vercel; it belongs on the backend only.
2. In Render, create a new **Blueprint** and select this repository. Render will use [`render.yaml`](./render.yaml) to create the `edunexus-ai-api` web service. Set `GEMINI_API_KEY` in the service's environment settings when prompted.
3. Confirm the Render service is live and its `/api/health` endpoint returns `{"status":"ok"}`.
4. The Vercel rewrite in [`vercel.json`](./vercel.json) targets `https://edunexus-ai-api.onrender.com`. If Render assigns a different service URL, update that destination to the actual Render URL and push the change to GitHub so Vercel redeploys.
5. Set the authorized domain for Firebase Authentication to your Vercel domain. Confirm the Firebase web configuration and Firestore rules are appropriate for your deployment before using real student data.

The Render free plan may spin down when idle, so the first API request after inactivity can take longer while the service wakes up.

## Data and privacy

This repository is a project/demo starter, not a production student-record system. Use synthetic data while developing. Do not add personal student records, credentials, or API keys to Git. Keep secrets in your local `.env` file, which is excluded from version control.
