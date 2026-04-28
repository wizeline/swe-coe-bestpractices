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
        "Intent Engineering: how rigorously you capture, structure, and trace requirements before writing code.",
      weight: 0.2,
      questions: [
        {
          id: "p1-q1",
          text: "How do you document the requirements?",
          hint: '1 = I am building based on verbal cues or vague notes without a formal standard. · 2 = I am writing a basic summary of the features in the ticket. · 3 = I am writing a formal Technical Spec with Gherkin-style Acceptance Criteria manually. · 4 = I am using an Agent to normalize raw client inputs into a structured "Super-Spec."',
        },
        {
          id: "p1-q2",
          text: "Do you analyze codebase impact?",
          hint: "1 = I am starting to code immediately without checking how it affects other modules. · 2 = I am checking only the relevant files manually before I start coding. · 3 = I am creating a manual Technical Impact Map showing all affected dependencies. · 4 = I am using a code-aware Agent to perform a full system risk and debt scan.",
        },
        {
          id: "p1-q3",
          text: "How do you track your performance?",
          hint: "1 = I am not tracking my time or velocity for individual tasks. · 2 = I am checking my progress against the assigned sprint deadline. · 3 = I am manually tracking my individual Cycle Time and Rework Rate for this task. · 4 = I am using automated platform tools to baseline my DORA metrics in real-time.",
        },
      ],
      recommendations: [
        {
          id: "p1-r1",
          maxScoreInclusive: 12,
          title: "Start writing structured ticket descriptions",
          action:
            "Before coding, add a short 'Why / What / Acceptance Criteria' block to every ticket to move from ad-hoc to disciplined.",
        },
        {
          id: "p1-r2",
          maxScoreInclusive: 24,
          title: "Adopt Gherkin-style Acceptance Criteria",
          action:
            "Write Given/When/Then scenarios for each requirement and create a Technical Impact Map listing all files and services affected.",
        },
        {
          id: "p1-r3",
          maxScoreInclusive: 36,
          title: "Leverage AI for requirements normalization",
          action:
            "Use a prompt-based agent to turn raw client inputs into a structured Super-Spec and track DORA metrics automatically.",
        },
      ],
    },
    {
      id: "pillar-2-design",
      title: "Pillar 2 – Design & Architecture",
      description:
        "Systematic Planning: how deliberately you design solutions, reuse patterns, and assess security before implementation.",
      weight: 0.2,
      questions: [
        {
          id: "p2-q4",
          text: "Do you look for reusable components?",
          hint: "1 = I am writing new code without checking if a solution already exists. · 2 = I am searching the current project for similar code patterns manually. · 3 = I am consulting Architectural Decision Records (ADRs) for global patterns. · 4 = I am querying WIZEBrain to find validated building blocks (WIZECores).",
        },
        {
          id: "p2-q5",
          text: "Is there a technical blueprint?",
          hint: "1 = I am coding directly from my own intuition without a visual or written plan. · 2 = I am making a quick mental or whiteboard sketch of the logic. · 3 = I am writing a formal Design Doc with C4 or Mermaid diagrams in the repository. · 4 = I am using an Agent to validate that my spec matches the account's patterns.",
        },
        {
          id: "p2-q6",
          text: "Do you evaluate security risks?",
          hint: '1 = I am assuming the system handles security and am not performing a specific review. · 2 = I am keeping general security principles in mind while designing. · 3 = I am performing a manual "Threat Modeling" session for the data flow. · 4 = I am using an AI security scanner to detect vulnerabilities in the design phase.',
        },
      ],
      recommendations: [
        {
          id: "p2-r1",
          maxScoreInclusive: 12,
          title: "Make design visible before coding",
          action:
            "Sketch a simple diagram (even a whiteboard photo) and search the repo for existing patterns before writing the first line.",
        },
        {
          id: "p2-r2",
          maxScoreInclusive: 24,
          title: "Document with ADRs and Threat Models",
          action:
            "Publish a short Design Doc with a C4 or Mermaid diagram and run a 30-minute Threat Modeling session to identify data-flow risks.",
        },
        {
          id: "p2-r3",
          maxScoreInclusive: 36,
          title: "Adopt AI-assisted design validation",
          action:
            "Query WIZEBrain for reusable WIZECores and use an AI security scanner to catch vulnerabilities during design, not after.",
        },
      ],
    },
    {
      id: "pillar-3-development",
      title: "Pillar 3 – Development",
      description:
        "Implementation Hygiene: how clean, traceable, and well-documented your code changes are.",
      weight: 0.2,
      questions: [
        {
          id: "p3-q7",
          text: "Are your Pull Requests (PRs) manageable?",
          hint: '1 = I am submitting large, multi-feature Pull Requests that are hard to review. · 2 = I am keeping my PR focused on the assigned task. · 3 = I am enforcing a strict <200 LOC limit and single-responsibility "slices." · 4 = I am using an Agent to split complex tasks into atomic, generated sub-commits.',
        },
        {
          id: "p3-q8",
          text: "Does the code match the intent?",
          hint: "1 = I am adjusting requirements as I code based on what is easier to implement. · 2 = I am checking that the code works as expected through manual tests. · 3 = I am manually mapping every block of code back to an Acceptance Criterion. · 4 = I am using an automated agent to validate spec-to-code parity before the PR.",
        },
        {
          id: "p3-q9",
          text: "Is your documentation live?",
          hint: '1 = I am leaving documentation for later or relying on others to update it. · 2 = I am updating the README file after I finish writing the code. · 3 = I am updating READMEs and ADRs in the same commit as the code (Docs-as-Code). · 4 = I am using a "Docs-as-Code" agent to auto-refresh diagrams and references.',
        },
      ],
      recommendations: [
        {
          id: "p3-r1",
          maxScoreInclusive: 12,
          title: "Keep PRs focused and update docs",
          action:
            "Scope each PR to a single concern and update the README before merging to build the docs habit.",
        },
        {
          id: "p3-r2",
          maxScoreInclusive: 24,
          title: "Enforce PR size limits and Docs-as-Code",
          action:
            "Set a 200 LOC soft limit per PR, commit ADR updates alongside code changes, and manually trace each code block to an Acceptance Criterion.",
        },
        {
          id: "p3-r3",
          maxScoreInclusive: 36,
          title: "Automate spec-to-code traceability",
          action:
            "Use an agent to split large tasks into atomic commits and to validate spec parity before the PR is opened.",
        },
      ],
    },
    {
      id: "pillar-4-quality",
      title: "Pillar 4 – Quality Engineering",
      description:
        "Validation & Reliability: how thoroughly you test, audit, and protect against regressions.",
      weight: 0.2,
      questions: [
        {
          id: "p4-q10",
          text: "Do you find the hidden bugs?",
          hint: '1 = I am not writing automated tests for this specific task. · 2 = I am writing Unit Tests for the main "Happy Path." · 3 = I am using a Manual Checklist to write tests for Nulls, Bounds, and Errors. · 4 = I am using a QA agent to discover non-obvious edge cases and generate coverage.',
        },
        {
          id: "p4-q11",
          text: "How do you verify the output?",
          hint: '1 = I am merging code as soon as the build passes without human review. · 2 = I am requesting a standard peer review from a teammate. · 3 = I am performing a "Protocol Audit" (manual line-by-line check) of my logic. · 4 = I am using a "Verifier" agent to audit code against the spec before human review.',
        },
        {
          id: "p4-q12",
          text: "Do you handle legacy regressions?",
          hint: '1 = I am ignoring old broken tests or bypassing them to finish my task. · 2 = I am fixing any old tests that I break during the task. · 3 = I am manually refactoring and cleaning "Test Debt" in the affected modules. · 4 = I am using an agent to automatically repair the legacy test suite in the background.',
        },
      ],
      recommendations: [
        {
          id: "p4-r1",
          maxScoreInclusive: 12,
          title: "Expand beyond happy-path tests",
          action:
            "After writing happy-path tests, add at least one null, one boundary, and one error-path test case per function.",
        },
        {
          id: "p4-r2",
          maxScoreInclusive: 24,
          title: "Introduce Protocol Audits and test debt cleanup",
          action:
            "Perform a line-by-line logic review before each PR and schedule a recurring slot to refactor test debt in touched modules.",
        },
        {
          id: "p4-r3",
          maxScoreInclusive: 36,
          title: "Adopt AI-assisted QA agents",
          action:
            "Use a QA agent to discover edge cases and generate coverage, and a Verifier agent to audit spec parity before human review.",
        },
      ],
    },
    {
      id: "pillar-5-operations",
      title: "Pillar 5 – Operations & Maintenance",
      description:
        "Observability: how easy it is to debug, hand off, and operate the system you built.",
      weight: 0.2,
      questions: [
        {
          id: "p5-q13",
          text: "Is it easy to debug?",
          hint: "1 = I am not adding any specific logs or traces to the code. · 2 = I am adding basic console logs to track errors in the code. · 3 = I am manually defining structured SLOs, Dashboards, and Trace points. · 4 = I am using an agent to ensure the code is ready for AI-assisted anomaly detection.",
        },
        {
          id: "p5-q14",
          text: "Can another engineer take over?",
          hint: "1 = I am finishing tasks without leaving any context for future maintainers. · 2 = I am explaining my changes in the PR description field. · 3 = I am writing a formal Knowledge Transfer (KT) guide and linking it in the repo. · 4 = I am updating the WIZEBrain hub with implementation evidence automatically.",
        },
      ],
      recommendations: [
        {
          id: "p5-r1",
          maxScoreInclusive: 12,
          title: "Replace console logs with structured logging",
          action:
            "Use a structured logger and document the PR changes clearly so another engineer can pick up the work without asking.",
        },
        {
          id: "p5-r2",
          maxScoreInclusive: 24,
          title: "Define SLOs, Dashboards, and a KT guide",
          action:
            "Add trace points and a dashboard for your feature, and write a formal Knowledge Transfer guide linked from the repo README.",
        },
        {
          id: "p5-r3",
          maxScoreInclusive: 36,
          title: "Make observability AI-ready",
          action:
            "Instrument code for AI-assisted anomaly detection and automate publishing implementation evidence to the WIZEBrain knowledge hub.",
        },
      ],
    },
  ],
};
