"use client";

import type { NostrRelay } from "@/types/nostr";
import { useRelayStore } from "@/store/relayStore";

export function useRelayStatus(): {
  relays: NostrRelay[];
  connectedCount: number;
  totalCount: number;
  isConnected: boolean;
} {
  const relays = useRelayStore((state) => state.relays);
  const connectedCount = relays.filter((relay) => relay.status === "connected").length;
  const totalCount = relays.length;

  return {
    relays,
    connectedCount,
    totalCount,
    isConnected: connectedCount > 0
  };
}
