# AGENTS.md — SWE Best Practices Pulse

AI agent and coding assistant instructions for this repository.

## Project Overview

**SWE Best Practices Pulse** is a Next.js 16 internal tool for self-assessing engineering practices across five pillars. Developers score 16 practices on a 1–4 scale (16 questions × 4 levels = 0–64 raw score) and receive score levels, weighted pillar scores, and prioritized recommendations.

- **Stack:** Next.js 16 (App Router), TypeScript 5 strict, plain CSS, no Tailwind
- **State:** Prisma + SQLite/Postgres via Next.js Route Handlers (`/api/*`)
- **Routes:** `/` → redirect, `/assessment` (form), `/dashboard` (results)

## Architecture

```
src/
├── app/               # Next.js App Router pages + globals.css
│   └── api/           # Route handlers for submissions, sessions
├── components/
│   └── assessment/    # All UI components (client-only, "use client")
├── data/              # assessmentTemplate.ts — questions, pillars, recommendations
├── lib/               # scoring.ts (pure), storage.ts (API client), prisma.ts (singleton client)
└── types/             # assessment.ts — canonical domain types
```

**Key invariant:** `src/lib/scoring.ts` is a pure function — never import browser APIs there.  
**Key invariant:** `src/lib/prisma.ts` owns the singleton Prisma client for server/runtime safety.  
**Key invariant:** `src/lib/storage.ts` is a client API wrapper around `/api/*` and must not read/write browser storage directly.

## Code Style

- TypeScript strict mode — no `any`, no `@ts-ignore`
- All React components are `"use client"` — this project has no Server Components with state
- CSS is in `src/app/globals.css` using CSS variables (`--brand-primary`, `--text`, `--bg-soft`, etc.)
- No Tailwind, no CSS-in-JS, no component libraries
- Use `clamp()` for responsive sizing; breakpoints at 768px, 540px, 480px
- Fonts: `var(--font-heading)` = Space Grotesk, `var(--font-mono)` = IBM Plex Mono

## Scoring Domain

- `ScoreValue = 1 | 2 | 3 | 4` — never use raw numbers outside this union
- **Per-question:** 1 = Foundational, 2 = Disciplined, 3 = Optimized, 4 = Strategic
- **Raw score range:** 0–64 (16 questions × 4 levels)
- **Score thresholds:** `<13` Foundational · `13–24` Disciplined · `25–36` Optimized · `≥37` Strategic
- `calculateAssessment(model, answers)` returns an `AssessmentResult` — the single source of truth for all scores
- **Per-pillar recommendations:** Each pillar shows action items (default: 1 per pillar) — the most relevant next-level recommendations based on current score. Configure via `NEXT_PUBLIC_MAX_RECOMMENDATIONS` environment variable in `src/lib/config.ts`.

## Persistence

Prisma models (see `prisma/schema.prisma`):

| Model | Contents |
| ----- | -------- |
| `Submission` | Completed assessments (`email`, `answers`, `result`, `submittedAt`) |
| `AssessmentSession` | Team sessions for group assessments |

Never query Prisma directly from client components — use `src/lib/storage.ts` and `/api/*` route handlers.

## Build & Test

```bash
npm install          # install dependencies
npm run prisma:migrate:dev # create/update local database schema
npm run dev          # start dev server on http://localhost:3000
npm run build        # production build (must pass before any PR)
npm run lint         # ESLint (must return 0 errors before any PR)
npm test             # run unit tests with Vitest
npm run test:watch   # Vitest in watch mode
npm run test:coverage # coverage report (HTML in coverage/)
```

**CI gates:** `lint` → `test` → `build` — all three must pass.

## Feature Delivery Requirements (Agents)

When a user asks to develop a new feature, agents must deliver all of the following in the same task unless explicitly told otherwise:

1. Implement the feature code using existing architecture and conventions.
2. Add or update unit tests that cover the new behavior and critical edge cases.
3. Update documentation to reflect the change (at minimum, relevant sections in `PRODUCT.md` for product changes or `TECHNICAL.md` for engineering changes; update `AGENTS.md` too if repository rules or workflows changed).

Before finishing feature work, run validation gates:

- `npm run lint`
- `npm test`
- `npm run build`

If any required item cannot be completed (for example, missing testability in legacy code), the agent must state exactly what is missing and why.

## Testing Conventions

- Tests live in `src/lib/__tests__/` alongside the code they test
- Use Vitest globals (`describe`, `it`, `expect`, `beforeEach`) — no imports needed for them
- Mock `fetch` in storage tests (`src/lib/storage.ts` is API-based)
- Keep team stats logic tested via pure helper (`buildTeamStats`)
- Test pure logic (scoring) separately from storage side-effects
- Aim for branch coverage on all scoring thresholds and edge cases

## Adding Questions or Pillars

1. Edit `src/data/assessmentTemplate.ts`
2. Add questions with unique `id` (`p{n}-q{n}` convention)
3. Add at least one `Recommendation` per score band (`maxScoreInclusive: 12 | 24 | 36`)
4. Hints must follow the format: `"1 = foundational text · 2 = disciplined text · 3 = optimized text · 4 = strategic text"` — parsed into colored bullets by `HintToggle`
5. Keep `weight` values summing to 1.0 across all categories
6. Run `npm test && npm run build` to confirm nothing regressed

## Repository Analysis Prompt

The project includes an automated repository analysis prompt (`prompts/repo-analysis.md`) that allows engineers to score their repositories without manual input. The prompt analyzes observable signals (commit history, test coverage, CI/CD configuration, documentation, code organization) and generates a score.

### Maintaining the Prompt

1. **Scoring rules must stay in sync with `src/lib/scoring.ts`:**
   - Score thresholds in the prompt must match `getScoreLevel()` thresholds
   - Pillar-scoring logic must align with `calculateAssessment()` logic
   - When scoring logic changes, update the prompt immediately

2. **Pillar definitions:**
   - Prompt defines 5 pillars with 2-3 questions each (14 total)
   - Questions and scoring rubrics must match `src/data/assessmentTemplate.ts` intent
   - Each question has a 1–4 scale with rubrics describing each level

3. **JSON output format:**
   - Prompt generates a JSON object with `email`, `analysis`, `raw_score`, `score_level`
   - This JSON is submitted via POST to `/api/submissions/analysis`
   - The backend creates a `Submission` record with parsed data

4. **Frontend integration:**
   - `RepositoryAnalysisSubmission` component handles JSON input and submission
   - Validation occurs on both client (format check) and server (payload validation)
   - Results are stored identically to questionnaire submissions for unified reporting

## Common Gotchas

- **Don't add `"use client"` to `src/lib/*.ts`** — they're plain TypeScript modules
- **Don't instantiate `PrismaClient` in multiple files** — use `src/lib/prisma.ts`
- **Don't call Prisma from client components** — use `/api/*` route handlers
- **Don't use `0–3` scale** — the scale is `1–4`; `ScoreValue` enforces this
- **Don't use normalized scores** — use raw 0–48 scale for thresholds and score levels
- **`AssessmentApp.tsx` is a legacy entry point** — the active form is `AssessmentForm.tsx`
- **`vitest.config.ts`** sets the `@` path alias to `src/` — use `@/lib/...` in imports
