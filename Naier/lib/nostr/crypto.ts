import * as nip44 from "nostr-tools/nip44";
import { hexToBytes } from "@/lib/nostr/keys";

function getConversationKey(privateKey: string, peerPubkey: string): Uint8Array {
  return nip44.getConversationKey(hexToBytes(privateKey), peerPubkey);
}

export function encryptJsonPayload(
  payload: unknown,
  senderPrivkey: string,
  recipientPubkey: string
): string {
  return nip44.encrypt(JSON.stringify(payload), getConversationKey(senderPrivkey, recipientPubkey));
}

export function decryptJsonPayload<T>(
  encryptedContent: string,
  recipientPrivkey: string,
  senderPubkey: string
): T {
  const plaintext = nip44.decrypt(
    encryptedContent,
    getConversationKey(recipientPrivkey, senderPubkey)
  );

  return JSON.parse(plaintext) as T;
}
