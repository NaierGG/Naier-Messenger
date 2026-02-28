"use client";

import { useMemo } from "react";
import type { NostrMessage } from "@/types/nostr";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { MessageStatus } from "@/components/chat/MessageStatus";
import { formatTime } from "@/lib/utils/format";

interface MessageBubbleProps {
  message: NostrMessage;
}

function linkifyText(content: string) {
  const parts = content.split(/(https?:\/\/[^\s]+)/g);

  return parts.map((part, index) => {
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          className="break-all underline underline-offset-2"
          href={part}
          key={`${part}-${index}`}
          rel="noreferrer"
          target="_blank"
        >
          {part}
        </a>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const renderedContent = useMemo(() => linkifyText(message.content), [message.content]);

  if (message.isMine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-[24px] rounded-br-md bg-sky-600 px-4 py-3 text-white shadow-lg">
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {renderedContent}
          </p>
          <div className="mt-2 flex items-center justify-end gap-3">
            <span className="text-[11px] text-sky-100/80">
              {formatTime(message.createdAt)}
            </span>
            <MessageStatus isMine={message.isMine} status={message.status} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2">
      <ProfileAvatar pubkey={message.pubkey} size="sm" />
      <div className="max-w-[80%] rounded-[24px] rounded-bl-md bg-zinc-800 px-4 py-3 text-zinc-100 shadow-lg">
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {renderedContent}
        </p>
        <div className="mt-2 flex items-center justify-end gap-3">
          <span className="text-[11px] text-zinc-400">
            {formatTime(message.createdAt)}
          </span>
          <MessageStatus isMine={message.isMine} status={message.status} />
        </div>
      </div>
    </div>
  );
}
