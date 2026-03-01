"use client";

import { useEffect, useMemo, useState } from "react";
import { nostrClient } from "@/lib/nostr/client";
import { useRelayStore } from "@/store/relayStore";

interface DmRelayDiagnosticsState {
  isLoading: boolean;
  recipientRelayUrls: string[];
}

export function useDmRelayDiagnostics(recipientPubkey: string): {
  isLoading: boolean;
  recipientRelayUrls: string[];
  hasPublishedInboxRelays: boolean;
  isUsingFallbackWriteRelays: boolean;
  localRelayUrls: string[];
  healthyRelayCount: number;
  totalRelayCount: number;
} {
  const relays = useRelayStore((state) => state.relays);
  const localRelayUrls = useMemo(() => relays.map((relay) => relay.url), [relays]);
  const healthyRelayCount = useMemo(
    () =>
      relays.filter(
        (relay) => !relay.cooldownUntil || relay.cooldownUntil <= Date.now()
      ).length,
    [relays]
  );
  const [state, setState] = useState<DmRelayDiagnosticsState>({
    isLoading: false,
    recipientRelayUrls: []
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!recipientPubkey) {
        setState({
          isLoading: false,
          recipientRelayUrls: []
        });
        return;
      }

      setState((current) => ({
        ...current,
        isLoading: true
      }));

      nostrClient.updateRelays(localRelayUrls);
      const recipientRelayUrls = await nostrClient.fetchInboxRelays(recipientPubkey);

      if (cancelled) {
        return;
      }

      setState({
        isLoading: false,
        recipientRelayUrls
      });
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [localRelayUrls, recipientPubkey]);

  return {
    isLoading: state.isLoading,
    recipientRelayUrls: state.recipientRelayUrls,
    hasPublishedInboxRelays: state.recipientRelayUrls.length > 0,
    isUsingFallbackWriteRelays: state.recipientRelayUrls.length === 0 && localRelayUrls.length > 0,
    localRelayUrls,
    healthyRelayCount,
    totalRelayCount: relays.length
  };
}
