# Best Practices Execution Playbook

This playbook turns assessment recommendations into practical team habits. Use it when you want concrete next steps for any of the five engineering practice pillars. Content is organized by pillar so the dashboard can link recommendations to the right section. Prefer durable engineering practices over tool-specific tricks.

## Pillar 1 - Ideation & Requirements

Clarify the work before code is written.

### Start from clarified intent

Treat the first summary, prompt output, or verbal request as a draft that still needs engineering judgment.

#### Do this

Challenge the first framing of the task before you implement it. Rewrite the request into a ticket with `Why`, `What`, acceptance criteria, and explicit unknowns.

#### Why this works

Most delivery mistakes start before coding: vague scope, hidden assumptions, and missing impact analysis. Teams that force clarity early avoid churn later, regardless of whether the first draft came from a PM, a teammate, or an AI assistant.

#### How to

Rewrite the raw request into a structured ticket with `Why`, `What`, and `Acceptance Criteria` before touching code. Use an AI assistant to turn a vague request or Slack thread into a first-draft ticket, then review and correct each section before adopting it.

Ask a teammate to challenge your assumptions before implementation starts, especially for new integrations or ambiguous scope. Every meaningful task needs three sections: `Why`, `What`, and `Acceptance Criteria`.

Project reference: `prompts/gherkin.md`

**Prompt template: Structured ticket**

```text
Convert the request below into an implementation-ready ticket.

Request: "Add a rate limit to the public login endpoint so the same IP
          cannot attempt more than 5 logins per minute."

1. Why: [what problem does this solve and who is harmed without it?]
2. What: [what changes at a high level? e.g. new middleware, config flag, response header]
3. Acceptance criteria:
   Given [precondition]
   When  [action]
   Then  [expected result]
   (add one scenario per distinct behavior)
4. Open questions: [e.g. Should we return 429 or silently delay? Where is the counter stored?]
5. Impact: [which services, endpoints, or teams need to know?]

Replace the example request above with your own and fill every section.
```

## Pillar 2 - Design & Architecture

Make the intended design visible before implementation locks it in.

### Make the design reviewable

Use the playbook to force architecture decisions into a visible artifact, even if the first draft is just a sketch.

#### Do this

Create a small design artifact before coding: a diagram, an ADR stub, or a written decision note with tradeoffs and security implications.

#### Why this works

Design issues are cheap to catch when the solution is still abstract. Visibility helps reviewers challenge assumptions about boundaries, reuse, auth, and failure modes before the team spends effort implementing the wrong thing.

#### How to

Before coding, produce a small design artifact: a diagram, an ADR stub, or a written decision note. Even a rough sketch is enough to get meaningful review. Use an AI assistant to draft an ADR, enumerate alternatives, or surface missing security considerations, then validate the output against the actual codebase and your team's standards.

In the artifact, explicitly state one security risk and at least one alternative you rejected and why. For changes touching data flow, APIs, or auth, a diagram or ADR note is required before merge.

Good artifact contents: context, decision, alternatives considered, tradeoffs, rollout notes, and one explicit security risk.

**Prompt template: Architecture decision record**

```text
I need to decide how to store user sessions for a new authentication flow.
The two main options are a Redis-backed session store and stateless JWTs.
The app runs on multiple Node.js instances behind a load balancer.
Security requirements: tokens must be revocable immediately on logout.

Fill out the following ADR for this decision:

Context:      [describe the situation that forces this decision]
Decision:     [which option and why, in one sentence]
Alternatives: [other options you considered and why you ruled each out]
Tradeoffs:    [what you gain and what you give up]
Security:     [the main risk and how you will mitigate it]
Rollout:      [migration steps, feature flags, or phased delivery if needed]

Replace the session-store example with your own decision and fill every field.
```

## Pillar 3 - Development Hygiene

Keep implementation changes small enough that intent stays visible in code review.

### Optimize for reviewability

Use AI only as an accelerator for mechanical work, not as a substitute for PR structure or code ownership decisions.

#### Do this

Split broad changes into reviewable slices with a single clear objective per PR, and keep docs updates coupled to the behavior they describe.

#### Why this works

Large undifferentiated PRs hide risk. When changes are sliced by responsibility, reviewers can reason about naming, architecture, and regression risk instead of scanning noise. This improves quality even on teams that never use AI.

#### How to

Outline the PR sequence in the ticket or PR description before coding: which slice goes first, what stays out of scope, what follows. Use an AI assistant to propose how to split a broad change into reviewable PRs, then validate the boundaries yourself so refactors, behavior changes, and docs updates stay coherent.

Defer unrelated fixes to follow-up tickets rather than bundling them in. Each PR should answer one question clearly: refactor, new behavior, or documentation alignment. If the PR summary needs multiple paragraphs to explain scope, the slice is probably too large.

**Prompt template: PR sequence plan**

```text
I need to add Google OAuth login to a Next.js app that currently uses
email/password auth. The work touches the auth middleware, the login
page UI, the session cookie logic, and the user profile endpoint.

Break this into the smallest reviewable PR sequence. For each PR:
- Objective: what does this PR do and nothing else?
- Key files: which files or modules change?
- Tests: what needs to be added or updated?
- Out of scope: what explicitly waits for the next PR?

Replace the OAuth example with your own feature and answer each field.
```

### Build reliable CI/CD pipelines

Automate the path from code to production so every delivery is consistent, safe, and reversible.

#### Do this

Set up a CI pipeline that runs builds, tests, linting, and security checks automatically on every pull request. Add a deployment stage with environment promotion and rollback capabilities.

#### Why this works

Manual deployments and local-only testing introduce inconsistency and risk. A well-structured CI/CD pipeline catches problems early, enforces shared quality standards, and makes rollbacks predictable, reducing the cost of every release.

#### How to

Start with a minimal workflow that runs tests on every PR, then incrementally add linting, security scans, and deployment stages. Use an AI assistant to generate a pipeline config as a starting point, then review every step for correctness, security gaps, and coverage before committing it.

Block merges when CI fails and treat a broken pipeline as a production incident. Pipeline changes go through the same review process as application code. Useful additions include environment-specific secrets management, deployment gates between staging and production, and automated smoke tests post-deploy.

**Prompt template: Pipeline review**

```text
Review the GitHub Actions workflow below for a Node.js API service.
Identify problems and suggest concrete improvements.

Current workflow:
  on: [push]
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - run: npm install
        - run: npm test
        - run: npm run deploy

For each finding, explain:
- What is the gap or risk?
- What is the concrete fix (show the corrected YAML step if relevant)?
- What gate or check is missing that would catch real problems?

Replace the example workflow with your own and apply the same review.
```

### Enforce data integrity across services

Treat data consistency as a design constraint, not an afterthought.

#### Do this

Define validation rules at every system boundary, use transactional logic for related writes, and add constraints at the database level. Document what guarantees each service provides and what it assumes from its inputs.

#### Why this works

Data integrity issues compound over time. Inconsistent records and silent corruption are hard to detect and expensive to recover from. Teams that design for correctness at the boundary, with clear contracts, validation, and observability, prevent entire categories of bugs from reaching production.

#### How to

Design validation rules at every boundary you own: API inputs, service contracts, and DB constraints, as part of the feature design, not as an afterthought. Use an AI assistant to review an API schema or data model for missing constraints, edge cases, or unvalidated fields, then evaluate each suggestion against actual business rules before applying it.

Treat any unvalidated input reaching business logic as a defect and enforce it in code review. Good evidence of strong integrity practice: input validation at the API boundary, constraints in the DB schema, transactional writes for multi-step operations, and at least one test for an invalid-input scenario.

**Prompt template: Data integrity review**

```text
Review this Prisma schema for a payments service and identify integrity gaps.

model Payment {
  id        String   @id @default(cuid())
  userId    String
  amount    Float
  currency  String
  status    String
  createdAt DateTime @default(now())
}

For each gap found:
- Which field or operation is the problem?
- What could go wrong in production? (give a concrete scenario)
- What is the recommended fix? (constraint, validation rule, or transaction boundary)

Also note: which multi-step operations need a transaction, and where would
you add an alert or monitor to catch data anomalies early?

Replace the Payment model with your own schema and apply the same review.
```

## Pillar 4 - Quality Engineering

Test the parts most likely to fail, not only the path most likely to demo well.

### Expand beyond the happy path

Use the playbook to expose edge cases, review gaps, and silent failure modes before merge.

#### Do this

For every material change, identify one happy-path test, one edge case, and one failure mode. If you skip one of these, write down why.

#### Why this works

Defects often survive because test planning mirrors the expected success path too closely. Teams that explicitly test boundary conditions and recovery behavior catch bugs that optimistic implementations or optimistic AI-generated tests tend to miss.

#### How to

Before writing tests, identify one happy-path case, one edge case, and one failure mode for every material change. Use an AI assistant to generate additional test scenarios for a function or module, then compare each one against real invariants, production incidents, and regression history before accepting it.

During PR review, ask what happens when inputs are invalid, external calls fail, or state is partially updated. Require reviewers to name the riskiest untested branch before approval. Good evidence: unit tests for logic, integration tests for contracts, and one note about observability or debugging signals.

**Prompt template: Test coverage check**

```text
Here is a function that applies a discount code to a cart total:

function applyDiscount(total: number, code: string): number {
  const discounts: Record<string, number> = { SAVE10: 0.10, SAVE20: 0.20 };
  const rate = discounts[code];
  return total - total * rate;
}

For this function:
1. What is the most likely bug a user would hit in production?
2. List three edge cases the happy path does not cover.
3. What would you mock or stub to isolate this in a unit test?
4. Write the single highest-value test case as code.

Replace the discount function with your own code and apply the same analysis.
```

## Pillar 5 - Operations & Maintenance

Leave enough context behind that another engineer can safely operate what you ship.

### Ship with an operational trail

The goal is not more documentation for its own sake. The goal is faster diagnosis, safer handoff, and fewer heroics after release.

#### Do this

Document the minimum operational context needed to debug, support, and roll back the feature: signals, failure symptoms, ownership, and first debugging steps.

#### Why this works

Maintainability depends on what future engineers can see when things go wrong. AI can help draft support notes, but teams still need clear ownership, observability, and rollback thinking embedded in delivery.

#### How to

Before shipping, document the minimum operational context: signals to watch, failure symptoms, first debugging steps, and how to roll back. Use an AI assistant to draft a runbook or handoff note, then verify every monitoring reference, config detail, and rollback statement against the actual system before publishing it.

Every change that affects operations should state what to watch, where to look first, and how to reduce blast radius. Minimum checklist: signals to watch, common failure modes, mitigation options, and who owns the area.

**Prompt template: Operational runbook**

```text
I just shipped a background job that sends weekly summary emails to users.
It reads from the database, renders a template, and calls the SendGrid API.
It runs every Monday at 08:00 UTC via a cron job.

Draft a runbook for this feature with the following sections:

Signals to watch:  which metrics or log events indicate the job ran successfully?
First symptom:     what is the first thing that breaks, and how would support notice?
First response:    step-by-step: what do you check first, second, third?
Mitigation:        how do you stop the bleeding without a full rollback?
Rollback:          how do you fully revert if the job is causing harm?
Owner:             who is on-call for this feature?

Replace the email-job example with your own feature and fill every section.
```