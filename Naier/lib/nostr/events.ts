import {
  finalizeEvent,
  getEventHash,
  verifyEvent,
  type Event as NostrEvent,
  type UnsignedEvent
} from "nostr-tools";
import { createRumor, createSeal, createWrap } from "nostr-tools/nip59";
import { NOSTR_KINDS } from "@/constants";
import { decryptJsonPayload } from "@/lib/nostr/crypto";
import { hexToBytes } from "@/lib/nostr/keys";
import type { MessageStatus, NostrMessage, NostrProfile } from "@/types/nostr";

export interface NostrRumor extends UnsignedEvent {
  id: string;
  kind: typeof NOSTR_KINDS.DM;
  pubkey: string;
}

function removeUndefinedFields<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as Partial<T>;
}

function toUnixSeconds(value: number): number {
  return value > 1_000_000_000_000 ? Math.floor(value / 1000) : value;
}

function getRecipientTag(tags: string[][]): string | null {
  return tags.find((tag) => tag[0] === "p")?.[1] ?? null;
}

function isValidRumorShape(value: unknown): value is NostrRumor {
  if (!value || typeof value !== "object") {
    return false;
  }

  const rumor = value as Partial<NostrRumor>;

  return (
    rumor.kind === NOSTR_KINDS.DM &&
    typeof rumor.id === "string" &&
    typeof rumor.pubkey === "string" &&
    typeof rumor.created_at === "number" &&
    typeof rumor.content === "string" &&
    Array.isArray(rumor.tags)
  );
}

function isValidEventShape(value: unknown): value is NostrEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const event = value as Partial<NostrEvent>;

  return (
    typeof event.id === "string" &&
    typeof event.pubkey === "string" &&
    typeof event.created_at === "number" &&
    typeof event.kind === "number" &&
    typeof event.content === "string" &&
    Array.isArray(event.tags) &&
    typeof event.sig === "string"
  );
}

export function getConversationKey(pubkeyA: string, pubkeyB: string): string {
  return [pubkeyA.trim().toLowerCase(), pubkeyB.trim().toLowerCase()].sort().join(":");
}

export function createChatRumor(
  content: string,
  senderPrivkey: string,
  recipientPubkey: string,
  extraTags: string[][] = []
): NostrRumor {
  return createRumor(
    {
      kind: NOSTR_KINDS.DM,
      content,
      tags: [["p", recipientPubkey], ...extraTags]
    },
    hexToBytes(senderPrivkey)
  ) as NostrRumor;
}

export function createWrappedDMEvents(
  rumor: NostrRumor,
  senderPrivkey: string,
  senderPubkey: string,
  recipientPubkey: string
): { recipientWrap: NostrEvent; selfWrap: NostrEvent } {
  const privateKeyBytes = hexToBytes(senderPrivkey);
  const recipientSeal = createSeal(rumor, privateKeyBytes, recipientPubkey);
  const selfSeal = createSeal(rumor, privateKeyBytes, senderPubkey);

  return {
    recipientWrap: createWrap(recipientSeal, recipientPubkey),
    selfWrap: createWrap(selfSeal, senderPubkey)
  };
}

export function createOptimisticMessageFromRumor(
  rumor: NostrRumor,
  myPubkey: string,
  recipientPubkey: string,
  status: MessageStatus = "sending"
): NostrMessage {
  return {
    id: rumor.id,
    pubkey: myPubkey,
    recipientPubkey,
    peerPubkey: recipientPubkey,
    conversationKey: getConversationKey(myPubkey, recipientPubkey),
    content: rumor.content,
    createdAt: rumor.created_at,
    isMine: true,
    status
  };
}

export function buildRumorFromMessage(message: NostrMessage): NostrRumor {
  const rumor: NostrRumor = {
    id: message.id,
    pubkey: message.pubkey,
    kind: NOSTR_KINDS.DM,
    created_at: toUnixSeconds(message.createdAt),
    tags: [["p", message.recipientPubkey]],
    content: message.content
  };

  return rumor;
}

export function parseWrappedMessage(
  wrap: NostrEvent,
  myPrivkey: string,
  myPubkey: string
): NostrMessage | null {
  if (wrap.kind !== NOSTR_KINDS.DM_GIFT_WRAP) {
    return null;
  }

  if (!verifyEvent(wrap)) {
    return null;
  }

  const wrapRecipient = getRecipientTag(wrap.tags);
  if (wrapRecipient !== myPubkey) {
    return null;
  }

  let seal: NostrEvent;

  try {
    const decryptedSeal = decryptJsonPayload<unknown>(wrap.content, myPrivkey, wrap.pubkey);

    if (!isValidEventShape(decryptedSeal)) {
      return null;
    }

    seal = decryptedSeal;
  } catch {
    return null;
  }

  if (seal.kind !== NOSTR_KINDS.DM_SEAL || seal.tags.length > 0 || !verifyEvent(seal)) {
    return null;
  }

  let rumor: NostrRumor;

  try {
    const decryptedRumor = decryptJsonPayload<unknown>(seal.content, myPrivkey, seal.pubkey);

    if (!isValidRumorShape(decryptedRumor)) {
      return null;
    }

    rumor = decryptedRumor;
  } catch {
    return null;
  }

  if (seal.pubkey !== rumor.pubkey || rumor.kind !== NOSTR_KINDS.DM) {
    return null;
  }

  if (getEventHash(rumor) !== rumor.id) {
    return null;
  }

  const recipientPubkey = getRecipientTag(rumor.tags);

  if (!recipientPubkey) {
    return null;
  }

  const isMine = rumor.pubkey === myPubkey;
  const peerPubkey = isMine ? recipientPubkey : rumor.pubkey;

  if (!peerPubkey || (rumor.pubkey !== myPubkey && recipientPubkey !== myPubkey)) {
    return null;
  }

  return {
    id: rumor.id,
    pubkey: rumor.pubkey,
    recipientPubkey,
    peerPubkey,
    conversationKey: getConversationKey(myPubkey, peerPubkey),
    content: rumor.content,
    createdAt: rumor.created_at,
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

export function createInboxRelayListEvent(relayUrls: string[], privkey: string): NostrEvent {
  return finalizeEvent(
    {
      kind: NOSTR_KINDS.DM_RELAY_LIST,
      created_at: Math.floor(Date.now() / 1000),
      tags: [...new Set(relayUrls)].map((url) => ["relay", url]),
      content: ""
    },
    hexToBytes(privkey)
  );
}
