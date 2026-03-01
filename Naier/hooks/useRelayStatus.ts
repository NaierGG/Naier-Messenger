"use client";

import type { NostrRelay } from "@/types/nostr";
import { useRelayStore } from "@/store/relayStore";

export function useRelayStatus(): {
  relays: NostrRelay[];
  connectedCount: number;
  totalCount: number;
  isConnected: boolean;
  overallStatus: "connecting" | "connected" | "degraded" | "offline";
} {
  const relays = useRelayStore((state) => state.relays);
  const connectedCount = relays.filter((relay) => relay.status === "connected").length;
  const totalCount = relays.length;
  const hasConnectingRelay = relays.some((relay) => relay.status === "connecting");
  const hasErroredRelay = relays.some((relay) => relay.status === "error");
  const overallStatus =
    hasConnectingRelay && connectedCount === 0
      ? "connecting"
      : connectedCount === 0
        ? "offline"
        : hasErroredRelay || connectedCount < totalCount
          ? "degraded"
          : "connected";

  return {
    relays,
    connectedCount,
    totalCount,
    isConnected: connectedCount > 0,
    overallStatus
  };
}
