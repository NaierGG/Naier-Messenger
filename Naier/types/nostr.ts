export interface NostrKeyPair {
  privkey: string; // hex
  pubkey: string; // hex
  npub: string; // bech32
  nsec: string; // bech32
}

export interface NostrProfile {
  pubkey: string;
  name?: string;
  displayName?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  nip05Verified?: boolean;
  lud16?: string;
  createdAt: number;
}

export type MessageStatus = "sending" | "sent" | "failed";

export interface NostrMessage {
  id: string;
  pubkey: string;
  recipientPubkey: string;
  content: string;
  createdAt: number;
  isMine: boolean;
  status: MessageStatus;
}

export interface NostrRelay {
  url: string;
  status: "connecting" | "connected" | "disconnected" | "error";
  latency?: number;
}

export interface Conversation {
  pubkey: string;
  lastMessage?: NostrMessage;
  unreadCount: number;
  updatedAt: number;
}

export interface Contact {
  pubkey: string;
  addedAt: number;
}
