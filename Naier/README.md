# Naier

Naier is a decentralized messaging client for Nostr focused on direct, relay-based conversations and local-first control.

Built with Next.js, React, TypeScript, Zustand, and `nostr-tools`, Naier aims to provide a lightweight messaging experience where identity comes from your keypair and network transport comes from Nostr relays.

The current project goal is to provide a lightweight web messenger that lets a user:

- sign in with an existing Nostr key or generated key,
- manage relay connections,
- browse direct-message conversations,
- send encrypted direct messages,
- cache keys, profiles, and messages locally for a smoother experience.

This repository is currently closer to an early MVP than a production-ready messenger. The core UI structure and local state model exist, but security hardening, protocol completeness, and reliability work are still needed.

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
- Nostr event creation and publication,
- relay selection and relay status UI,
- local caching for messages and profiles,
- account and settings screens,
- profile display components.

Not implemented or not complete:

- end-to-end protocol validation for all modern Nostr DM standards,
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

### Type check

```bash
npm run typecheck
```

### Production build

```bash
npm run build
npm run start
```

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

The project ships with a default relay list in code. Users can add and remove relays from the UI, and the active `nostrClient` instance is updated in memory. At the moment, relay configuration is not persisted across reloads: `chat/layout.tsx` reinitializes relay state from the default list on mount.

Relay behavior should still be treated as unstable until the following are improved:

- validation and normalization of relay URLs,
- better connection health reporting,
- reconnect and backoff strategies,
- read/write relay separation,
- relay list persistence and migration policy.

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
