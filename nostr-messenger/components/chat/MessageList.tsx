"use client";

import type { NostrMessage } from "@/types/nostr";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useScrollBottom } from "@/hooks/useScrollBottom";
import { formatDate, isSameDay } from "@/lib/utils/format";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageBubble } from "@/components/chat/MessageBubble";

interface MessageListProps {
  messages: NostrMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  const { scrollRef } = useScrollBottom([messages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];
          const showDateSeparator =
            !previousMessage ||
            !isSameDay(previousMessage.createdAt, message.createdAt);

          return (
            <div className="space-y-3" key={message.id}>
              {showDateSeparator ? (
                <div className="flex justify-center">
                  <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
              ) : null}
              <MessageBubble message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
