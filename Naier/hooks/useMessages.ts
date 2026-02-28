"use client";

import { useEffect, useState } from "react";
import { MAX_MESSAGE_LENGTH } from "@/constants";
import { encryptMessage } from "@/lib/nostr/crypto";
import { createDMEvent, createOptimisticMessage } from "@/lib/nostr/events";
import { saveMessage } from "@/lib/storage/messageCache";
import { nostrClient } from "@/lib/nostr/client";
import type { NostrMessage } from "@/types/nostr";
import { authStore, useAuthStore } from "@/store/authStore";
import { chatStore, useChatStore } from "@/store/chatStore";
import { uiStore } from "@/store/uiStore";

export function useMessages(recipientPubkey: string): {
  messages: NostrMessage[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} {
  const messages = useChatStore((state) => state.getMessages(recipientPubkey));
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!recipientPubkey || !isLoggedIn) {
      return;
    }

    setIsLoading(true);
    setError(null);

    void chatStore
      .getState()
      .loadCachedMessages(recipientPubkey)
      .catch(() => {
        setError("Failed to load cached messages.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isLoggedIn, recipientPubkey]);

  async function sendMessage(text: string): Promise<void> {
    const content = text.trim();
    const { privkey, pubkey } = authStore.getState();

    if (!privkey || !pubkey || !recipientPubkey || !content) {
      return;
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
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

    const optimisticMessage = createOptimisticMessage(
      content,
      pubkey,
      recipientPubkey,
      "sending"
    );

    chatStore.getState().addMessage(optimisticMessage);
    await saveMessage(optimisticMessage);

    try {
      const encryptedContent = encryptMessage(content, privkey, recipientPubkey);
      const event = createDMEvent(encryptedContent, privkey, recipientPubkey);
      const result = await nostrClient.publish(event);

      if (!result.success) {
        throw new Error(result.error ?? "Failed to publish event.");
      }

      chatStore.getState().updateMessageStatus(optimisticMessage.id, "sent");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to send message.";

      chatStore.getState().updateMessageStatus(optimisticMessage.id, "failed");
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
    isLoading,
    error
  };
}
