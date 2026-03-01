"use client";

import Link from "next/link";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useDmRelayDiagnostics } from "@/hooks/useDmRelayDiagnostics";

interface DmRelayNoticeProps {
  recipientPubkey: string;
}

export function DmRelayNotice({ recipientPubkey }: DmRelayNoticeProps) {
  const {
    isLoading,
    recipientRelayUrls,
    hasPublishedInboxRelays,
    isUsingFallbackWriteRelays,
    healthyRelayCount,
    totalRelayCount
  } = useDmRelayDiagnostics(recipientPubkey);

  if (totalRelayCount === 0) {
    return (
      <div className="border-b border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-100">
        No DM inbox relays are configured. Add at least one relay in settings before sending
        messages.
      </div>
    );
  }

  if (healthyRelayCount === 0) {
    return (
      <div className="border-b border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>
            All configured relays are currently in error or cooldown. Delivery and resync may fail
            until at least one relay recovers.
          </p>
          <Link
            className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-100 transition hover:border-red-500/50 hover:bg-red-500/20"
            href="/settings/relays"
          >
            Review Relays
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span>Checking this contact&apos;s DM relay policy...</span>
        </div>
      </div>
    );
  }

  if (isUsingFallbackWriteRelays) {
    return (
      <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-3xl">
            This contact has not published a `kind 10050` DM inbox relay list. Naier will fall
            back to your current relay set, which can reduce delivery reliability.
          </p>
          <Link
            className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-100 transition hover:border-amber-400/40 hover:bg-amber-500/15"
            href="/settings/relays"
          >
            Check Relays
          </Link>
        </div>
      </div>
    );
  }

  if (!hasPublishedInboxRelays) {
    return null;
  }

  return (
    <div className="border-b border-emerald-500/15 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-100">
      Delivery target resolved from this contact&apos;s published DM inbox relays:{" "}
      <span className="font-semibold">{recipientRelayUrls.length}</span> relay
      {recipientRelayUrls.length === 1 ? "" : "s"}.
    </div>
  );
}
