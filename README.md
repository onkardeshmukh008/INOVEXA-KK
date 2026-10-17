# SkillTrace.ai — Upskill Your Skills with AI

SkillTrace.ai is an AI-powered career development platform that helps students and developers understand their technical strengths, identify skill gaps, and improve readiness for real-world roles. It compares job requirements with resume information and evidence available in connected GitHub repositories.

## Key Features

- AI-assisted resume parsing and career assessment
- Job description analysis and skill matching
- GitHub repository inspection and code-based skill evidence
- Skill-gap identification and personalized action plans
- Repository update checks, reassessment, and change history

The platform aims to go beyond resume keyword matching by presenting source references when evidence can be validated. Repository access does not establish personal authorship, and AI assessments should be reviewed by a human.

## Project Structure

```text
INOVEXA-KK/
├── api/                 # Vercel serverless API entry
├── server/              # AI, GitHub, and state services
├── src/
│   ├── components/
│   ├── pages/
│   ├── types/
│   ├── App.tsx
│   ├── api.ts
│   └── main.tsx
├── test/
├── dev-server.ts        # Local Express + Vite development server
├── server.ts            # Shared API application and handlers
├── index.html
├── package.json
└── vite.config.ts
```

## Local Development

**Prerequisite:** Node.js.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a local `.env` file based on `.env.example`. Set `GEMINI_API_KEY` to your Gemini API key. Keep it server-side; do not use a `VITE_`-prefixed variable.
3. Start the development server:

   ```sh
   npm run dev
   ```

By default, local development stores application state in `data/app_state.json`. To use PostgreSQL locally instead, set `POSTGRES_URL` to a pooled PostgreSQL connection URL.

## Vercel Deployment

The frontend is built with Vite, and the existing Express API is exported through a Vercel serverless function for `/api/*` requests. Configure these environment variables in the Vercel project:

- `GEMINI_API_KEY` — required for Gemini-powered resume parsing, job extraction, and assessments. This is read only by server-side code.
- `POSTGRES_URL` — required for durable state on Vercel. Connect a Neon database through the Vercel Marketplace and use its pooled connection URL. `DATABASE_URL` is also accepted if that is the variable name provided by the database integration.

The API creates its `skilltrace_app_state` table automatically on first use. Local `data/app_state.json` contents are not migrated automatically; migrate them separately if they must be retained. The API handler accepts JSON bodies up to 4 MB; base64 encoding means the maximum raw resume-file size is lower.

## Build, Type-Check, and Tests

```sh
npm run build
npm run lint
npm test
```

## Responsible Use and Limitations

- Repository analysis may examine selected files rather than a complete codebase.
- GitHub API rate limits, network issues, inaccessible repositories, and missing files can affect results.
- AI assessments can be incomplete or inaccurate and require human review.
- Evidence is only as reliable as the source references and content that can be validated.
- Repository access does not prove that a candidate personally authored code.
- The prototype login is not production-grade authentication or user isolation.
- Career-readiness scores are indicative and do not guarantee employment.

Vercel state is stored in the configured PostgreSQL database; the local JSON-file store is for local development and is not durable serverless storage.
