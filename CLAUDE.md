# Claude Instructions

@AGENTS.MD
Use AGENTS.md as the canonical source of project rules and conventions.

## Source of Truth

- Read AGENTS.md before proposing or writing code.
- Follow architecture, scoring domain, storage invariants, and testing rules defined there.
- Keep behavior consistent with .github/copilot-instructions.md.

## Priority Rules

1. If there is any conflict, AGENTS.md has priority.
2. Keep changes minimal and aligned with existing patterns.
3. Run lint, tests, and build for non-trivial changes.

## Scope

These instructions apply to the whole repository.
