"use client";

import { useEffect, useState } from "react";
import { createInboxRelayListEvent, parseWrappedMessage } from "@/lib/nostr/events";
import { nostrClient } from "@/lib/nostr/client";
import { saveMessage } from "@/lib/storage/messageCache";
import { useAuthStore } from "@/store/authStore";
import { chatStore } from "@/store/chatStore";
import { useRelayStore } from "@/store/relayStore";

export function useNostrSubscribe(): { isSubscribed: boolean } {
  const privkey = useAuthStore((state) => state.privkey);
  const pubkey = useAuthStore((state) => state.pubkey);
  const relays = useRelayStore((state) => state.relays);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!pubkey || !privkey) {
      setIsSubscribed(false);
      return;
    }

    const relayUrls = relays.map((relay) => relay.url);
    nostrClient.updateRelays(relayUrls);

    if (relayUrls.length > 0) {
      const relayListEvent = createInboxRelayListEvent(relayUrls, privkey);
      void nostrClient.publishToRelays(relayListEvent, relayUrls);
    }

    const unsubscribe = nostrClient.subscribeDMs(
      pubkey,
      (event) => {
        const message = parseWrappedMessage(event, privkey, pubkey);

        if (!message) {
          return;
        }

        chatStore.getState().addMessage(message);
        void saveMessage(message);
      },
      () => {
        setIsSubscribed(true);
      }
    );

    return () => {
      setIsSubscribed(false);
      unsubscribe();
    };
  }, [privkey, pubkey, relays]);

  return { isSubscribed };
}
