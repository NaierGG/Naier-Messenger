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
  const relayKey = useRelayStore((state) => state.relays.map((relay) => relay.url).join("|"));
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const relayUrls = relayKey ? relayKey.split("|").filter(Boolean) : [];

    if (!pubkey || !privkey) {
      setIsSubscribed(false);
      return;
    }

    if (relayUrls.length === 0) {
      setIsSubscribed(false);
      return;
    }

    nostrClient.updateRelays(relayUrls);

    if (relayUrls.length > 0) {
      const relayListEvent = createInboxRelayListEvent(relayUrls, privkey);
      void nostrClient.publishToRelays(relayListEvent, relayUrls);
    }

    const since = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    void nostrClient.queryGiftWraps(pubkey, since, relayUrls).then((wrappedEvents) => {
      wrappedEvents.forEach((event) => {
        const message = parseWrappedMessage(event, privkey, pubkey);

        if (!message) {
          return;
        }

        chatStore.getState().addMessage(message);
        void saveMessage(message);
      });
    });

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
      unsubscribe();
    };
  }, [privkey, pubkey, relayKey]);

  return { isSubscribed };
}
