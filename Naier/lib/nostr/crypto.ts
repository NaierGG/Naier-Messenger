import * as nip44 from "nostr-tools/nip44";
import { hexToBytes } from "@/lib/nostr/keys";

export function encryptMessage(
  content: string,
  senderPrivkey: string,
  recipientPubkey: string
): string {
  try {
    const conversationKey = nip44.getConversationKey(
      hexToBytes(senderPrivkey),
      recipientPubkey
    );

    return nip44.encrypt(content, conversationKey);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to encrypt message.");
  }
}

export function decryptMessage(
  encryptedContent: string,
  recipientPrivkey: string,
  senderPubkey: string
): string {
  try {
    const conversationKey = nip44.getConversationKey(
      hexToBytes(recipientPrivkey),
      senderPubkey
    );

    return nip44.decrypt(encryptedContent, conversationKey);
  } catch {
    return "[복호화 실패]";
  }
}
