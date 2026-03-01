export const NOSTR_KINDS = {
  METADATA: 0,
  TEXT: 1,
  RELAY_LIST: 10002,
  DM_RELAY_LIST: 10050,
  DM: 14,
  DM_SEAL: 13,
  DM_GIFT_WRAP: 1059
} as const;

export const STORAGE_KEYS = {
  PRIVKEY: "nostr_privkey",
  PUBKEY: "nostr_pubkey",
  NPUB: "nostr_npub",
  NSEC: "nostr_nsec"
} as const;

export const PROFILE_CACHE_TTL = 24 * 60 * 60 * 1000;

export const MAX_MESSAGE_LENGTH = 65535;

export const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://nostr.wine"
];
