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
  isRequest?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

function truncatePreview(value: string): string {
  return value.length > 30 ? `${value.slice(0, 30)}...` : value;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
  isRequest = false,
  onAccept,
  onReject
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
    <div
      className={`flex w-full items-center gap-3 rounded-3xl border px-3 py-3 text-left transition ${
        isSelected
          ? "border-sky-500/40 bg-sky-500/10"
          : isRequest
            ? "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30 hover:bg-amber-500/10"
            : "border-transparent bg-transparent hover:border-zinc-800 hover:bg-zinc-900/70"
      }`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <ProfileAvatar pubkey={conversation.pubkey} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-zinc-100">
            {displayName}
          </p>
          <div className="flex items-center gap-2">
            {isRequest ? (
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200">
                Request
              </span>
            ) : null}
            <span className="text-xs text-zinc-500">
              {conversation.lastMessage ? formatTime(conversation.updatedAt) : ""}
            </span>
          </div>
        </div>
        <p className="truncate text-sm text-zinc-400">{preview}</p>
      </div>
      {isRequest && (onAccept || onReject) ? (
        <div className="flex items-center gap-2">
          {onReject ? (
            <button
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
              onClick={(event) => {
                event.stopPropagation();
                onReject();
              }}
              type="button"
            >
              Reject
            </button>
          ) : null}
          {onAccept ? (
            <button
              className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-500"
              onClick={(event) => {
                event.stopPropagation();
                onAccept();
              }}
              type="button"
            >
              Accept
            </button>
          ) : null}
        </div>
      ) : null}
      {conversation.unreadCount > 0 ? (
        <span className="rounded-full bg-sky-500 px-2 py-1 text-[11px] font-semibold text-white">
          {conversation.unreadCount}
        </span>
      ) : null}
    </div>
  );
}
