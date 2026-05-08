import { AssessmentModel } from "@/types/assessment";

export const assessmentTemplate: AssessmentModel = {
  title: "SWE Best Practices Pulse",
  description:
    "A 16-question personal self-assessment that scores your individual engineering habits across five pillars. Select the option that most accurately describes what YOU personally do today, not what your team or project does in general.",
  scaleLabel:
    "1 = I rarely or never do this · 2 = I do this sometimes or informally · 3 = I do this consistently as a personal habit · 4 = I do this with a structured, repeatable approach and continuously improve it",
  categories: [
    {
      id: "pillar-1-ideation",
      title: "Pillar 1 – Ideation & Requirements",
      description:
        "How clearly you define and understand the work before writing a single line of code.",
      weight: 0.2,
      questions: [
        {
          id: "p1-q1",
          text: "How do you document requirements before starting a task?",
          hint: {
            1: "I start coding from a verbal request or Slack message without writing anything down.",
            2: "I write a brief summary in the ticket but skip explicit acceptance criteria.",
            3: "I write a formal spec with clear Acceptance Criteria (Given/When/Then) before every task, not just large ones.",
            4: "I validate the spec with the requester before coding, resolve all ambiguous criteria until they are testable, and flag scope risks early.",
          },
        },
        {
          id: "p1-q2",
          text: "How do you check what your code will break (impact analysis)?",
          hint: {
            1: "I start coding and deal with breakage when it appears in tests or review.",
            2: "I search the repo for likely affected files before I start, but the analysis is informal and undocumented.",
            3: "Before coding, I map all dependencies my change could affect and document that analysis in the ticket or PR.",
            4: "I share the impact map with owners of affected services, confirm no conflicts, and update it if scope changes mid-task.",
          },
        },
        {
          id: "p1-q3",
          text: "How do you track your delivery speed and quality?",
          hint: {
            1: "I don't monitor my own delivery speed or PR quality; I focus on finishing tasks.",
            2: "I check if I hit the sprint deadline but don't track rework, review cycles, or bug rates.",
            3: "I regularly note my cycle times and how often PRs come back with significant comments, and use that to adjust estimates.",
            4: "Each sprint I identify one specific bottleneck from my data and apply a concrete change to address it.",
          },
        },
      ],
      recommendations: [
        {
          id: "p1-r1",
          band: "foundational",
          title: "Start writing structured ticket descriptions",
          action:
            "Before coding, add a 'Why / What / Acceptance Criteria' block to your ticket. Example: Add a bulleted list of 3 things that must be true for this ticket to be considered 'Done'.",
        },
        {
          id: "p1-r2",
          band: "disciplined",
          title: "Adopt Gherkin-style Acceptance Criteria",
          action:
            "Write scenarios for each requirement. Example: Write 'Given a logged-in user, When they click buy, Then the cart clears'. Also, list all files you expect to change before coding.",
        },
        {
          id: "p1-r3",
          band: "optimized",
          title: "Leverage AI for requirements normalization",
          action:
            "Use a prompt-based agent to turn raw client inputs into a structured spec. Example: Paste a Slack thread from a PM into an LLM and ask it to generate Jira Acceptance Criteria.",
        },
        {
          id: "p1-r4",
          band: "strategic",
          title: "Coach your team on requirements rigor",
          action:
            "Spread structured requirements practices beyond your own work. Example: Run a 30-minute workshop showing teammates how to turn a vague Slack message into a Gherkin spec, and create a shared ticket template in Jira or Linear that the whole team can reuse.",
        },
      ],
    },
    {
      id: "pillar-2-design",
      title: "Pillar 2 – Design & Architecture",
      description:
        "How you plan your technical solutions, reuse existing code, and handle security.",
      weight: 0.2,
      questions: [
        {
          id: "p2-q4",
          text: "How do you find reusable components or patterns?",
          hint: {
            1: "I write solutions from scratch without checking if a similar one exists.",
            2: "I do a manual repo search for similar code but don't consult architecture docs or ADRs.",
            3: "I consult ADRs, shared libraries, or architecture standards before designing my solution and reference them in my approach.",
            4: "When I reuse a pattern, I document or improve it if I find gaps and share my findings with the team.",
          },
        },
        {
          id: "p2-q5",
          text: "Do you create a technical plan before coding?",
          hint: {
            1: "I start coding directly from the ticket without writing down my approach.",
            2: "I sketch the approach informally but don't produce a shareable, reviewable artifact.",
            3: "I write a Design Doc with at least one diagram and share it for review before coding starts, for any non-trivial change.",
            4: "I get explicit feedback from a senior engineer or architect, incorporate their input, and update the doc if the design evolves during implementation.",
          },
        },
        {
          id: "p2-q6",
          text: "When do you evaluate security risks?",
          hint: {
            1: "I don't do explicit security analysis; I trust the platform or framework to handle it.",
            2: "I apply general security awareness while coding (sanitizing inputs, not hardcoding secrets) but without a dedicated review step.",
            3: "Before coding, I trace data flows and identify at least one threat vector using a lightweight threat model, for every feature involving sensitive data or external inputs.",
            4: "I have my threat model reviewed by a peer before coding, document the mitigations I will apply, and verify them during code review.",
          },
        },
      ],
      recommendations: [
        {
          id: "p2-r1",
          band: "foundational",
          title: "Make design visible before coding",
          action:
            "Sketch a simple diagram and search the repo for existing patterns. Example: Take a photo of a whiteboard drawing and attach it to the PR so reviewers understand your intent.",
        },
        {
          id: "p2-r2",
          band: "disciplined",
          title: "Document with ADRs and Threat Models",
          action:
            "Publish a short Design Doc. Example: Use Mermaid.js to create a sequence diagram showing how the frontend, API, and database talk to each other, and document one security risk.",
        },
        {
          id: "p2-r3",
          band: "optimized",
          title: "Adopt AI-assisted design validation",
          action:
            "Query AI for reusable components and design risks. Example: Feed your proposed database schema into an AI agent to find missing indexes, or feed your API sequence diagram to detect missing authentication layers.",
        },
        {
          id: "p2-r4",
          band: "strategic",
          title: "Drive architectural standards across the team",
          action:
            "Turn your design practices into shared team conventions. Example: Write or update the team ADR template, add a mandatory threat-model section, and do at least one design-doc review per sprint as a recurring ritual.",
        },
      ],
    },
    {
      id: "pillar-3-development",
      title: "Pillar 3 – Development Hygiene",
      description:
        "How clean, reviewable, and well-documented your actual code changes are, how reliably you deliver them, and how consistently you protect data integrity.",
      weight: 0.2,
      questions: [
        {
          id: "p3-q7",
          text: "How do you manage the size and scope of your Pull Requests (PRs)?",
          hint: {
            1: "My PRs mix multiple concerns because I commit everything as I go.",
            2: "I keep the PR focused on the ticket but don't actively split it when it grows large.",
            3: "I plan a PR sequence before coding: refactors in one PR, behavior changes in another, each with a single stated purpose.",
            4: "After each PR cycle, I review the feedback and use it to improve how I split my next work.",
          },
        },
        {
          id: "p3-q8",
          text: "How do you ensure your code does exactly what the ticket asked?",
          hint: {
            1: "I implement what seems right and rely on review comments to catch spec misalignments.",
            2: "I manually test the main flow before opening the PR but don't trace each Acceptance Criterion explicitly.",
            3: "Before merging, I trace each Acceptance Criterion to a specific piece of code or test to confirm nothing was missed.",
            4: "I include a traceability note in my PR description mapping each AC to the code or test that covers it, so reviewers can verify coverage without hunting through the diff.",
          },
        },
        {
          id: "p3-q9",
          text: "When do you update the documentation?",
          hint: {
            1: "I rarely update documentation; I leave it for later, which often means never.",
            2: "I update docs after the code is merged when I remember, but it's not a consistent habit.",
            3: "I update documentation in the same PR as the code change, every time, not as an afterthought.",
            4: "After merging, I re-read the docs as if I were a new engineer, fix any gaps I find, and confirm they reflect the actual current behavior.",
          },
        },
        {
          id: "p2-q15",
          text: "Is your CI/CD pipeline ensuring reliable and consistent delivery?",
          hint: {
            1: "I deploy manually or push to shared branches without relying on a pipeline.",
            2: "My PRs go through a basic CI pipeline but I don't verify all gates pass before merging; I treat CI as optional.",
            3: "Every change I merge passes all automated quality gates (tests, linting, security checks) in CI, and I follow a deployment process with documented rollback steps.",
            4: "When a gate fails, I investigate root cause rather than just re-running. I actively improve the pipeline when I find gaps.",
          },
        },
        {
          id: "p2-q16",
          text: "Are you ensuring data integrity across your system?",
          hint: {
            1: "I assume data arrives valid; I don't add explicit validation or DB constraints.",
            2: "I validate inputs at the entry point but skip deeper constraints like DB-level checks or transactions for related writes.",
            3: "I enforce integrity at every boundary I own: input validation, DB constraints, and transactional logic for multi-step operations, in every feature I build.",
            4: "I write integrity tests that verify my data guarantees in CI and document what my service promises and what it assumes from upstream.",
          },
        },
      ],
      recommendations: [
        {
          id: "p3-r1",
          band: "foundational",
          title: "Focus PRs, set up CI, and add input validation",
          action:
            "Scope each PR to a single concern, add a basic CI workflow that runs tests on every PR, and validate inputs at entry points. Example: Add a GitHub Actions step that runs your test suite before a PR can be merged, and write one validation check for an endpoint you own.",
        },
        {
          id: "p3-r2",
          band: "disciplined",
          title: "Enforce single-responsibility PRs, quality gates, and data constraints",
          action:
            "Split refactors from feature PRs, require all CI gates to pass before merging, and enforce DB-level constraints and transactions for related writes. Example: Make PR #1 the refactor and PR #2 the feature; block merges when lint or tests fail; wrap multi-step DB writes in a transaction.",
        },
        {
          id: "p3-r3",
          band: "optimized",
          title: "Automate traceability, pipeline stages, and data observability",
          action:
            "Use AI to plan PR splits and spec-to-code traceability, contribute pipeline improvements (parallelization, environment promotion), and add monitoring for data anomalies. Example: Use an AI tool to generate a PR description from your diff, add a staging promotion gate to CI, and set an alert for unexpected null rates in a key column.",
        },
        {
          id: "p3-r4",
          band: "strategic",
          title: "Set team-wide hygiene standards and automate enforcement",
          action:
            "Make your personal hygiene habits the team default. Example: Propose and merge a PR template that requires a traceability section, add a lint rule that blocks large single-commit PRs, and document rollback procedures in the team runbook.",
        },
      ],
    },
    {
      id: "pillar-4-quality",
      title: "Pillar 4 – Quality Engineering",
      description: "How thoroughly you test your code and protect against future bugs.",
      weight: 0.2,
      questions: [
        {
          id: "p4-q10",
          text: "How do you test for hidden bugs?",
          hint: {
            1: "I don't write automated tests; I validate manually or rely on others to find bugs.",
            2: "I write tests for the main success flow but don't systematically cover failure cases or edge inputs.",
            3: "For every meaningful piece of logic I write, I cover at least one edge case and one failure mode, not just the happy path.",
            4: "Before writing tests, I list the failure modes most likely to cause user impact, prioritize them, and cover the highest-risk ones first. I revisit this list when production issues occur.",
          },
        },
        {
          id: "p4-q11",
          text: "How do you verify your logic before merging?",
          hint: {
            1: "I open the PR when CI is green and count on reviewers to catch logic issues.",
            2: "I do a quick re-read of my diff before tagging reviewers but it's not structured; I'm mainly looking for obvious mistakes.",
            3: "I do a structured self-review before every PR: line by line through my diff, verifying each function against the acceptance criteria.",
            4: "Before requesting review, I note the riskiest parts of the change in the PR description and what I verified, guiding reviewers to areas that need the most scrutiny.",
          },
        },
        {
          id: "p4-q12",
          text: "How do you handle broken legacy tests or technical debt?",
          hint: {
            1: "I skip or comment out failing tests that block progress and leave a note to fix later.",
            2: "I fix tests my changes directly broke but don't touch legacy debt I didn't cause.",
            3: "When I work in a file, I also clean up or rewrite outdated or flaky tests I find there, even unrelated ones.",
            4: "I proactively identify test debt in areas I work on, propose a cleanup plan, and execute it alongside feature work. I track coverage changes in areas I own over time.",
          },
        },
      ],
      recommendations: [
        {
          id: "p4-r1",
          band: "foundational",
          title: "Expand beyond happy-path tests",
          action:
            "Write tests for when things go wrong. Example: If you write a function that divides numbers, write one test for normal numbers, and a second test to see what happens if you divide by zero.",
        },
        {
          id: "p4-r2",
          band: "disciplined",
          title: "Introduce self-audits and test debt cleanup",
          action:
            "Review your own code first. Example: Review your own PR on GitHub before tagging a teammate. Also, commit to rewriting one bad legacy test in the file you are currently editing.",
        },
        {
          id: "p4-r3",
          band: "optimized",
          title: "Adopt AI-assisted QA agents",
          action:
            "Use AI to discover edge cases. Example: Provide your function to an AI and ask, 'Generate 5 unit tests that attempt to break this logic using weird or unexpected inputs.'",
        },
        {
          id: "p4-r4",
          band: "strategic",
          title: "Build a quality culture with shared ownership",
          action:
            "Elevate quality from a personal habit to a team standard. Example: Propose a coverage threshold enforced in CI, present a retrospective item on recurring bug patterns, and pair with a junior engineer on test strategy for one feature per sprint.",
        },
      ],
    },
    {
      id: "pillar-5-operations",
      title: "Pillar 5 – Operations & Maintenance",
      description: "How easy it is to monitor, debug, and hand off the system you built.",
      weight: 0.2,
      questions: [
        {
          id: "p5-q13",
          text: "How easy is it to debug your code in production?",
          hint: {
            1: "I don't add feature-specific logging; debugging relies on generic error traces.",
            2: "I add basic text logs at key steps but they're not structured or consistently queryable.",
            3: "I write structured logs (e.g., JSON with userId, endpoint, errorCode) and set up at least one dashboard or alert before my feature goes to production.",
            4: "After each deploy, I verify my alerts and dashboards reflect actual system behavior, update them as the feature evolves, and document first-response steps for each alert I own.",
          },
        },
        {
          id: "p5-q14",
          text: "How easily can another engineer take over your work?",
          hint: {
            1: "I finish tasks without leaving context beyond the code; handoff knowledge lives only in my head.",
            2: "I describe the implementation in the PR description, but that context is buried after merge.",
            3: "I write a KT document (architecture notes, runbook, or README section) and link it from the repo so any engineer can find it independently.",
            4: "I keep my KT documentation current as the feature evolves, share it proactively with teammates who will support it, and review it with them to close any gaps.",
          },
        },
      ],
      recommendations: [
        {
          id: "p5-r1",
          band: "foundational",
          title: "Replace text logs with structured logging",
          action:
            "Use logs that are easy to search. Example: Instead of console.log('failed to fetch user'), use logger.error('user_fetch_failed', { userId: id, endpoint: url }).",
        },
        {
          id: "p5-r2",
          band: "disciplined",
          title: "Define Dashboards and a KT guide",
          action:
            "Make your feature observable. Example: Create a Datadog/Grafana dashboard tracking the success rate of your new API endpoint, and add a 'How to Test' section to the README.",
        },
        {
          id: "p5-r3",
          band: "optimized",
          title: "Make observability AI-ready",
          action:
            "Automate documentation. Example: Hook up a tool that automatically publishes your successful PRs and their architectural changes into your company's Confluence or Notion workspace.",
        },
        {
          id: "p5-r4",
          band: "strategic",
          title: "Establish team-wide observability and knowledge standards",
          action:
            "Make observability and knowledge transfer a team expectation, not a personal habit. Example: Propose a runbook template for new features, review the on-call alert backlog as a team quarterly, and mentor one teammate on structured logging in their next feature.",
        },
      ],
    },
  ],
};
