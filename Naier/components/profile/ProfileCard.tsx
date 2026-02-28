"use client";

import Link from "next/link";
import { CopyButton } from "@/components/common/CopyButton";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileBadge } from "@/components/profile/ProfileBadge";
import { pubkeyToNpub } from "@/lib/nostr/keys";
import { truncateNpub, truncatePubkey } from "@/lib/utils/format";
import { useProfile } from "@/hooks/useProfile";

interface ProfileCardProps {
  pubkey: string;
  compact?: boolean;
}

export function ProfileCard({ pubkey, compact = false }: ProfileCardProps) {
  const { profile, isLoading } = useProfile(pubkey);
  const displayName = profile?.displayName ?? profile?.name ?? truncatePubkey(pubkey, 8);
  const npub = pubkeyToNpub(pubkey);

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 text-zinc-100 shadow-xl">
        <ProfileAvatar pubkey={pubkey} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          {profile?.nip05 ? (
            <div className="mt-1">
              <ProfileBadge nip05={profile.nip05} verified={Boolean(profile.nip05Verified)} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
      <div className="h-32 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900">
        {profile?.banner ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.banner})` }}
          />
        ) : null}
      </div>
      <div className="p-6">
        <div className="-mt-16 flex flex-wrap items-end justify-between gap-4">
          <ProfileAvatar pubkey={pubkey} size="xl" />
          <Link
            className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
            href={`/chat/${pubkey}`}
          >
            Send DM
          </Link>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold">
              {isLoading ? "Loading profile..." : displayName}
            </h2>
            {profile?.name && profile.displayName && profile.name !== profile.displayName ? (
              <span className="text-sm text-zinc-400">@{profile.name}</span>
            ) : null}
            {profile?.nip05 ? (
              <ProfileBadge nip05={profile.nip05} verified={Boolean(profile.nip05Verified)} />
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {profile?.about ?? "No bio available."}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">npub</p>
              <p className="mt-1 truncate font-mono text-sm text-zinc-200">
                {truncateNpub(npub)}
              </p>
            </div>
            <CopyButton label="Copy" text={npub} />
          </div>
          <p className="mt-3 truncate font-mono text-xs text-zinc-500">
            {truncatePubkey(pubkey)}
          </p>
        </div>
      </div>
    </div>
  );
}
