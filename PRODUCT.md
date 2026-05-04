# Product Reference - SWE Best Practices Pulse

Product definition and scoring model for the assessment experience.

## Product Overview

Internal tool for self-assessing engineering maturity across five pillars. Developers score 14 practices on a 1-4 scale and receive a maturity label, weighted pillar scores, and prioritized recommendations.

## What It Measures

Five pillars, each with 2-3 questions scored 1 (Foundational) to 4 (Strategic):

| Pillar | Focus |
| ------ | ----- |
| 1 - Ideation and Requirements | Intent Engineering: how rigorously requirements are captured, structured, and traced |
| 2 - Design and Architecture | Systematic Planning: solution design, pattern reuse, and security assessment |
| 3 - Development | Implementation Hygiene: clean, traceable, well-documented code changes |
| 4 - Quality Engineering | Validation and Reliability: testing thoroughness, audit practices, regression protection |
| 5 - Operations and Maintenance | Observability: debuggability, handoff readiness, and operational context |

## Scoring Scale

Per-question scale: 1-4 (Foundational to Strategic)  
Raw score range: 0-48 (14 questions x 4 levels)

| Raw Score | Label | Meaning |
| --------- | ----- | ------- |
| 0-12 | Foundational | Base adherence, ad-hoc execution |
| 13-24 | Disciplined | Elite manual rigor, spec-driven development |
| 25-36 | Optimized | AI-assisted efficiency, intelligence curator |
| 37-48 | Strategic | Systemic influence, agentic orchestration |

## Routes

| Route | Purpose |
| ----- | ------- |
| / | Redirects based on auth state |
| /login | Google sign-in page |
| /assessment | Individual or team-session voting form (auth required) |
| /dashboard | Personal results plus owned team session reports (auth required) |
| /tooling | Markdown-backed engineering playbook organized by pillar (auth required) |
| /admin | Admin-only cross-team comparison plus database activity stats (auth required) |

Team session reports include one prioritized action item per pillar, selected based on the team's average results and relevance to their current maturity level. The action item shown is the next achievable improvement goal.
Dashboard session cards show each session's creation date, and the create-session field guides naming with the `Team - Quarter` pattern.
Draft answers are stored locally in the browser (localStorage) until the assessment is submitted.
The admin page shows database-level counts for assessments, sessions, saved results, unique participants, and session owners.
It also compares team sessions side by side using average score, maturity label, participation, completion, and per-pillar averages.
Admins can filter and sort reports by session creation dates, paginate large cross-team reports, then open a dedicated team detail view with a back-to-report action to inspect submission history and running score evolution over time.
The playbook is maintained in `content/tooling.md` and rendered into pillar sections so content can evolve without UI changes. Each pillar can include practice cards with `Do this`, `Why this works`, and `How to` guidance, including both AI-assisted and non-AI workflows.

## Future Proposals

- Session invite by email: let owners invite specific users to a session instead of sharing a public link.
- Historical trend charts: plot a team's average score over time when a session is run repeatedly.
