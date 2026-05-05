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

## Repository Analysis (Alternative Assessment Method)

In addition to the manual questionnaire, engineers can use an automated repository analysis prompt to score their projects. This method analyzes observable signals from a repository—commit history, CI/CD configuration, test coverage, documentation, and code organization—to determine a maturity score.

### How It Works

1. **Get the prompt**: The analysis prompt is located in `prompts/repo-analysis.md`
2. **Run the prompt**: Copy the prompt and paste it into your AI assistant (ChatGPT, Claude, etc.)
3. **Provide repository context**: Share your repository's:
   - Directory structure (output of `ls -la` and `tree -L 2`)
   - Recent commits (output of `git log --oneline -50`)
   - CI/CD configuration (`.github/workflows/*.yml`, `.gitlab-ci.yml`, etc.)
   - Test framework and coverage info
   - README and architecture documentation
   - Package/dependency files
4. **Get analysis**: The AI will analyze the signals and generate a JSON object with:
   - Individual question scores (1-4 per question)
   - Pillar scores
   - Raw score (0-48)
   - Maturity level (Foundational/Disciplined/Optimized/Strategic)
   - Key strengths and weaknesses
   - Prioritized recommendations
5. **Submit to dashboard**: Go to `/assessment` → "Repository Analysis" section → paste the JSON → submit
6. **Track progress**: Results appear on your dashboard alongside questionnaire submissions

### Advantages

- **No manual effort**: Analysis happens automatically based on repository signals
- **Language-agnostic**: Works with repositories in any programming language
- **Objective**: Scores reflect actual practices, not self-reported perceptions
- **Repeatable**: Run quarterly to measure improvement over time
- **Actionable**: Recommendations are specific to your repository's maturity level

### Scoring Basis

The prompt analyzes:

- **Commit message quality and frequency** (Ideation & Requirements)
- **Code review discipline and automation** (Code & Delivery)
- **Test coverage and CI/CD reliability** (Testing & Quality)
- **README, architecture docs, and onboarding materials** (Documentation & Knowledge)
- **Monitoring, incident response processes** (Operations & Process)

Results are stored identically to questionnaire submissions, so you can compare both methods and track progress over time.

## Future Proposals

- Session invite by email: let owners invite specific users to a session instead of sharing a public link.
- Historical trend charts: plot a team's average score over time when a session is run repeatedly.
