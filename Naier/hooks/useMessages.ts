"use client";

import { useEffect, useMemo, useState } from "react";
import { MAX_MESSAGE_LENGTH } from "@/constants";
import {
  buildRumorFromMessage,
  createChatRumor,
  createOptimisticMessageFromRumor,
  createWrappedDMEvents,
  getConversationKey,
  type NostrRumor
} from "@/lib/nostr/events";
import { saveMessage } from "@/lib/storage/messageCache";
import { nostrClient } from "@/lib/nostr/client";
import type { NostrMessage } from "@/types/nostr";
import { authStore, useAuthStore } from "@/store/authStore";
import { chatStore, useChatStore } from "@/store/chatStore";
import { useRelayStore } from "@/store/relayStore";
import { uiStore } from "@/store/uiStore";

interface PublishOptions {
  rumor: NostrRumor;
  optimisticMessageId: string;
  recipientPubkey: string;
  myPubkey: string;
  senderPrivkey: string;
}

async function persistCurrentMessage(messageId: string): Promise<void> {
  const current = chatStore.getState().getMessageById(messageId);

  if (current) {
    await saveMessage(current);
  }
}

export function useMessages(recipientPubkey: string): {
  messages: NostrMessage[];
  sendMessage: (text: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const myPubkey = useAuthStore((state) => state.pubkey);
  const relayUrls = useRelayStore((state) => state.relays.map((relay) => relay.url));
  const conversationKey = useMemo(
    () => (myPubkey && recipientPubkey ? getConversationKey(myPubkey, recipientPubkey) : ""),
    [myPubkey, recipientPubkey]
  );
  const messages = useChatStore((state) =>
    conversationKey ? state.getMessages(conversationKey) : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!conversationKey || !recipientPubkey || !isLoggedIn) {
      return;
    }

    setIsLoading(true);
    setError(null);

    void chatStore
      .getState()
      .loadCachedMessages(conversationKey, recipientPubkey)
      .catch(() => {
        setError("Failed to load cached messages.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [conversationKey, isLoggedIn, recipientPubkey]);

  async function publishWrappedMessage({
    rumor,
    optimisticMessageId,
    recipientPubkey: recipient,
    myPubkey: senderPubkey,
    senderPrivkey
  }: PublishOptions): Promise<void> {
    nostrClient.updateRelays(relayUrls);

    const recipientRelayUrls = await nostrClient.fetchInboxRelays(recipient);

    if (recipientRelayUrls.length === 0) {
      throw new Error("Recipient has no published DM relays (kind 10050).");
    }

    const selfRelayUrls =
      relayUrls.length > 0 ? relayUrls : await nostrClient.fetchInboxRelays(senderPubkey);

    const { recipientWrap, selfWrap } = createWrappedDMEvents(
      rumor,
      senderPrivkey,
      senderPubkey,
      recipient
    );

    const [recipientResult, selfResult] = await Promise.all([
      nostrClient.publishToRelays(recipientWrap, recipientRelayUrls),
      nostrClient.publishToRelays(selfWrap, selfRelayUrls)
    ]);

    if (!recipientResult.success) {
      throw new Error(recipientResult.error ?? "Failed to publish DM gift wrap.");
    }

    if (!selfResult.success) {
      uiStore.getState().addToast({
        type: "warning",
        message: "Message sent, but the self-archive copy could not be published.",
        duration: 4000
      });
    }

    chatStore.getState().updateMessageStatus(optimisticMessageId, "sent");
    await persistCurrentMessage(optimisticMessageId);
  }

  async function sendMessage(text: string): Promise<void> {
    const content = text.trim();
    const { privkey, pubkey } = authStore.getState();

    if (!privkey || !pubkey || !recipientPubkey || !content) {
      return;
    }

    if (new TextEncoder().encode(content).length > MAX_MESSAGE_LENGTH) {
      const message = "Message exceeds the maximum allowed length.";
      setError(message);
      uiStore.getState().addToast({
        type: "error",
        message,
        duration: 5000
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const rumor = createChatRumor(content, privkey, recipientPubkey);
    const optimisticMessage = createOptimisticMessageFromRumor(
      rumor,
      pubkey,
      recipientPubkey,
      "sending"
    );

    chatStore.getState().addMessage(optimisticMessage);
    await saveMessage(optimisticMessage);

    try {
      await publishWrappedMessage({
        rumor,
        optimisticMessageId: optimisticMessage.id,
        recipientPubkey,
        myPubkey: pubkey,
        senderPrivkey: privkey
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to send message.";

      chatStore.getState().updateMessageStatus(optimisticMessage.id, "failed");
      await persistCurrentMessage(optimisticMessage.id);
      uiStore.getState().addToast({
        type: "error",
        message,
        duration: 5000
      });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function retryMessage(messageId: string): Promise<void> {
    const { privkey, pubkey } = authStore.getState();
    const existing = chatStore.getState().getMessageById(messageId);

    if (!privkey || !pubkey || !existing || !existing.isMine || existing.recipientPubkey !== recipientPubkey) {
      return;
    }

    setIsLoading(true);
    setError(null);
    chatStore.getState().updateMessageStatus(messageId, "sending");
    await persistCurrentMessage(messageId);

    try {
      await publishWrappedMessage({
        rumor: buildRumorFromMessage(existing),
        optimisticMessageId: messageId,
        recipientPubkey,
        myPubkey: pubkey,
        senderPrivkey: privkey
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to retry message.";

      chatStore.getState().updateMessageStatus(messageId, "failed");
      await persistCurrentMessage(messageId);
      uiStore.getState().addToast({
        type: "error",
        message,
        duration: 5000
      });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    messages,
    sendMessage,
    retryMessage,
    isLoading,
    error
  };
}
