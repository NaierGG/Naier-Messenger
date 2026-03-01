"use client";

import type { MessageStatus as TMessageStatus } from "@/types/nostr";

interface MessageStatusProps {
  status: TMessageStatus;
  isMine: boolean;
  onRetry?: () => void;
}

export function MessageStatus({ status, isMine, onRetry }: MessageStatusProps) {
  if (!isMine) {
    return null;
  }

  if (status === "sending") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
        <svg
          aria-hidden="true"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
        <span>Sending</span>
      </span>
    );
  }

  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
        <svg
          aria-hidden="true"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m5 12 5 5L20 7" />
        </svg>
        <span>Sent</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-red-300">
      <span className="inline-flex items-center gap-1">
        <svg
          aria-hidden="true"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
        <span>Failed</span>
      </span>
      <button
        className="rounded-full border border-red-400/30 px-2 py-0.5 text-[10px] font-medium text-red-200"
        onClick={onRetry}
        type="button"
      >
        Retry
      </button>
    </span>
  );
}
