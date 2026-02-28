# API

## Overview

This repository currently exposes no custom HTTP API routes and no backend RPC surface.

The main "API" of the application is a combination of:

- Next.js route pages,
- client-side hooks and stores,
- browser persistence helpers,
- Nostr relay interactions performed directly from the browser.

## Server API Surface

Current status:

- no `app/api/*` routes are present,
- no custom REST endpoints are defined,
- no GraphQL endpoint is defined,
- no server-side auth API is defined.

Implication:

- all messaging behavior currently happens client-to-relay,
- there is no repository-local backend responsible for message storage or delivery.

## Route Surface

User-facing routes currently visible in the repository:

- `/`
- `/chat`
- `/chat/new`
- `/chat/[pubkey]`
- `/settings`
- `/settings/relays`
- `/settings/account`
- `/profile/[pubkey]`

## Client-Side Service Interfaces

## Nostr Client

File:

- `lib/nostr/client.ts`

Current public methods:

- `updateRelays(urls: string[]): void`
- `subscribeDMs(myPubkey, onEvent, onEose): () => void`
- `publish(event): Promise<{ success: boolean; error?: string }>`
- `fetchProfile(pubkey): Promise<Event | null>`
- `disconnect(): void`

Current behavior notes:

- uses `SimplePool` from `nostr-tools`,
- subscribes to DMs using kind `14` with `#p` filtering,
- publishes to the current in-memory relay list,
- profile fetch reads metadata events from relays.

## Event Helpers

File:

- `lib/nostr/events.ts`

Current public helpers:

- `createDMEvent(encryptedContent, senderPrivkey, recipientPubkey)`
- `parseIncomingDM(event, myPrivkey, myPubkey)`
- `createProfileEvent(profile, privkey)`
- `createOptimisticMessage(content, myPubkey, recipientPubkey, status?)`

## Storage Interfaces

### Key Storage

File:

- `lib/storage/keyStorage.ts`

Methods:

- `saveKeys(keyPair): void`
- `loadKeys(): NostrKeyPair | null`
- `clearKeys(): void`

Backend:

- `localStorage`

### Message Cache

File:

- `lib/storage/messageCache.ts`

Methods:

- `initDB(): Promise<IDBPDatabase<...>>`
- `saveMessage(msg): Promise<void>`
- `getMessages(conversationPubkey): Promise<NostrMessage[]>`
- `clearAll(): Promise<void>`

Backend:

- IndexedDB database `naier`
- object store `messages`

### Profile Cache

File:

- `lib/storage/profileCache.ts`

Methods:

- `saveProfile(pubkey, profile): Promise<void>`
- `getProfile(pubkey): Promise<NostrProfile | null>`
- `clearAll(): Promise<void>`

Backend:

- IndexedDB database `naier`
- object store `profiles`

## State Store Interfaces

Primary Zustand stores:

- `store/authStore.ts`
- `store/chatStore.ts`
- `store/relayStore.ts`
- `store/profileStore.ts`
- `store/uiStore.ts`

These act as the main in-process state API for the app.

## Auth Boundary

The route protection boundary is currently implemented in:

- `middleware.ts`

Behavior:

- `/chat/*` and `/settings/*` require `nostr_logged_in=true` cookie
- this is not equivalent to a verified secure session

## Integration Guidance

If a future backend API is added, document at minimum:

1. endpoint path
2. request method
3. request body schema
4. response schema
5. auth requirements
6. failure modes

Until then, changes described as "API changes" in this repository usually mean changes to:

- Nostr event behavior,
- storage helpers,
- Zustand store contracts,
- route-level component props and expectations.
