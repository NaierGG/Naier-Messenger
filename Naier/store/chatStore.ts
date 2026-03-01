import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { getMessages as getCachedMessages } from "@/lib/storage/messageCache";
import type { Conversation, MessageStatus, NostrMessage } from "@/types/nostr";

interface ChatState {
  messages: Record<string, NostrMessage[]>;
  conversations: Conversation[];
  addMessage: (msg: NostrMessage) => void;
  updateMessageStatus: (id: string, status: MessageStatus) => void;
  getMessages: (conversationKey: string) => NostrMessage[];
  getMessageById: (id: string) => NostrMessage | undefined;
  markAsRead: (pubkey: string) => void;
  loadCachedMessages: (conversationKey: string, peerPubkey: string) => Promise<void>;
}

function sortMessages(messages: NostrMessage[]): NostrMessage[] {
  return [...messages].sort((left, right) => left.createdAt - right.createdAt);
}

function upsertConversation(
  conversations: Conversation[],
  pubkey: string,
  updater: (conversation?: Conversation) => Conversation
): Conversation[] {
  const current = conversations.find((conversation) => conversation.pubkey === pubkey);
  const next = updater(current);

  return [next, ...conversations.filter((conversation) => conversation.pubkey !== pubkey)].sort(
    (left, right) => right.updatedAt - left.updatedAt
  );
}

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    messages: {},
    conversations: [],
    addMessage: (msg) => {
      const conversationKey = msg.conversationKey;
      const peerPubkey = msg.peerPubkey;

      set((state) => {
        const currentMessages = state.messages[conversationKey] ?? [];
        const existing = currentMessages.find((message) => message.id === msg.id);

        if (existing) {
          if (existing.status !== msg.status && msg.status === "sent") {
            existing.status = "sent";
          }
          return;
        }

        const nextMessages = sortMessages([...currentMessages, msg]);
        state.messages[conversationKey] = nextMessages;

        state.conversations = upsertConversation(
          state.conversations,
          peerPubkey,
          (conversation) => ({
            pubkey: peerPubkey,
            lastMessage:
              nextMessages[nextMessages.length - 1] ?? conversation?.lastMessage,
            unreadCount: msg.isMine ? conversation?.unreadCount ?? 0 : (conversation?.unreadCount ?? 0) + 1,
            updatedAt:
              nextMessages[nextMessages.length - 1]?.createdAt ??
              conversation?.updatedAt ??
              msg.createdAt
          })
        );
      });
    },
    updateMessageStatus: (id, status) => {
      set((state) => {
        Object.keys(state.messages).forEach((conversationKey) => {
          const messages = state.messages[conversationKey];
          const index = messages.findIndex((message) => message.id === id);

          if (index === -1) {
            return;
          }

          messages[index].status = status;

          const peerPubkey = messages[index].peerPubkey;
          const conversation = state.conversations.find((item) => item.pubkey === peerPubkey);
          if (conversation?.lastMessage?.id === id) {
            conversation.lastMessage.status = status;
          }
        });
      });
    },
    getMessages: (conversationKey) => get().messages[conversationKey] ?? [],
    getMessageById: (id) => {
      const conversationMessages = Object.values(get().messages);

      for (const messages of conversationMessages) {
        const match = messages.find((message) => message.id === id);
        if (match) {
          return match;
        }
      }

      return undefined;
    },
    markAsRead: (pubkey) => {
      set((state) => {
        const conversation = state.conversations.find((item) => item.pubkey === pubkey);

        if (conversation) {
          conversation.unreadCount = 0;
        }
      });
    },
    loadCachedMessages: async (conversationKey, peerPubkey) => {
      const cachedMessages = await getCachedMessages(conversationKey);

      set((state) => {
        const current = state.messages[conversationKey] ?? [];
        const merged = new Map<string, NostrMessage>();

        current.forEach((message) => {
          merged.set(message.id, message);
        });

        cachedMessages.forEach((message) => {
          merged.set(message.id, message);
        });

        const nextMessages = sortMessages(Array.from(merged.values()));
        state.messages[conversationKey] = nextMessages;

        if (nextMessages.length === 0) {
          return;
        }

        state.conversations = upsertConversation(
          state.conversations,
          peerPubkey,
          (conversation) => ({
            pubkey: peerPubkey,
            lastMessage: nextMessages[nextMessages.length - 1],
            unreadCount: conversation?.unreadCount ?? 0,
            updatedAt: nextMessages[nextMessages.length - 1].createdAt
          })
        );
      });
    }
  }))
);

export const chatStore = useChatStore;
