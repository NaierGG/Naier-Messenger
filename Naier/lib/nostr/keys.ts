import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import type { NostrKeyPair } from "@/types/nostr";

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.trim().toLowerCase();

  if (normalized.length % 2 !== 0) {
    throw new Error("Invalid hex string length.");
  }

  if (!/^[0-9a-f]+$/.test(normalized)) {
    throw new Error("Invalid hex string.");
  }

  const bytes = new Uint8Array(normalized.length / 2);

  for (let index = 0; index < normalized.length; index += 2) {
    bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
  }

  return bytes;
}

export function generateKeyPair(): NostrKeyPair {
  const privateKeyBytes = generateSecretKey();
  const privkey = bytesToHex(privateKeyBytes);
  const pubkey = getPublicKey(privateKeyBytes);

  return {
    privkey,
    pubkey,
    nsec: nip19.nsecEncode(privateKeyBytes),
    npub: nip19.npubEncode(pubkey)
  };
}

export function nsecToKeyPair(nsec: string): NostrKeyPair {
  let decoded: ReturnType<typeof nip19.decode>;

  try {
    decoded = nip19.decode(nsec.trim());
  } catch {
    throw new Error("Invalid nsec.");
  }

  if (decoded.type !== "nsec" || !(decoded.data instanceof Uint8Array)) {
    throw new Error("Invalid nsec.");
  }

  const privkey = bytesToHex(decoded.data);
  const pubkey = getPublicKey(decoded.data);

  return {
    privkey,
    pubkey,
    nsec: nip19.nsecEncode(decoded.data),
    npub: nip19.npubEncode(pubkey)
  };
}

export function pubkeyToNpub(pubkey: string): string {
  return nip19.npubEncode(pubkey.trim().toLowerCase());
}

export function npubToPubkey(npub: string): string {
  let decoded: ReturnType<typeof nip19.decode>;

  try {
    decoded = nip19.decode(npub.trim());
  } catch {
    throw new Error("Invalid npub.");
  }

  if (decoded.type !== "npub" || typeof decoded.data !== "string") {
    throw new Error("Invalid npub.");
  }

  return decoded.data;
}
