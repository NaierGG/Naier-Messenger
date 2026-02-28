# Setup

## Purpose

This document explains how to run the project locally, what assumptions the current code makes, and what to verify before asking an AI assistant or collaborator to work on the app.

## Requirements

- Node.js 18+
- npm
- a modern browser with IndexedDB and localStorage support
- internet access to connect to public Nostr relays during runtime

## Install Dependencies

```bash
npm install
```

## Environment Variables

Current known variable:

```env
NEXT_PUBLIC_APP_NAME="Naier"
```

Notes:

- this app currently appears to use only public client-side environment variables,
- avoid introducing secrets into `NEXT_PUBLIC_*` variables,
- if new env vars are added later, document purpose, default, and whether they are required.

## Start Development Server

```bash
npm run dev
```

Open the app in the local browser after the server starts.

## Available Scripts

- `npm run dev`: start development server
- `npm run build`: create production build
- `npm run start`: start production server
- `npm run typecheck`: run TypeScript type checking
- `npm run init:dirs`: shell helper to create folders if needed

## First-Run Manual Verification

After starting the project, verify these flows:

1. Landing page renders.
2. Key setup UI works.
3. Successful login redirects to `/chat`.
4. Chat layout renders without crashing.
5. Settings pages open.
6. Relay list UI loads.
7. A test direct message can be composed.

## Browser Storage Expectations

The app currently stores sensitive and non-sensitive data in browser-managed storage.

Likely storage usage:

- `localStorage`: auth-related key material
- cookie: lightweight logged-in marker for route/session convenience
- IndexedDB: cached messages and profiles
- in-memory Zustand store: relay list, chat state, profile state, UI state

When debugging:

- clear storage when auth or cache state becomes inconsistent,
- inspect whether cookie and local key state match,
- verify IndexedDB data after message send/receive flows.

## Common Local Issues

### Blank or incorrect auth state after refresh

Check:

- whether keys exist in `localStorage`,
- whether `authStore.hydrate()` is being called in the expected route lifecycle,
- whether middleware is relying on a cookie that no longer matches local state.

### Messages appear locally but do not propagate

Check:

- relay connectivity,
- recipient pubkey validity,
- encryption / event creation errors,
- whether publish failures are being swallowed.

### Message list ordering looks wrong

Check:

- cache merge order,
- `createdAt` units and consistency,
- duplicate event insertion across optimistic and live paths.

### Relay settings look updated but behavior does not change

Check:

- source of truth for relay list,
- whether the Nostr client updates relay URLs after settings changes,
- persistence and rehydration of relay configuration.

Current limitation:

- relay settings are currently reset from `DEFAULT_RELAYS` when the chat layout mounts.

## Before Requesting AI Help

Provide the following context if possible:

- exact broken screen or route,
- expected behavior,
- actual behavior,
- recent code changes,
- whether the issue happens after refresh or only in-session,
- whether browser storage was cleared,
- whether the problem is relay-specific or general.

This reduces wasted time and makes AI guidance materially better.
