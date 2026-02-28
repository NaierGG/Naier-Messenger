"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useProfile } from "@/hooks/useProfile";
import { authStore, useAuthStore } from "@/store/authStore";

function IconButton({
  label,
  onClick,
  children
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-300 transition hover:border-zinc-600 hover:text-white"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function SidebarHeader() {
  const router = useRouter();
  const pubkey = useAuthStore((state) => state.pubkey);
  const npub = useAuthStore((state) => state.npub);
  const { profile } = useProfile(pubkey ?? undefined);

  useEffect(() => {
    authStore.getState().hydrate();
  }, []);

  const fallbackName = npub?.slice(0, 8) ?? pubkey?.slice(0, 8) ?? "Unknown";
  const displayName = profile?.displayName ?? profile?.name ?? fallbackName;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 text-zinc-100 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProfileAvatar
            pubkey={pubkey ?? fallbackName}
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-zinc-400">
              {profile?.nip05 ?? fallbackName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="New DM" onClick={() => router.push("/chat/new")}>
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </IconButton>
          <IconButton label="Settings" onClick={() => router.push("/settings")}>
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
              <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1 0 2.8l-.1.1a2 2 0 0 1-2.8 0l-.1-.1a1 1 0 0 0-1.1-.2a1 1 0 0 0-.6.9V20a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-.2a1 1 0 0 0-.7-.9a1 1 0 0 0-1 .2l-.2.1a2 2 0 0 1-2.8 0l-.1-.1a2 2 0 0 1 0-2.8l.1-.1a1 1 0 0 0 .2-1.1a1 1 0 0 0-.9-.6H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h.2a1 1 0 0 0 .9-.7a1 1 0 0 0-.2-1l-.1-.2a2 2 0 0 1 0-2.8l.1-.1a2 2 0 0 1 2.8 0l.2.1a1 1 0 0 0 1 .2a1 1 0 0 0 .6-.9V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v.2a1 1 0 0 0 .6.9a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 0l.1.1a2 2 0 0 1 0 2.8l-.1.2a1 1 0 0 0-.2 1a1 1 0 0 0 .9.7H20a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.2a1 1 0 0 0-.4.2z" />
            </svg>
          </IconButton>
        </div>
      </div>
    </div>
  );
}
