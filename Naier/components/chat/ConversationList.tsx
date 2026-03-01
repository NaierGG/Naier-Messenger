"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { ConversationSearch } from "@/components/chat/ConversationSearch";
import { useToast } from "@/hooks/useToast";
import { useChatStore } from "@/store/chatStore";
import { useContactStore } from "@/store/contactStore";

export function ConversationList() {
  const router = useRouter();
  const pathname = usePathname();
  const conversations = useChatStore((state) => state.conversations);
  const contacts = useContactStore((state) => state.contacts);
  const acceptContact = useContactStore((state) => state.acceptContact);
  const dismissContact = useContactStore((state) => state.dismissContact);
  const { info } = useToast();
  const [query, setQuery] = useState("");

  const visibleConversations = useMemo(() => {
    const merged = new Map(conversations.map((conversation) => [conversation.pubkey, conversation]));

    contacts.forEach((contact) => {
      if (!merged.has(contact.pubkey)) {
        merged.set(contact.pubkey, {
          pubkey: contact.pubkey,
          unreadCount: 0,
          updatedAt: contact.addedAt
        });
      }
    });

    return Array.from(merged.values()).sort((left, right) => right.updatedAt - left.updatedAt);
  }, [contacts, conversations]);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return visibleConversations;
    }

    return visibleConversations.filter((conversation) =>
      conversation.pubkey.toLowerCase().includes(normalizedQuery)
    );
  }, [query, visibleConversations]);

  const { chats, requests } = useMemo(() => {
    const statusByPubkey = new Map(contacts.map((contact) => [contact.pubkey, contact.status]));

    const nextChats = filteredConversations.filter((conversation) => {
      const status = statusByPubkey.get(conversation.pubkey);

      if (status === "accepted") {
        return true;
      }

      if (status === "pending" || status === "dismissed" || status === "blocked") {
        return false;
      }

      return conversation.lastMessage?.isMine ?? true;
    });
    const nextRequests = filteredConversations.filter((conversation) => {
      const status = statusByPubkey.get(conversation.pubkey);

      if (status === "pending") {
        return true;
      }

      if (status === "dismissed" || status === "blocked") {
        return false;
      }

      return !status && conversation.lastMessage?.isMine === false;
    });

    return {
      chats: nextChats,
      requests: nextRequests
    };
  }, [contacts, filteredConversations]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-100">Direct Messages</p>
        <button
          className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-sky-500/40 hover:bg-zinc-800"
          onClick={() => router.push("/chat/new")}
          type="button"
        >
          New DM
        </button>
      </div>

      <ConversationSearch onSearch={setQuery} />

      {filteredConversations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          No conversations yet.
        </div>
      ) : (
        <div className="grid gap-2">
          {requests.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-1 pt-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300">
                  Requests
                </p>
                <span className="text-xs text-zinc-500">{requests.length}</span>
              </div>
              {requests.map((conversation) => (
                <ConversationItem
                  conversation={conversation}
                  isRequest
                  isSelected={pathname === `/chat/${conversation.pubkey}`}
                  key={conversation.pubkey}
                  onAccept={() => {
                    acceptContact(conversation.pubkey);
                    router.push(`/chat/${conversation.pubkey}`);
                  }}
                  onReject={() => {
                    dismissContact(conversation.pubkey);
                    info("Request dismissed.");
                    if (pathname === `/chat/${conversation.pubkey}`) {
                      router.push("/chat");
                    }
                  }}
                  onClick={() => router.push(`/chat/${conversation.pubkey}`)}
                />
              ))}
            </>
          ) : null}
          {chats.length > 0 ? (
            <>
              {requests.length > 0 ? (
                <div className="flex items-center justify-between px-1 pt-3">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Chats
                  </p>
                  <span className="text-xs text-zinc-500">{chats.length}</span>
                </div>
              ) : null}
              {chats.map((conversation) => (
                <ConversationItem
                  conversation={conversation}
                  isSelected={pathname === `/chat/${conversation.pubkey}`}
                  key={conversation.pubkey}
                  onClick={() => router.push(`/chat/${conversation.pubkey}`)}
                />
              ))}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
