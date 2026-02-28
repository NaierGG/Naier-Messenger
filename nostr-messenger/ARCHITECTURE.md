# Architecture

## Overview

`nostr-messenger` is a client-heavy web application that uses Nostr relays as the network transport layer for decentralized direct messaging.

At a high level, the system is composed of:

- route-level UI in the Next.js App Router,
- reusable presentational and interactive React components,
- Zustand stores for client state,
- Nostr helpers for key, relay, profile, crypto, and event operations,
- browser persistence for keys, messages, and profile caches.

There is currently no dedicated backend service in this repository.

## Architectural Priorities

The codebase appears optimized for:

- fast iteration on an MVP,
- keeping protocol logic on the client,
- isolating Nostr-related operations under `lib/nostr`,
- separating UI state, auth state, relay state, and chat state,
- maintaining a usable offline-ish local cache for recent data.

## Top-Level Modules

### `app/`

Contains route entry points, layout files, loading states, and error states.

Important routes:

- `/`: landing and key setup
- `/chat`: chat shell / empty state
- `/chat/[pubkey]`: 1:1 conversation view
- `/chat/new`: new DM creation flow
- `/settings`: settings hub
- `/settings/relays`: relay management
- `/settings/account`: account management
- `/profile/[pubkey]`: profile screen

### `components/`

Contains UI building blocks grouped by concern:

- `auth/`: key setup, key display, logout
- `chat/`: conversation list, message list, message input, status, empty states
- `common/`: reusable primitives such as modal, toast, avatar, spinner
- `layout/`: navigation and screen chrome
- `profile/`: profile avatar, badge, card
- `relay/`: relay status and relay list items

### `store/`

Zustand stores model client-side state:

- `authStore.ts`: login state and persisted key hydration
- `chatStore.ts`: messages, conversations, unread state, cache hydration
- `relayStore.ts`: active relay list and relay-related state
- `profileStore.ts`: profile data and cache behavior
- `uiStore.ts`: transient UI concerns such as toasts

### `hooks/`

Hooks coordinate UI with state and side effects:

- `useMessages.ts`: chat send flow and cached message loading
- `useNostrSubscribe.ts`: relay subscription behavior
- `useProfile.ts`: profile fetch / cache behavior
- `useRelayStatus.ts`: relay connectivity status
- `useScrollBottom.ts`: chat scroll behavior
- `useToast.ts`: toast access

### `lib/nostr/`

Protocol-facing logic:

- `client.ts`: relay pool management and subscriptions
- `events.ts`: event creation and incoming DM parsing
- `crypto.ts`: message encryption/decryption
- `keys.ts`: key conversion helpers
- `profile.ts`: metadata handling
- `nip05.ts`: NIP-05 support
- `relays.ts`: relay helper values and utilities

### `lib/storage/`

Browser persistence layer:

- `keyStorage.ts`: local key persistence in `localStorage`
- `messageCache.ts`: message persistence
- `profileCache.ts`: cached profile persistence
- `indexedDb.ts`: IndexedDB helper setup

## Current Data Flow

## 1. Authentication / Session Bootstrap

1. User lands on `/`.
2. `KeySetup` handles either key input or generation flow.
3. Keys are written to browser storage through `saveKeys`.
4. `authStore` updates in-memory auth state and sets a simple auth cookie.
5. Logged-in users are redirected to `/chat`.

Notes:

- `middleware.ts` protects `/chat/*` and `/settings/*` only by checking whether the `nostr_logged_in=true` cookie exists.
- `app/providers.tsx` hydrates auth state from browser storage on the client after render.
- The cookie is used for route-level auth gating convenience, not as a secure session token.
- The real identity source is the locally stored key material.

## 2. Sending a Direct Message

1. User opens `/chat/[pubkey]`.
2. `useMessages(recipientPubkey)` exposes current messages and `sendMessage`.
3. `sendMessage` validates content length and auth state.
4. An optimistic local message is created immediately.
5. The optimistic message is inserted into `chatStore`.
6. The message is cached locally.
7. The plaintext is encrypted with sender private key and recipient public key.
8. A Nostr DM event is created and signed.
9. `nostrClient.publish` sends the event to configured relays.
10. On success, the optimistic message status becomes `sent`.
11. On failure, the message status becomes `failed` and a toast is shown.

Key implication:

- Local UI updates happen before network acknowledgment, so cache and relay state can temporarily diverge.

## 3. Receiving / Hydrating Messages

The current implementation uses a split approach:

- cached messages are loaded first from browser storage,
- relay subscriptions and incoming event parsing then enrich in-memory state,
- conversation unread counts are derived in `chatStore`.

Important current behavior:

- cached messages are merged by message ID,
- conversation ordering is derived from latest message timestamp,
- read state is local to the client.
- incoming subscription setup happens inside `useNostrSubscribe`, which is mounted from `app/chat/layout.tsx`.
- `subscribeDMs` currently filters events by `kinds: [14]` and `#p: [myPubkey]`.

## 4. Profile Resolution

Profile data is fetched from relays and cached locally to reduce repeated lookups.

Expected path:

- UI needs profile for a pubkey,
- profile hook/store checks local cache,
- cache freshness is evaluated,
- relay fetch is used when cache is missing or stale,
- UI is updated with resolved metadata.

## 5. Relay Management

Relay URLs are defined by defaults and user-managed settings.

The app currently needs stronger guarantees around:

- normalization,
- duplicate suppression,
- status reporting,
- persistence semantics,
- distinguishing read and write relays.

Concrete current behavior:

- `relayStore.initRelays()` resets relay state from `DEFAULT_RELAYS`.
- `RelayList` can add and remove relay URLs in-memory.
- `nostrClient.updateRelays()` updates the shared client instance with the current list.
- relay settings are not persisted across full page reloads.

## State Ownership

The intended state ownership is:

- auth identity: `authStore`
- message timeline and conversations: `chatStore`
- relay configuration and status: `relayStore`
- profile cache and profile records: `profileStore`
- transient UI feedback: `uiStore`

This is a good pattern for the project because it keeps route components relatively thin.

## Browser Persistence Model

### `localStorage`

Used for key material:

- private key
- public key
- `npub`
- `nsec`

Risk:

- `localStorage` is convenient but not a hardened secret store.

### IndexedDB

Used for larger structured client-side data such as:

- cached messages
- cached profiles

Benefit:

- better suited than `localStorage` for evolving local datasets.

Concrete schema details:

- database name: `nostr-messenger`
- database version: `1`
- object stores: `messages`, `profiles`
- message index: `by_conversation` on `recipientPubkey`

## Routing Model

The app uses Next.js App Router, which means:

- route layouts can preserve UI shell state,
- loading boundaries can be route-specific,
- client components handle a large part of the interaction model,
- hydration order matters when auth or cache state is initialized in effects.

## Known Architectural Gaps

The following concerns should be treated as active design gaps rather than solved problems:

- which exact Nostr DM standard is the long-term target,
- how relay subscriptions are resumed or recovered,
- how duplicate events are reconciled across relays,
- how local optimistic IDs map cleanly to published event IDs,
- how auth cookie and local key hydration interact during refresh/navigation,
- the current `messages` store indexes by `recipientPubkey`, which is convenient for sent messages but should be reviewed carefully for received-message query behavior,
- how to migrate to safer key storage if the project matures.

## Recommended Near-Term Direction

Short-term architecture work should focus on:

1. making message sync deterministic,
2. documenting and enforcing the target NIP(s),
3. tightening key-handling boundaries,
4. improving relay state and reconnect behavior,
5. adding tests around stores and pure helpers.
