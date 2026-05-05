# Technical Reference — SWE Best Practices Pulse

Engineering guide for running, developing, and deploying the application.  
For product context and scoring definition see [PRODUCT.md](PRODUCT.md).

## Stack

- Next.js 16 (App Router, TypeScript strict)
- Plain CSS (no Tailwind)
- Auth.js (NextAuth v5) with Google provider
- Prisma ORM + Next.js API routes for persistence
- PostgreSQL (Neon on Vercel)
- React Markdown for rendering maintainable content from versioned `.md` files

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
- ADMIN_EMAILS

`ADMIN_EMAILS` should be a comma-separated list of user emails allowed to access the `/admin` route.

Optional configuration variables:

- `NEXT_PUBLIC_MAX_RECOMMENDATIONS` (default: 1) — Number of action items to display per pillar in assessment results and team reports. Use `NEXT_PUBLIC_` prefix to make it accessible on the client.

## Content-driven AI Tooling View

- Route: `/tooling`
- Source of truth: `content/tooling.md`
- Loader/parser: `src/lib/toolingContent.ts`
- Rendering: server-side page in `src/app/tooling/page.tsx` using `react-markdown`

The markdown file is intentionally grouped by `## Pillar ...` headings. Inside each pillar, use `###` for a playbook entry and `#### Do this`, `#### Why this works`, and `#### How to` for the colored guidance blocks. The parser keeps intro content separate and turns each pillar heading into a standalone section card so content editors can add or reorder guidance without touching React code.

1. Start local PostgreSQL with Docker:

```bash
docker run --name swe-postgres \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=swe_dev \
  -p 5432:5432 \
  -d postgres:16
```

Set `DATABASE_URL` in `.env` to:

```bash
DATABASE_URL="postgresql://postgres:secret@localhost:5432/swe_dev"
```

1. Create/update the local database schema:

```bash
npm run prisma:migrate:dev
```

1. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local Docker Workflow

Start database container:

```bash
docker start swe-postgres
```

Stop database container:

```bash
docker stop swe-postgres
```

Remove database container (cleanup):

```bash
docker rm -f swe-postgres
```

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
2. Set `ADMIN_EMAILS` in Vercel if you want to enable the admin comparison page.
3. Deploy normally with Vercel CLI or Git integration.

This repository includes `vercel.json` with:

```bash
npx prisma migrate deploy && npm run build
```

That ensures migrations run before the Next.js build in production.

## Architecture

```mermaid
graph TD
    Browser["Browser (Client Components)"]
    Auth["Auth.js / Google OAuth"]
    API["Next.js API Routes (/api/*)"]
    Storage["src/lib/storage.ts (API client wrapper)"]
    Scoring["src/lib/scoring.ts (pure scoring)"]
    Prisma["src/lib/prisma.ts (singleton)"]
    DB[("PostgreSQL / SQLite")]
    Template["src/data/assessmentTemplate.ts"]
    Types["src/types/assessment.ts"]

    Browser -- "fetch via" --> Storage
    Storage -- "HTTP" --> API
    API -- "auth guard" --> Auth
    API -- "ORM queries" --> Prisma
    Prisma --> DB
    Browser -- "imports" --> Template
    Browser -- "imports" --> Scoring
    Template -- "typed by" --> Types
    Scoring -- "typed by" --> Types
```

> **Key invariants**
>
> - `scoring.ts` is pure — no browser or server APIs
> - `prisma.ts` owns the singleton Prisma client
> - `storage.ts` is the only client-side API caller — never query Prisma from components

## Project Structure

```text
prisma/
  schema.prisma
src/
  app/
    admin/                  # Admin-only cross-team comparison page
    api/                    # Route handlers for submissions, sessions
  components/
    assessment/             # UI components
  data/                     # assessmentTemplate.ts
  lib/                      # scoring.ts, storage.ts, prisma.ts
  types/                    # assessment domain types
```

## Data Persistence

Prisma models:

- `AssessmentSession` — owner-created team voting sessions with shareable codes
- `Submission` — completed assessments with full answer history

Session owners can create and delete their own `AssessmentSession` records from the dashboard.
Configured admins can access `/admin` to compare all sessions and inspect database-wide activity counts.
The admin report supports `from`, `to`, `sort`, and `page` query params for date filtering, ordering, and pagination. Team drilldown uses `/admin/team/[code]` and preserves active report filters in the URL for return navigation.

`Submission` also stores denormalized metrics (`totalScore`, `maxScore`, `completion`, `maturityLabel`) to support more efficient reporting and future DB-level aggregations.

All assessment data is scoped to the authenticated session email on the server.
Client components should use `src/lib/storage.ts`. Do not call Prisma directly from client-side code.

## Validate

Run all three CI gates before opening a PR:

```bash
npm run lint
npm test
npm run build
```

## Where To Customize Content

| What | File |
| ---- | ---- |
| Questions, categories, weights, recommendations | `src/data/assessmentTemplate.ts` |
| Domain types | `src/types/assessment.ts` |
| Scoring logic | `src/lib/scoring.ts` |
| Reference prompt templates | `prompts/` |
| Agent / contributor rules | `AGENTS.md` |
