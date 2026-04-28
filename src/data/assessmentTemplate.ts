import { AssessmentModel } from "@/types/assessment";

export const assessmentTemplate: AssessmentModel = {
  title: "SWE Best Practices Pulse",
  description:
    "A 14-question self-assessment measuring SWE maturity across five pillars from Foundational (ad-hoc) to Strategic (AI-orchestrated).",
  scaleLabel:
    "1 = Foundational · 2 = Disciplined · 3 = Optimized · 4 = Strategic",
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
          hint: "1 = I build based on vague notes or verbal requests. · 2 = I write a basic summary of the feature in the ticket. · 3 = I write a formal spec with clear Acceptance Criteria. · 4 = I use an AI Agent to turn raw client requests into a structured 'Super-Spec'.",
        },
        {
          id: "p1-q2",
          text: "How do you check what your code will break (impact analysis)?",
          hint: "1 = I start coding immediately and fix things as they break. · 2 = I manually check a few relevant files before I start. · 3 = I create a map of all dependencies and services that will be affected. · 4 = I use a code-aware AI agent to scan the whole system for risks.",
        },
        {
          id: "p1-q3",
          text: "How do you track your delivery speed and quality?",
          hint: "1 = I don't track my time or velocity. · 2 = I just check if I meet the sprint deadline. · 3 = I manually track how long tasks take and how often my code gets sent back. · 4 = I use automated tools to track my DORA metrics in real-time.",
        },
      ],
      recommendations: [
        {
          id: "p1-r1",
          maxScoreInclusive: 12,
          title: "Start writing structured ticket descriptions",
          action:
            "Before coding, add a 'Why / What / Acceptance Criteria' block to your ticket. Example: Add a bulleted list of 3 things that must be true for this ticket to be considered 'Done'.",
        },
        {
          id: "p1-r2",
          maxScoreInclusive: 24,
          title: "Adopt Gherkin-style Acceptance Criteria",
          action:
            "Write scenarios for each requirement. Example: Write 'Given a logged-in user, When they click buy, Then the cart clears'. Also, list all files you expect to change before coding.",
        },
        {
          id: "p1-r3",
          maxScoreInclusive: 36,
          title: "Leverage AI for requirements normalization",
          action:
            "Use a prompt-based agent to turn raw client inputs into a structured spec. Example: Paste a Slack thread from a PM into an LLM and ask it to generate Jira Acceptance Criteria.",
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
          hint: "1 = I write new code without checking if we already solved this. · 2 = I manually search the repo to see if someone wrote similar code. · 3 = I check our Architectural Decision Records (ADRs) or shared UI libraries. · 4 = I query our internal AI Knowledge Base for validated building blocks.",
        },
        {
          id: "p2-q5",
          text: "Do you create a technical plan before coding?",
          hint: "1 = I just code straight from my head. · 2 = I make a quick whiteboard sketch or mental note. · 3 = I write a Design Doc with diagrams (like C4 or Mermaid) in the repo. · 4 = I use AI to validate that my plan matches the company's architecture standards.",
        },
        {
          id: "p2-q6",
          text: "When do you evaluate security risks?",
          hint: "1 = I assume the infrastructure/cloud handles security. · 2 = I keep general security best practices in mind while coding. · 3 = I do a specific 'Threat Modeling' check to see how data flows and where it can be hacked. · 4 = I use an AI security scanner to detect flaws in my design document before coding.",
        },
      ],
      recommendations: [
        {
          id: "p2-r1",
          maxScoreInclusive: 12,
          title: "Make design visible before coding",
          action:
            "Sketch a simple diagram and search the repo for existing patterns. Example: Take a photo of a whiteboard drawing and attach it to the PR so reviewers understand your intent.",
        },
        {
          id: "p2-r2",
          maxScoreInclusive: 24,
          title: "Document with ADRs and Threat Models",
          action:
            "Publish a short Design Doc. Example: Use Mermaid.js to create a sequence diagram showing how the frontend, API, and database talk to each other, and document one security risk.",
        },
        {
          id: "p2-r3",
          maxScoreInclusive: 36,
          title: "Adopt AI-assisted design validation",
          action:
            "Query AI for reusable components and design risks. Example: Feed your proposed database schema into an AI agent to find missing indexes, or feed your API sequence diagram to detect missing authentication layers.",
        },
      ],
    },
    {
      id: "pillar-3-development",
      title: "Pillar 3 – Development Hygiene",
      description:
        "How clean, reviewable, and well-documented your actual code changes are.",
      weight: 0.2,
      questions: [
        {
          id: "p3-q7",
          text: "How do you manage the size and scope of your Pull Requests (PRs)?",
          hint: "1 = I submit large PRs that mix multiple features and refactors together. · 2 = I keep my PR focused on the ticket, regardless of how large it gets. · 3 = I enforce single-responsibility PRs (separating refactors from features) to keep reviewer cognitive load low. · 4 = I use an AI agent to automatically split my work into atomic, easily reviewable sub-commits.",
        },
        {
          id: "p3-q8",
          text: "How do you ensure your code does exactly what the ticket asked?",
          hint: "1 = I change requirements on the fly if it's easier to code. · 2 = I manually test the app to see if it works. · 3 = I explicitly link specific functions in my code back to specific Acceptance Criteria. · 4 = I use an automated AI agent to verify my code matches the spec before opening the PR.",
        },
        {
          id: "p3-q9",
          text: "When do you update the documentation?",
          hint: "1 = I leave it for later or never do it. · 2 = I update the README a few days after my code is merged. · 3 = I update docs in the exact same commit as my code changes (Docs-as-Code). · 4 = I use an AI agent to auto-generate and refresh documentation based on my code.",
        },
      ],
      recommendations: [
        {
          id: "p3-r1",
          maxScoreInclusive: 12,
          title: "Keep PRs focused and update docs",
          action:
            "Scope each PR to a single concern. Example: If you notice a typo in an unrelated file, fix it in a separate PR (or a clearly isolated commit) rather than tangling it with your current feature's code.",
        },
        {
          id: "p3-r2",
          maxScoreInclusive: 24,
          title: "Enforce single-responsibility PRs and Docs-as-Code",
          action:
            "Keep PRs optimized for reviewability. Example: If you need to refactor a messy function to build your new feature, make PR #1 just the refactor, and PR #2 just the new feature.",
        },
        {
          id: "p3-r3",
          maxScoreInclusive: 36,
          title: "Automate spec-to-code traceability",
          action:
            "Use an agent to split large tasks into atomic commits. Example: Use an AI tool that reads your diffs and automatically generates a detailed, accurate PR description summarizing the changes.",
        },
      ],
    },
    {
      id: "pillar-4-quality",
      title: "Pillar 4 – Quality Engineering",
      description:
        "How thoroughly you test your code and protect against future bugs.",
      weight: 0.2,
      questions: [
        {
          id: "p4-q10",
          text: "How do you test for hidden bugs?",
          hint: "1 = I don't write automated tests. · 2 = I write Unit Tests just for the 'Happy Path' (when everything works right). · 3 = I use a checklist to test edge cases like Nulls, extreme numbers, and errors. · 4 = I use a QA AI agent to discover weird edge cases I didn't think of.",
        },
        {
          id: "p4-q11",
          text: "How do you verify your logic before merging?",
          hint: "1 = I merge as soon as the CI pipeline is green. · 2 = I ask a teammate to do a standard code review. · 3 = I do a line-by-line self-audit of my own code before asking for a review. · 4 = I use an AI 'Verifier' to audit my logic against the spec before a human looks at it.",
        },
        {
          id: "p4-q12",
          text: "How do you handle broken legacy tests or technical debt?",
          hint: "1 = I ignore failing old tests or skip them to get my work done. · 2 = I only fix old tests if my new code broke them. · 3 = I actively dedicate time to clean up and refactor messy tests in the files I touch. · 4 = I use an AI agent to automatically repair and update legacy tests in the background.",
        },
      ],
      recommendations: [
        {
          id: "p4-r1",
          maxScoreInclusive: 12,
          title: "Expand beyond happy-path tests",
          action:
            "Write tests for when things go wrong. Example: If you write a function that divides numbers, write one test for normal numbers, and a second test to see what happens if you divide by zero.",
        },
        {
          id: "p4-r2",
          maxScoreInclusive: 24,
          title: "Introduce self-audits and test debt cleanup",
          action:
            "Review your own code first. Example: Review your own PR on GitHub before tagging a teammate. Also, commit to rewriting one bad legacy test in the file you are currently editing.",
        },
        {
          id: "p4-r3",
          maxScoreInclusive: 36,
          title: "Adopt AI-assisted QA agents",
          action:
            "Use AI to discover edge cases. Example: Provide your function to an AI and ask, 'Generate 5 unit tests that attempt to break this logic using weird or unexpected inputs.'",
        },
      ],
    },
    {
      id: "pillar-5-operations",
      title: "Pillar 5 – Operations & Maintenance",
      description:
        "How easy it is to monitor, debug, and hand off the system you built.",
      weight: 0.2,
      questions: [
        {
          id: "p5-q13",
          text: "How easy is it to debug your code in production?",
          hint: "1 = I don't add specific logs. · 2 = I add basic text logs (e.g., 'User logged in') to track errors. · 3 = I use structured JSON logging and set up Dashboards/Alerts for my feature. · 4 = I format my code and logs specifically so AI can do automated anomaly detection.",
        },
        {
          id: "p5-q14",
          text: "How easily can another engineer take over your work?",
          hint: "1 = I finish tasks without leaving context for the next person. · 2 = I explain how my code works in the PR description only. · 3 = I write a formal Knowledge Transfer (KT) guide and link it in the repo. · 4 = I use AI to automatically update our central engineering wiki with my implementation details.",
        },
      ],
      recommendations: [
        {
          id: "p5-r1",
          maxScoreInclusive: 12,
          title: "Replace text logs with structured logging",
          action:
            "Use logs that are easy to search. Example: Instead of console.log('failed to fetch user'), use logger.error('user_fetch_failed', { userId: id, endpoint: url }).",
        },
        {
          id: "p5-r2",
          maxScoreInclusive: 24,
          title: "Define Dashboards and a KT guide",
          action:
            "Make your feature observable. Example: Create a Datadog/Grafana dashboard tracking the success rate of your new API endpoint, and add a 'How to Test' section to the README.",
        },
        {
          id: "p5-r3",
          maxScoreInclusive: 36,
          title: "Make observability AI-ready",
          action:
            "Automate documentation. Example: Hook up a tool that automatically publishes your successful PRs and their architectural changes into your company's Confluence or Notion workspace.",
        },
      ],
    },
  ],
};
