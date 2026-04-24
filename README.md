# SWE Best Practices Pulse

Internal Next.js tool for assessing engineering maturity. Developers score 14 practices across five pillars on a 1-4 scale and receive a maturity label (0-48 raw score), weighted scores, and prioritized recommendations.

## Stack

- Next.js 16 (App Router, TypeScript strict)
- Plain CSS (no Tailwind)
- Auth.js (NextAuth v5) with Google provider
- Prisma ORM + Next.js API routes for persistence
- PostgreSQL (Neon on Vercel)

## Routes

| Route | Purpose |
| ----- | ------- |
| / | Redirects based on auth state |
| /login | Google sign-in page |
| /assessment | Individual or team-session voting form (auth required) |
| /dashboard | Personal results + owned team session reports (auth required) |

## Scoring Scale

Per-question scale: 1-4 (Foundational -> Strategic)
Raw score range: 0-48 (14 questions x 4 levels)

| Raw Score | Label | Meaning |
| --------- | ----- | ------- |
| 0-12 | Foundational | Base adherence, ad-hoc execution |
| 13-24 | Disciplined | Elite manual rigor, spec-driven development |
| 25-36 | Optimized | AI-assisted efficiency, intelligence curator |
| 37-48 | Strategic | Systemic influence, agentic orchestration |

## Getting Started

1. Install dependencies:

```bash
npm install
```

1. Configure environment variables:

```bash
cp .env.example .env
```

Required auth variables:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- AUTH_SECRET

1. Create the local database:

```bash
npm run prisma:migrate:dev
```

1. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev                 # development server
npm run build               # production build
npm run lint                # ESLint
npm test                    # unit tests (Vitest)
npm run test:watch          # tests in watch mode
npm run test:coverage       # coverage report
npm run prisma:generate     # generate Prisma client
npm run prisma:migrate:dev  # run local DB migrations
npm run prisma:migrate:deploy # run production DB migrations
```

## Deploying To Vercel

For production deploys, use a managed PostgreSQL database.

1. Set `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `AUTH_SECRET` in Vercel project environment variables.
2. Deploy normally with Vercel CLI or Git integration.

This repository includes `vercel.json` with:

```bash
npx prisma migrate deploy && npm run build
```

That ensures migrations run before the Next.js build in production.

## Project Structure

```text
prisma/
  schema.prisma
src/
  app/
    api/                    # Route handlers for submissions, drafts, last-result
  components/
    assessment/             # UI components
  data/                     # assessmentTemplate.ts
  lib/                      # scoring.ts, storage.ts, prisma.ts
  types/                    # assessment domain types
```

## Data Persistence

Prisma models:

- AssessmentSession: owner-created team voting sessions with shareable codes
- Submission: completed assessments
- Draft: in-progress answers by email and session key
- LastResult: latest result snapshot by email and session key

Session owners can create and delete their own AssessmentSession records from the dashboard.

All assessment data is scoped to the authenticated session email on the server.
Client components should use src/lib/storage.ts. Do not call Prisma directly from client-side code.

## Validate

```bash
npm run lint
npm test
npm run build
```

## Where To Customize Content

- Questions, categories, weights, recommendations: src/data/assessmentTemplate.ts
- Domain types: src/types/assessment.ts
- Scoring logic: src/lib/scoring.ts
- Agent/contributor rules: AGENTS.md

## Future Proposals

- **Cross-team comparison view** — an admin-only page that loads all `AssessmentSession` records, runs `buildTeamStats()` per session, and renders a side-by-side maturity comparison across teams. The data model already supports this; only a protected `/api/admin/sessions` endpoint and a comparison UI are needed.
- **Session invite by email** — let owners invite specific users to a session instead of sharing a public link.
- **Historical trend charts** — plot a team's average score over time when a session is run repeatedly.
