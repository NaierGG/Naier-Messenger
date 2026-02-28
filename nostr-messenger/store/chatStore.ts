import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { getMessages as getCachedMessages } from "@/lib/storage/messageCache";
import type { Conversation, MessageStatus, NostrMessage } from "@/types/nostr";

interface ChatState {
  messages: Record<string, NostrMessage[]>;
  conversations: Conversation[];
  addMessage: (msg: NostrMessage) => void;
  updateMessageStatus: (id: string, status: MessageStatus) => void;
  getMessages: (pubkey: string) => NostrMessage[];
  markAsRead: (pubkey: string) => void;
  loadCachedMessages: (pubkey: string) => Promise<void>;
}

function getConversationPubkey(msg: NostrMessage): string {
  return msg.isMine ? msg.recipientPubkey : msg.pubkey;
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
      const conversationPubkey = getConversationPubkey(msg);

      set((state) => {
        const currentMessages = state.messages[conversationPubkey] ?? [];

        if (currentMessages.some((message) => message.id === msg.id)) {
          return;
        }

        const nextMessages = sortMessages([...currentMessages, msg]);
        state.messages[conversationPubkey] = nextMessages;

        state.conversations = upsertConversation(
          state.conversations,
          conversationPubkey,
          (conversation) => ({
            pubkey: conversationPubkey,
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
        Object.keys(state.messages).forEach((pubkey) => {
          const messages = state.messages[pubkey];
          const index = messages.findIndex((message) => message.id === id);

          if (index === -1) {
            return;
          }

          messages[index].status = status;

          const conversation = state.conversations.find((item) => item.pubkey === pubkey);
          if (conversation?.lastMessage?.id === id) {
            conversation.lastMessage.status = status;
          }
        });
      });
    },
    getMessages: (pubkey) => get().messages[pubkey] ?? [],
    markAsRead: (pubkey) => {
      set((state) => {
        const conversation = state.conversations.find((item) => item.pubkey === pubkey);

        if (conversation) {
          conversation.unreadCount = 0;
        }
      });
    },
    loadCachedMessages: async (pubkey) => {
      const cachedMessages = await getCachedMessages(pubkey);

      set((state) => {
        const current = state.messages[pubkey] ?? [];
        const merged = new Map<string, NostrMessage>();

        current.forEach((message) => {
          merged.set(message.id, message);
        });

        cachedMessages.forEach((message) => {
          merged.set(message.id, message);
        });

        const nextMessages = sortMessages(Array.from(merged.values()));
        state.messages[pubkey] = nextMessages;

        if (nextMessages.length === 0) {
          return;
        }

        state.conversations = upsertConversation(state.conversations, pubkey, (conversation) => ({
          pubkey,
          lastMessage: nextMessages[nextMessages.length - 1],
          unreadCount: conversation?.unreadCount ?? 0,
          updatedAt: nextMessages[nextMessages.length - 1].createdAt
        }));
      });
    }
  }))
);

export const chatStore = useChatStore;
