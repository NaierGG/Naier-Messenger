import type { Event as NostrEvent } from "nostr-tools";
import { finalizeEvent } from "nostr-tools";
import { NOSTR_KINDS } from "@/constants";
import { decryptMessage } from "@/lib/nostr/crypto";
import { hexToBytes } from "@/lib/nostr/keys";
import type { MessageStatus, NostrMessage, NostrProfile } from "@/types/nostr";

function removeUndefinedFields<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as Partial<T>;
}

export function createDMEvent(
  encryptedContent: string,
  senderPrivkey: string,
  recipientPubkey: string
): NostrEvent {
  return finalizeEvent(
    {
      kind: NOSTR_KINDS.DM,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", recipientPubkey]],
      content: encryptedContent
    },
    hexToBytes(senderPrivkey)
  );
}

export function parseIncomingDM(
  event: NostrEvent,
  myPrivkey: string,
  myPubkey: string
): NostrMessage | null {
  if (event.kind !== NOSTR_KINDS.DM) {
    return null;
  }

  const taggedRecipient = event.tags.find((tag) => tag[0] === "p")?.[1];
  const isMine = event.pubkey === myPubkey;
  const recipientPubkey = isMine ? taggedRecipient ?? "" : myPubkey;
  const content = decryptMessage(event.content, myPrivkey, event.pubkey);

  return {
    id: event.id,
    pubkey: event.pubkey,
    recipientPubkey,
    content,
    createdAt: event.created_at,
    isMine,
    status: "sent"
  };
}

export function createProfileEvent(
  profile: Partial<NostrProfile>,
  privkey: string
): NostrEvent {
  const content = JSON.stringify(removeUndefinedFields(profile));

  return finalizeEvent(
    {
      kind: NOSTR_KINDS.METADATA,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content
    },
    hexToBytes(privkey)
  );
}

export function createOptimisticMessage(
  content: string,
  myPubkey: string,
  recipientPubkey: string,
  status: MessageStatus = "sending"
): NostrMessage {
  return {
    id: crypto.randomUUID(),
    pubkey: myPubkey,
    recipientPubkey,
    content,
    createdAt: Date.now(),
    isMine: true,
    status
  };
}
