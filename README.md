<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2c6cd453-e551-40ca-9c10-d95c5d588b54

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in `.env.local` to your Gemini API key. Keep it server-side; do not use a `VITE_`-prefixed variable.
3. Run the app:
   `npm run dev`

Local development stores application state in `data/app_state.json`. To use Postgres locally instead, set `POSTGRES_URL` to a pooled PostgreSQL connection URL.

## Deploy to Vercel

The Vite frontend is built as a static site and the existing Express API is exported as a Vercel serverless function for all `/api/*` paths. Configure these project environment variables in Vercel:

- `GEMINI_API_KEY` — required for Gemini-powered resume parsing, job extraction, and assessments. This is read only by server code.
- `POSTGRES_URL` — required for durable state. Connect a Neon database through the Vercel Marketplace and use its pooled connection URL. `DATABASE_URL` is also accepted if that is the variable name provided by your database integration.

The API creates its `skilltrace_app_state` table automatically on first use. Existing local data in `data/app_state.json` is not copied automatically; migrate it separately if it must be retained. The Vercel API handler accepts JSON bodies up to 4 MB; because resume files are base64-encoded in JSON, the maximum raw file size is lower.
