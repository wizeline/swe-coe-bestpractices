# Copilot Instructions

This repository uses AGENTS.md as the canonical engineering guide.

## Required Behavior

- Consult AGENTS.md before implementing changes.
- Follow all architecture constraints, type conventions, and storage rules from AGENTS.md.
- Keep scoring logic pure and storage/browser interactions isolated.
- Preserve existing UI patterns and project structure.
- For any new feature request: implement code, add/update unit tests, and update relevant documentation before considering the task complete.

## Validation

For meaningful changes, run:

- npm run lint
- npm test
- npm run build

## Conflict Resolution

If any instruction in this file conflicts with AGENTS.md, AGENTS.md wins.
