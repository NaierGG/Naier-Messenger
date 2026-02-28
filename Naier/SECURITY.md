# Security

## Status

This repository is not yet hardened for production use.

It handles private-key-based identity in the browser and communicates directly with untrusted public relays. That combination requires careful review before any public deployment.

## How To Report A Vulnerability

Until a dedicated security contact is established, do not open a public issue containing:

- private keys,
- session data,
- reproducible exploit payloads that expose user secrets,
- screenshots containing `nsec` values.

Preferred temporary process:

1. Prepare a minimal description of the issue.
2. State impact, affected files, and reproduction steps.
3. Redact all sensitive values.
4. Share privately with the repository owner.

## Current Security Model

The current design appears to assume:

- identity is derived from a locally stored Nostr keypair,
- route gating is assisted by a browser cookie,
- the browser is trusted enough to hold key material,
- relay operators are not trusted,
- cache contents are local convenience data, not authoritative truth.

## Known Security Risks

### 1. Private Keys In Browser Storage

`lib/storage/keyStorage.ts` stores:

- private key
- public key
- `npub`
- `nsec`

in `localStorage`.

Risk:

- any XSS or local device compromise can expose keys,
- shared machines materially increase exposure,
- browser extensions may also expand the attack surface.

### 2. Cookie Is Not A Secure Session

`store/authStore.ts` writes a `nostr_logged_in=true` cookie. `middleware.ts` checks that cookie to protect `/chat/*` and `/settings/*`.

Risk:

- this cookie is only a convenience flag,
- it does not prove the key exists or is valid,
- cookie and local key state can drift apart.

### 3. Relay Data Is Untrusted

The app consumes data from public relays.

Risk:

- duplicate events,
- stale metadata,
- malicious or malformed content,
- relay downtime,
- inconsistent behavior across relays.

### 4. Protocol Target Is Still In Flux

The code defines constants for multiple DM-related kinds, but the active send/subscribe flow is centered on kind `14`.

Risk:

- interoperability problems,
- parsing mismatches,
- incorrect assumptions about encryption and recipient semantics.

### 5. Sensitive Data Exposure In UI

Account screens can reveal `nsec` on demand.

Risk:

- shoulder surfing,
- accidental disclosure during streaming or screen sharing,
- screenshots leaking credentials.

## Security-Sensitive Files

Review these carefully before changing them:

- `lib/nostr/crypto.ts`
- `lib/nostr/events.ts`
- `lib/nostr/keys.ts`
- `lib/storage/keyStorage.ts`
- `store/authStore.ts`
- `middleware.ts`

## Practical Safe-Use Guidance

If using the current project locally:

- use a low-risk development key, not a valuable personal identity key,
- avoid using the app on shared or unmanaged devices,
- do not paste real production secrets into logs or screenshots,
- clear browser storage after testing if the machine is not trusted.

## Recommended Security Improvements

Short-term:

1. Eliminate redundant key writes and clarify the single source of truth for auth bootstrap.
2. Document the exact Nostr DM protocol target.
3. Validate and sanitize all relay- and profile-derived content paths.
4. Review whether secret visibility UX should require an extra confirmation.

Medium-term:

1. Rework key storage to reduce exposure.
2. Tighten auth bootstrap so cookie and key state cannot silently diverge.
3. Add tests for cryptographic helpers and event parsing behavior.
4. Add a clear incident-reporting process.

## Scope Note

This file documents repository-level risks and process. It is not a formal audit and should not be read as a claim that the current implementation is secure.
