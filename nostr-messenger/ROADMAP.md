# Roadmap

## Guiding Priorities

This roadmap is ordered by product risk, not by visual polish.

The main principle is simple: do not add more surface area until messaging correctness and key safety are defensible.

## Phase 1: Stabilize The Core

### 1. Define The Target Messaging Standard

Decide exactly which Nostr DM approach this project supports now and next.

Tasks:

- document target NIP(s),
- list unsupported message types explicitly,
- align event creation and parsing with that decision,
- identify migration path if moving from legacy DMs to newer wrapped/sealed models.

Why this matters:

- without a protocol target, every future messaging fix is ambiguous.

### 2. Make Auth State Deterministic

Tasks:

- verify hydration flow on refresh,
- verify middleware and cookie assumptions,
- ensure logout fully clears all sensitive local data,
- prevent partial-auth states where cookie and key storage disagree.

### 3. Harden Message Send/Receive Lifecycle

Tasks:

- map optimistic messages to published event IDs,
- improve retry behavior for failed sends,
- handle duplicate relay events,
- verify message ordering across cache and live events,
- surface relay publish failures clearly.

## Phase 2: Improve Reliability

### 4. Relay Management That Actually Holds Up

Tasks:

- normalize relay URLs,
- deduplicate relay entries,
- persist relay settings reliably across reloads,
- show live connection status per relay,
- define read vs write relay strategy,
- add reconnect/backoff behavior.

### 5. Cache Integrity

Tasks:

- document IndexedDB schema,
- validate merge semantics between cache and live events,
- add timestamps/versioning where needed,
- prevent corrupted or stale cache from breaking chat views.

### 6. Profile Consistency

Tasks:

- tighten cache TTL behavior,
- improve invalid profile handling,
- define when relay-fetched profile data overrides cached data,
- support better fallback names and avatars.

## Phase 3: Security And Developer Quality

### 7. Key Handling Improvements

Tasks:

- review whether `localStorage` remains acceptable for the intended audience,
- explore safer storage strategies,
- reduce the number of places sensitive values are copied in memory,
- document threat model and accepted risks.

### 8. Automated Testing

Tasks:

- add tests for pure Nostr event helpers,
- add tests for store update logic,
- add tests for cache merge behavior,
- add smoke coverage for main route flows where practical.

### 9. Error Handling And Observability

Tasks:

- make failures actionable in UI,
- centralize unexpected error reporting strategy,
- improve boundary behavior for relay, cache, and profile failures.

## Phase 4: Product Maturity

### 10. Better Conversation UX

Possible items:

- retry failed messages,
- message resend controls,
- better unread behavior,
- conversation search,
- improved empty states and onboarding.

### 11. Advanced Messaging Features

Possible items:

- attachments,
- reply threading,
- richer profile views,
- multi-device expectations,
- notification strategy.

These should wait until the core messaging model is reliable.

## Recommended Next 5 Tasks

1. Document the exact Nostr DM standard target and adjust code to match it.
2. Audit auth hydration and middleware behavior across refresh and logout.
3. Verify incoming subscription flow and deduplication strategy.
4. Persist relay settings instead of reinitializing from defaults on chat layout mount.
5. Add tests around `chatStore`, `authStore`, and `lib/nostr/events.ts`.
