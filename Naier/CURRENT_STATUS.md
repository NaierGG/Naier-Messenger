# Current Status

## Summary

The project is in an MVP/prototype stage. The app already has enough structure to demonstrate a decentralized messenger flow, but it is not yet at the level where protocol correctness, security, and sync reliability can be trusted without review.

## What Exists Right Now

### Product Surface

- landing screen with key setup entry,
- chat shell and conversation views,
- new direct-message flow,
- account settings and relay settings pages,
- profile screen,
- toasts, loading states, and error boundaries.

### Auth and Identity

- browser-side key persistence,
- in-memory auth state through Zustand,
- login cookie used for route/session convenience,
- logout flow that clears persisted keys.

Concrete notes:

- route protection currently depends on the `nostr_logged_in` cookie,
- actual key material is rehydrated client-side from `localStorage`,
- `KeySetup` currently calls both `saveKeys(...)` and `authStore.setKeys(...)`, while `setKeys(...)` also saves keys, so key persistence is currently duplicated during login/generation.

### Messaging

- optimistic message creation,
- encrypted DM event creation,
- event publishing through `nostr-tools` pool,
- local message cache hydration,
- message status transitions such as `sending`, `sent`, and `failed`.

Concrete notes:

- chat subscription is started from `app/chat/layout.tsx`,
- send flow writes optimistic messages to cache before relay publish resolves,
- incoming messages are parsed and then appended to store and cache,
- cache merge behavior deduplicates by message ID inside `chatStore.loadCachedMessages(...)`.

### Nostr Integration

- relay pool client,
- default relay list,
- profile fetch helpers,
- DM parse helpers,
- NIP-05 support scaffolding.

Concrete notes:

- `NOSTR_KINDS.DM` is currently set to `14`,
- additional constants exist for `DM_SEAL` (`13`) and `DM_GIFT_WRAP` (`1059`), but current subscription and send flow are still centered on kind `14`,
- this means the code already hints at newer DM models, but the active implementation is not yet fully aligned/documented.

### Local Persistence

- browser key storage,
- message cache,
- profile cache,
- IndexedDB support.

Concrete notes:

- IndexedDB database name is `naier`,
- relay configuration is not currently persisted,
- `messageCache.clearAll()` clears only the `messages` store,
- `profileCache.clearAll()` clears only the `profiles` store.

## What Appears Incomplete

### Protocol Confidence

- DM implementation details may not yet match the final intended modern Nostr DM approach.
- Event parsing assumptions should be validated against the exact NIP target.
- Relay behavior for duplicate or out-of-order events needs more explicit handling.

### Sync and Reliability

- reconnect behavior is not yet documented as robust,
- offline-to-online message reconciliation needs validation,
- optimistic message lifecycle may diverge from relay-confirmed state,
- cache merge strategy is present but needs broader edge-case coverage.

### Security

- private keys are stored in browser storage,
- there is no hardened session isolation,
- device compromise would expose credentials,
- threat modeling and secure storage migration are still open.

### Developer Experience

- no automated test suite is visible yet,
- no lint script is visible in `package.json`,
- protocol target and architectural constraints were not documented before these docs.

## Highest-Risk Areas

1. Key storage and auth lifecycle
2. Message encryption / decryption correctness
3. Nostr DM event compatibility and parsing
4. Relay subscription reliability
5. Message cache consistency across sessions

## What Is Most Likely To Need Work Next

- clarify the exact Nostr direct-message standard being targeted,
- stabilize message sync and incoming subscription flow,
- improve relay configuration behavior and health feedback,
- reduce security exposure around private key storage,
- add tests around critical stores and helpers.

## Suggested Immediate Audit Checklist

- confirm how keys are generated, imported, stored, and cleared,
- trace one full send-message flow from input to relay publish to cache,
- trace one full incoming-message flow from subscription to parse to store,
- review route guarding against refresh and hydration timing,
- inspect IndexedDB schema and migration behavior,
- verify current relay list source of truth.

## Definition Of "Usable MVP"

The project can be considered a usable MVP when all of the following are true:

- a user can reliably sign in, refresh, and remain in a consistent auth state,
- a user can send and receive DMs across a known set of relays,
- duplicate incoming events do not visibly corrupt chat history,
- failed sends are surfaced clearly and can be retried,
- relay settings persist and are actually applied,
- message history survives reloads without obvious corruption,
- core flows pass at least basic automated tests.

## Definition Of "Not Ready For Public Launch"

As of now, the app should be treated as not ready for a public launch if any of these remain true:

- keys are still only stored in plain browser storage,
- messaging protocol support is not clearly specified,
- there is no meaningful test coverage,
- there is no security review of cryptographic and storage behavior,
- relay failures can silently lose or duplicate visible chat state.
