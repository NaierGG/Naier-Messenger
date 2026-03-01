"use client";

import { useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { MAX_MESSAGE_LENGTH } from "@/constants";

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

const lineHeightPx = 24;
const maxHeightPx = lineHeightPx * 4;

export function MessageInput({
  onSend,
  isLoading,
  disabled = false,
  disabledReason
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = value.trim();
  const isOverLimit = new TextEncoder().encode(value).length > MAX_MESSAGE_LENGTH;

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeightPx)}px`;
  }, [value]);

  async function handleSend() {
    if (!trimmed || disabled || isLoading || isOverLimit) {
      return;
    }

    await onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/95 p-4">
      <div className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-3">
        <textarea
          className="max-h-24 min-h-[48px] w-full resize-none bg-transparent px-2 py-1 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          disabled={disabled || isLoading}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Type a message"
          ref={textareaRef}
          rows={1}
          value={value}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className={`text-xs ${isOverLimit ? "text-red-300" : "text-zinc-500"}`}>
            {disabled && disabledReason
              ? disabledReason
              : `${new TextEncoder().encode(value).length}/${MAX_MESSAGE_LENGTH} bytes`}
          </span>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || isLoading || !trimmed || isOverLimit}
            onClick={() => {
              void handleSend();
            }}
            type="button"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : null}
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
