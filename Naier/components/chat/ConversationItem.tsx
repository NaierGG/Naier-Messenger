"use client";

import type { Conversation } from "@/types/nostr";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { pubkeyToNpub } from "@/lib/nostr/keys";
import { formatTime, truncateNpub } from "@/lib/utils/format";
import { useProfile } from "@/hooks/useProfile";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

function truncatePreview(value: string): string {
  return value.length > 30 ? `${value.slice(0, 30)}...` : value;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick
}: ConversationItemProps) {
  const { profile } = useProfile(conversation.pubkey);
  const displayName =
    profile?.displayName ??
    profile?.name ??
    truncateNpub(pubkeyToNpub(conversation.pubkey));
  const preview = conversation.lastMessage?.content
    ? truncatePreview(conversation.lastMessage.content)
    : "No messages yet";

  return (
    <button
      className={`flex w-full items-center gap-3 rounded-3xl border px-3 py-3 text-left transition ${
        isSelected
          ? "border-sky-500/40 bg-sky-500/10"
          : "border-transparent bg-transparent hover:border-zinc-800 hover:bg-zinc-900/70"
      }`}
      onClick={onClick}
      type="button"
    >
      <ProfileAvatar pubkey={conversation.pubkey} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-zinc-100">
            {displayName}
          </p>
          <span className="text-xs text-zinc-500">
            {conversation.lastMessage ? formatTime(conversation.updatedAt) : ""}
          </span>
        </div>
        <p className="truncate text-sm text-zinc-400">{preview}</p>
      </div>
      {conversation.unreadCount > 0 ? (
        <span className="rounded-full bg-sky-500 px-2 py-1 text-[11px] font-semibold text-white">
          {conversation.unreadCount}
        </span>
      ) : null}
    </button>
  );
}
