# Naier

Naier is a decentralized messaging client for Nostr focused on direct, relay-based conversations and local-first control.

Built with Next.js, React, TypeScript, Zustand, and `nostr-tools`, Naier aims to provide a lightweight messaging experience where identity comes from your keypair and network transport comes from Nostr relays.

The current project goal is to provide a lightweight web messenger that lets a user:

- sign in with an existing Nostr key or generated key,
- manage relay connections,
- browse direct-message conversations,
- send encrypted direct messages,
- cache keys, profiles, and messages locally for a smoother experience.

This repository is currently closer to an early MVP than a production-ready messenger. The core UI structure and local state model exist, but security hardening and long-term protocol hardening are still needed.

## Current DM Protocol Target

Naier's active DM implementation is currently centered on:

- `kind 14` rumors for message content,
- `kind 13` seals and `kind 1059` gift wraps for transport,
- `kind 10050` DM inbox relay lists for relay discovery,
- local optimistic message state on top of relay acknowledgements.

That means the current target is the modern wrapped DM flow, not legacy NIP-04 plaintext DMs. NIP-04 interoperability is not implemented in this repository right now.

## Why This Project Exists

Most messaging products are either centralized or opinionated around a single server network. Nostr offers a relay-based decentralized event model, which makes it possible to build messaging clients that:

- do not depend on a single backend controlled by one operator,
- allow users to move across relays,
- use public/private keys as identity,
- can interoperate with the wider Nostr ecosystem.

This project focuses specifically on direct messaging UX rather than a full social client.

## Current Scope

Implemented or partially implemented:

- key-based login and local key persistence,
- chat layout and conversation UI,
- direct-message compose flow,
- message requests for unknown inbound contacts,
- local reject/block controls for inbound requests,
- DM relay diagnostics for missing `kind 10050` recipient policy,
- Nostr event creation and publication,
- relay selection and relay status UI,
- relay failover, cooldown blacklisting, and recent-message resync,
- local caching for messages and profiles,
- account and settings screens,
- profile display components.

Not implemented or not complete:

- interoperability with multiple Nostr DM standards beyond the current wrapped DM target,
- robust message sync across reconnects and multiple relays,
- delivery receipts and read receipts,
- message deduplication across relays at scale,
- attachment handling,
- search across large message history,
- secure production-grade key management,
- comprehensive tests,
- backend services, moderation tools, or push infrastructure.

## Tech Stack

- Framework: Next.js 14 App Router
- UI: React 18, Tailwind CSS
- Language: TypeScript
- State: Zustand with Immer middleware
- Protocol: `nostr-tools`
- Local persistence: `localStorage` and IndexedDB (`idb`)

## Project Structure

```text
app/                Route-level UI and pages
components/         Reusable UI components
constants/          App-wide constants such as event kinds and storage keys
hooks/              Client hooks for messages, subscriptions, profiles, UI
lib/nostr/          Nostr client, event, crypto, relay, profile helpers
lib/storage/        Browser persistence helpers for keys, messages, profile cache
store/              Zustand stores for auth, chat, relay, profile, UI state
types/              Shared TypeScript types
public/             Static assets
```

## Key Product Assumptions

- The app is currently browser-first and client-only for most sensitive logic.
- Private keys are stored locally in the browser at the moment.
- Relay communication is done directly from the client.
- The main user flow is 1:1 messaging by Nostr pubkey.
- Reliability is preferred over aggressive abstraction during the MVP phase.

## Local Development

### Requirements

- Node.js 18 or later
- npm

### Install

```bash
npm install
```

### Environment

Current local env example:

```env
NEXT_PUBLIC_APP_NAME="Naier"
```

### Run

```bash
npm run dev
```

Open `http://localhost:3000` after the dev server starts.

### Type check

```bash
npm run typecheck
```

### Production build

```bash
npm run build
npm run start
```

## Invite Links

Naier supports direct invite links using the `/add/<npub>` route.

Invite flow:

- signed-in users can open `/invite` and copy a shareable invite link,
- opening `/add/<npub>` renders a confirmation screen directly,
- after confirmation, the contact is stored locally and Naier opens a DM with that pubkey,
- if the recipient is not signed in yet, Naier sends them through key setup and returns them to the same invite automatically.

Current MVP scope:

- contact persistence is local to the current browser,
- unknown inbound DMs stay in a request state until accepted,
- rejected requests are hidden locally and blocked contacts are ignored locally,
- direct invite links are the primary sharing path,
- QR-based sharing is not included in this pass.

## Security Notes

This project should not be treated as production-safe in its current form.

Important concerns:

- private keys are persisted in browser storage,
- the login cookie is only a lightweight route gate and is not a secure session,
- there is no hardened session model,
- there is no server-side secret isolation,
- modern Nostr messaging standards may not be fully implemented,
- relay trust, relay availability, and metadata authenticity are not fully handled,
- local device compromise would expose stored credentials.

Before a public launch, key handling and protocol correctness need a dedicated security review.

## Relay Model

The project ships with a default relay list in code. Users can add and remove relays from the UI, and the active `nostrClient` instance updates immediately while the relay preference is persisted locally.

Relay behavior currently includes:

- per-relay connection and publish metrics,
- cooldown-based avoidance for unhealthy relays,
- publish retry/failover across healthy relays,
- a manual resync action for the last 24 hours of wrapped DMs.
- recipient DM inbox relay lookup via `kind 10050`, with chat-level warnings when fallback delivery is being used.

Still incomplete:

- read/write relay separation,
- longer-term relay reputation scoring,
- NIP-07 support,
- encrypted local key storage,
- offline inbox fallback.

Current defaults in `constants/index.ts`:

- `wss://relay.damus.io`
- `wss://relay.nostr.band`
- `wss://nos.lol`
- `wss://relay.snort.social`
- `wss://nostr.wine`

## What AI Assistants Should Help With

This repository is a good fit for AI-assisted work in the following areas:

- bug fixing in UI, stores, and hooks,
- refactoring duplicated state logic,
- improving Nostr event flow,
- adding tests,
- writing documentation,
- reviewing security risks,
- improving message synchronization and cache consistency.

AI should avoid making blind protocol changes without checking the current Nostr spec being targeted by the project.

## Documentation Index

- `AGENTS.md`: repository-specific AI working rules
- `ARCHITECTURE.md`: technical architecture and data flow
- `CURRENT_STATUS.md`: what works, what is incomplete, and what is blocking
- `ROADMAP.md`: prioritized next steps
- `SETUP.md`: local setup details and operational notes
- `CONTRIBUTING.md`: workflow and contribution rules

## License

This project is intended to use the MIT License. See the root repository `LICENSE` file.
