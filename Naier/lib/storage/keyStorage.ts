import { STORAGE_KEYS } from "@/constants";
import type { NostrKeyPair } from "@/types/nostr";

// Browser-only storage helpers. Guard every localStorage access because these
// functions may be imported in modules that are evaluated during SSR.

export function saveKeys(keyPair: NostrKeyPair): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.PRIVKEY, keyPair.privkey);
  window.localStorage.setItem(STORAGE_KEYS.PUBKEY, keyPair.pubkey);
  window.localStorage.setItem(STORAGE_KEYS.NPUB, keyPair.npub);
  window.localStorage.setItem(STORAGE_KEYS.NSEC, keyPair.nsec);
}

export function loadKeys(): NostrKeyPair | null {
  if (typeof window === "undefined") {
    return null;
  }

  const privkey = window.localStorage.getItem(STORAGE_KEYS.PRIVKEY);
  const pubkey = window.localStorage.getItem(STORAGE_KEYS.PUBKEY);
  const npub = window.localStorage.getItem(STORAGE_KEYS.NPUB);
  const nsec = window.localStorage.getItem(STORAGE_KEYS.NSEC);

  if (!privkey || !pubkey || !npub || !nsec) {
    return null;
  }

  return {
    privkey,
    pubkey,
    npub,
    nsec
  };
}

export function clearKeys(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.PRIVKEY);
  window.localStorage.removeItem(STORAGE_KEYS.PUBKEY);
  window.localStorage.removeItem(STORAGE_KEYS.NPUB);
  window.localStorage.removeItem(STORAGE_KEYS.NSEC);
}
