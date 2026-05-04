# Best Practices Execution Playbook

This playbook turns assessment recommendations into practical team habits.

- Use it when you want concrete next steps, whether your team uses AI heavily, occasionally, or not at all.
- Keep it organized by pillar so the dashboard can link recommendations to the right playbook section.
- Prefer durable engineering practices over tool-specific tricks.

## Pillar 1 - Ideation & Requirements

Clarify the work before code is written.

### Start from clarified intent

Treat the first summary, prompt output, or verbal request as a draft that still needs engineering judgment.

#### Do this

Challenge the first framing of the task before you implement it. Rewrite the request into a ticket with `Why`, `What`, acceptance criteria, and explicit unknowns.

#### Why this works

Most delivery mistakes start before coding: vague scope, hidden assumptions, and missing impact analysis. Teams that force clarity early avoid churn later, regardless of whether the first draft came from a PM, a teammate, or an AI assistant.

#### How to

- With AI: use a coding or chat assistant to transform the raw request into a structured ticket, then review and correct the output before adopting it.
- Without AI: use a lightweight template in the ticket itself and ask a teammate to review assumptions before implementation starts.
- Team habit: require three sections on every meaningful task: `Why`, `What`, and `Acceptance Criteria`.
- Project reference: `prompts/gherkin.md`

```text
Turn this request into an implementation-ready ticket.

Return:
1. Why
2. What
3. Acceptance Criteria in Given/When/Then format
4. Open questions
5. Files or systems likely impacted

Request:
[paste request here]
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

- With AI: ask an assistant to draft an ADR, enumerate alternatives, or point out missing security checks, then validate the output against the actual codebase and standards.
- Without AI: write a one-page design note covering context, decision, tradeoffs, and risks; review it synchronously or in the PR.
- Team habit: for changes touching data flow, APIs, or auth, require a diagram or ADR note before merge.
- Good artifact contents: context, decision, alternatives considered, tradeoffs, rollout notes, and one explicit security risk.

```text
Draft a short ADR for this change.

Include:
- context
- decision
- alternatives considered
- tradeoffs
- security considerations
- rollout notes

Context:
[paste context here]
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

- With AI: ask for a proposed PR split, but validate the boundaries yourself so refactors, behavior changes, and docs updates stay coherent.
- Without AI: outline the PR sequence in the ticket or PR description before coding, and defer unrelated fixes to follow-up work.
- Team habit: each PR should answer one question clearly, such as refactor, new behavior, or documentation alignment.
- Useful check: if the PR summary needs multiple paragraphs to explain scope, the slice is probably too large.

```text
Break this work into the smallest reviewable PR sequence.

For each PR, include:
- objective
- files likely to change
- tests to add or update
- what should explicitly stay out of scope

Work item:
[paste work item here]
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

- With AI: ask for missing test scenarios, but compare them against real invariants, production incidents, and regression history before accepting them.
- Without AI: use a checklist in PR review that asks what happens when inputs are invalid, external calls fail, or state is partially updated.
- Team habit: require reviewers to name the riskiest untested branch before approval.
- Good evidence: unit tests for logic, integration tests for contracts, and one note about observability or debugging signals.

```text
Generate a focused test plan for this change.

Return:
- happy path checks
- edge cases
- failure modes
- mocking needs
- the highest-risk missing test

Change details:
[paste details here]
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

- With AI: generate a runbook or handoff draft, then verify every monitoring, config, and rollback statement against the real system.
- Without AI: add a short runbook section to the PR, release note, or technical doc before rollout.
- Team habit: every change that affects operations should state what to watch, where to look first, and how to reduce blast radius.
- Minimum checklist: signals to watch, common failure modes, mitigation options, and who owns the area.

```text
Draft a lightweight runbook for this feature.

Return:
- signals to watch
- likely failure symptoms
- first debugging steps
- rollback or mitigation options
- ownership notes

Feature summary:
[paste summary here]
```