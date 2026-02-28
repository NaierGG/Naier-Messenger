"use client";

import type { NostrRelay } from "@/types/nostr";

interface RelayStatusDotProps {
  status: NostrRelay["status"];
  size?: "sm" | "md";
}

const sizeClassMap = {
  sm: "h-2 w-2",
  md: "h-3 w-3"
} as const;

export function RelayStatusDot({
  status,
  size = "md"
}: RelayStatusDotProps) {
  const toneClass =
    status === "connected"
      ? "bg-emerald-400 animate-pulse"
      : status === "connecting"
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <span
      className={`inline-block rounded-full ${sizeClassMap[size]} ${toneClass}`}
    />
  );
}
