# Changelog

All notable changes to this project should be documented in this file.

The format is loosely based on Keep a Changelog and uses simple dated sections until formal versioning is established.

## Unreleased

### Added

- repository documentation for project overview, architecture, setup, contribution workflow, current status, roadmap, and AI agent guidance
- security policy draft in `SECURITY.md`
- API surface documentation in `API.md`
- relay reliability layer with publish failover, per-relay metrics, and cooldown blacklisting
- manual 24-hour DM resync from the active wrapped-message relay set

### Documented

- current auth model based on browser storage plus a lightweight cookie gate
- current relay behavior, including in-memory updates and reset to defaults on chat layout mount
- IndexedDB schema basics for message and profile caching
- current ambiguity around the exact Nostr DM standard target

### Changed

- relay status surfaces now distinguish healthy, degraded, connecting, and offline states
- chat message dedupe now tracks seen message ids and uses a stable `createdAt` + `id` sort

## 0.1.0

Initial application scaffold and MVP messaging client structure.
