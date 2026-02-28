"use client";

import { useRouter } from "next/navigation";
import { ProfileBadge } from "@/components/profile/ProfileBadge";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { RelayStatusDot } from "@/components/relay/RelayStatusDot";
import { useProfile } from "@/hooks/useProfile";
import { useRelayStatus } from "@/hooks/useRelayStatus";

interface TopBarProps {
  pubkey: string;
}

export function TopBar({ pubkey }: TopBarProps) {
  const router = useRouter();
  const { profile } = useProfile(pubkey);
  const { isConnected } = useRelayStatus();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/85 px-4 py-3 text-zinc-100 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 md:hidden"
          onClick={() => router.back()}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <ProfileAvatar
          pubkey={pubkey}
          size="md"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">
              {profile?.displayName ?? profile?.name ?? pubkey.slice(0, 8)}
            </p>
            {profile?.nip05 ? (
              <ProfileBadge
                nip05={profile.nip05}
                verified={Boolean(profile.nip05Verified)}
              />
            ) : null}
          </div>
          <p className="truncate text-xs text-zinc-500">{pubkey}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
        <RelayStatusDot status={isConnected ? "connected" : "disconnected"} />
        <span>{isConnected ? "Online" : "Offline"}</span>
      </div>
    </header>
  );
}
