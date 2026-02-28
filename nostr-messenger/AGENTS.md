# AGENTS.md

This file tells AI coding agents how to work in this repository.

## Mission

Help build a decentralized web messenger on top of Nostr with a strong emphasis on:

- clear message flow,
- predictable client state,
- safe handling of keys,
- maintainable TypeScript code,
- pragmatic incremental delivery.

## Repository Context

- App type: Next.js App Router web app
- Main domain: decentralized direct messaging over Nostr
- Architecture style: client-heavy frontend with browser persistence
- Current maturity: MVP / prototype

## Primary Goals For AI

When asked to make changes, prioritize:

1. correctness of messaging behavior,
2. key and credential safety,
3. consistency between local cache and in-memory state,
4. minimal regressions in routing and chat UI,
5. readability over cleverness.

## Non-Goals

Do not assume this repository is:

- a polished production application,
- a complete NIP-compliant messaging reference client,
- server-backed,
- safe to deploy publicly without further review.

## Rules For Changes

- Preserve the existing product direction: simple decentralized 1:1 messaging.
- Prefer small, reviewable patches over broad rewrites.
- Do not replace the current state management approach unless explicitly requested.
- Do not introduce backend services or external infrastructure unless the user asks for it.
- Do not silently change cryptographic or protocol behavior without documenting the reason.
- Do not store secrets in new places without a clear justification.
- Avoid adding dependencies unless the benefit is concrete and immediate.

## Security-Sensitive Areas

Treat the following as high risk:

- `lib/nostr/crypto.ts`
- `lib/nostr/events.ts`
- `lib/nostr/keys.ts`
- `lib/storage/keyStorage.ts`
- `store/authStore.ts`

For changes in these files:

- explain the threat or bug being fixed,
- keep behavior explicit,
- avoid speculative protocol interpretation,
- prefer reversible changes if the exact target NIP is not settled.

## Data Handling Assumptions

- Private keys are currently stored in browser storage.
- Auth is represented partly by local state and partly by a cookie used for route gating.
- Message cache exists locally and can diverge from network state.
- Relay data is untrusted and may be duplicated, stale, malformed, or unavailable.

## Code Style

- Use TypeScript consistently.
- Keep functions small when possible.
- Prefer explicit names over short names.
- Add comments only where logic is genuinely non-obvious.
- Follow existing folder conventions.
- Reuse existing helpers before adding new abstractions.

## Preferred Working Method

When implementing a feature or fix:

1. inspect affected routes, hooks, stores, and helpers,
2. identify where source of truth should live,
3. make the minimum coherent change,
4. verify build or typecheck if feasible,
5. note residual risks if the protocol behavior is uncertain.

## What To Inspect First By Task Type

For auth and key issues:

- `store/authStore.ts`
- `lib/storage/keyStorage.ts`
- `middleware.ts`
- `components/auth/*`

For messaging issues:

- `hooks/useMessages.ts`
- `store/chatStore.ts`
- `lib/nostr/client.ts`
- `lib/nostr/events.ts`
- `lib/nostr/crypto.ts`
- `lib/storage/messageCache.ts`

For relay issues:

- `store/relayStore.ts`
- `lib/nostr/relays.ts`
- `components/relay/*`

For profile issues:

- `hooks/useProfile.ts`
- `store/profileStore.ts`
- `lib/nostr/profile.ts`
- `lib/storage/profileCache.ts`

## Constraints

- Preserve client-side functionality for local development.
- Avoid destructive changes to cached user data without explicit approval.
- Do not remove default relays unless the user requests a policy change.
- Be careful with route and loading state changes because the app uses App Router layouts.

## Documentation Expectations

When significant behavior changes, update the relevant markdown docs:

- `README.md` for user-facing behavior or setup changes
- `ARCHITECTURE.md` for structural or data-flow changes
- `CURRENT_STATUS.md` for major completed or blocked work
- `ROADMAP.md` when priorities materially change

## Testing Expectations

There is currently limited formal test coverage. Until a test suite is added:

- run `npm run typecheck` after meaningful TypeScript changes when possible,
- manually verify route-level flows affected by the change,
- call out unverified edge cases explicitly.

## Good AI Tasks In This Repo

- fix broken message state transitions,
- improve relay connection UX,
- refactor duplicated storage logic,
- add validation around pubkeys, relay URLs, and input length,
- document architecture and tradeoffs,
- add tests around pure utility functions and stores.

## Bad AI Tasks Without More Guidance

- redesigning the entire protocol layer,
- changing the messaging standard target without confirmation,
- inventing a backend architecture and wiring it in,
- replacing all local key handling with a new security model in one pass.
