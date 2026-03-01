"use client";

import { RelayStatusDot } from "@/components/relay/RelayStatusDot";
import type { NostrRelay } from "@/types/nostr";

interface RelayItemProps {
  relay: NostrRelay;
  onRemove: (url: string) => void;
}

function formatRelayHost(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host;

    if (host.length <= 24) {
      return host;
    }

    return `${host.slice(0, 12)}...${host.slice(-8)}`;
  } catch {
    return url.length <= 24 ? url : `${url.slice(0, 12)}...${url.slice(-8)}`;
  }
}

export function RelayItem({ relay, onRemove }: RelayItemProps) {
  const cooldownLabel =
    relay.cooldownUntil && relay.cooldownUntil > Date.now()
      ? `${Math.ceil((relay.cooldownUntil - Date.now()) / 1000 / 60)}m cooldown`
      : null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-zinc-100">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <RelayStatusDot size="sm" status={relay.status} />
          <p className="truncate font-medium">{formatRelayHost(relay.url)}</p>
        </div>
        <p className="mt-1 truncate text-xs text-zinc-500">{relay.url}</p>
        <p className="mt-1 text-xs text-zinc-400">
          Success {relay.successRate}% - Errors {relay.recentErrors}
          {cooldownLabel ? ` - ${cooldownLabel}` : ""}
        </p>
        {relay.lastError ? (
          <p className="mt-1 truncate text-xs text-red-300">{relay.lastError}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400">
          {relay.latency !== undefined ? `${relay.latency}ms` : "--"}
        </span>
        <button
          className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-red-500/40 hover:text-red-200"
          onClick={() => onRemove(relay.url)}
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
