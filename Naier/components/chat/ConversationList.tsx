"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { ConversationSearch } from "@/components/chat/ConversationSearch";
import { useChatStore } from "@/store/chatStore";
import { useContactStore } from "@/store/contactStore";

export function ConversationList() {
  const router = useRouter();
  const pathname = usePathname();
  const conversations = useChatStore((state) => state.conversations);
  const contacts = useContactStore((state) => state.contacts);
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
          {filteredConversations.map((conversation) => (
            <ConversationItem
              conversation={conversation}
              isSelected={pathname === `/chat/${conversation.pubkey}`}
              key={conversation.pubkey}
              onClick={() => router.push(`/chat/${conversation.pubkey}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
