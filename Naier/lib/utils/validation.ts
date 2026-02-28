import { nip19 } from "nostr-tools";

const relayPattern = /^wss?:\/\/.+/i;
const nip05Pattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;

function isValidBech32Key(value: string, expectedType: "npub" | "nsec"): boolean {
  const trimmed = value.trim();

  if (!trimmed.startsWith(`${expectedType}1`)) {
    return false;
  }

  try {
    const decoded = nip19.decode(trimmed);
    return decoded.type === expectedType;
  } catch {
    return false;
  }
}

export function isValidNpub(npub: string): boolean {
  return isValidBech32Key(npub, "npub");
}

export function isValidNsec(nsec: string): boolean {
  return isValidBech32Key(nsec, "nsec");
}

export function isValidRelayUrl(url: string): boolean {
  return relayPattern.test(url.trim());
}

export function isValidNip05(nip05: string): boolean {
  return nip05Pattern.test(nip05.trim());
}
