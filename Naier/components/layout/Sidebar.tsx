"use client";

import { ConversationList } from "@/components/chat/ConversationList";
import { SidebarHeader } from "@/components/layout/SidebarHeader";
import { useRelayStatus } from "@/hooks/useRelayStatus";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const { connectedCount, totalCount, isConnected, overallStatus } = useRelayStatus();
  const summaryLabel =
    overallStatus === "connecting"
      ? "Connecting"
      : overallStatus === "degraded"
        ? "Degraded"
        : isConnected
          ? "Healthy"
          : "Offline";

  return (
    <aside
      className={`hidden w-80 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950/90 p-4 text-zinc-100 md:flex ${className}`.trim()}
    >
      <SidebarHeader />
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
        <ConversationList />
      </div>
      <div className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Relay Status
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-100">
              {connectedCount}/{totalCount} connected
            </p>
            <p className="mt-1 text-xs text-zinc-500">{summaryLabel}</p>
          </div>
          <span
            className={`inline-flex h-3 w-3 rounded-full ${
              overallStatus === "connected"
                ? "bg-emerald-400"
                : overallStatus === "degraded" || overallStatus === "connecting"
                  ? "bg-amber-400"
                  : "bg-red-400"
            }`}
          />
        </div>
      </div>
    </aside>
  );
}
