# Contributing

## Contribution Philosophy

This project values small, technically clear changes over broad rewrites.

Because the app deals with messaging, encryption, and client-side key handling, every contribution should prioritize correctness and reviewability.

## Before You Change Code

Understand the affected area first:

- route/UI behavior,
- store ownership,
- browser persistence impact,
- relay/network implications,
- security implications if keys or crypto are involved.

## Preferred Workflow

1. Identify the exact bug, feature, or refactor target.
2. Inspect related files before editing.
3. Make the smallest coherent change that solves the issue.
4. Run `npm run typecheck` if TypeScript code changed.
5. Update docs if behavior or architecture changed.

## Pull Request Guidelines

Each change should clearly explain:

- what changed,
- why it changed,
- user-visible impact,
- protocol or security impact,
- how it was verified,
- what remains unverified.

## Areas That Need Extra Care

- key storage and auth flows,
- encryption and decryption,
- event signing and event parsing,
- relay connection behavior,
- cache merge and message ordering logic.

## Style Expectations

- keep code readable,
- prefer explicit logic,
- avoid adding dependencies without reason,
- keep naming consistent with existing code,
- add comments only when logic is not obvious.

## Testing Expectations

Until a formal test suite is added:

- run `npm run typecheck` for code changes,
- manually verify the affected route or flow,
- document any untested edge cases in the PR or handoff.

## Documentation Expectations

Update markdown documents when appropriate:

- `README.md` for setup or product-scope changes
- `ARCHITECTURE.md` for structural changes
- `CURRENT_STATUS.md` for major progress or blockers
- `ROADMAP.md` if priorities shift

## What Not To Do

- do not silently change messaging protocol assumptions,
- do not weaken key handling for convenience,
- do not ship broad refactors without a concrete problem statement,
- do not mix unrelated fixes into one change unless necessary.
