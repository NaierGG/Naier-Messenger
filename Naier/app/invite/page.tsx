"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/common/CopyButton";
import { useAuthStore } from "@/store/authStore";

export default function InvitePage() {
  const npub = useAuthStore((state) => state.npub);
  const inviteLink = useMemo(() => {
    if (!npub || typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/add/${npub}`;
  }, [npub]);

  if (!npub) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <div className="w-full rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-6 text-zinc-100 shadow-2xl">
          <h1 className="text-2xl font-semibold">Invite a friend</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign in with your key first so Naier can generate your invite link.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
              href="/"
            >
              Go Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <div className="grid gap-5">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-6 text-zinc-100 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Invite</p>
              <h1 className="mt-3 text-3xl font-semibold">Share your Naier link</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                Send this invite link to a friend. Opening it will take them straight to a
                confirmation screen where they can add you and jump into chat.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
                href="/chat/new"
              >
                Add by npub
              </Link>
              <Link
                className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
                href="/chat"
              >
                Back to Chat
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-6 text-zinc-100 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Your npub</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
            <p className="min-w-0 flex-1 break-all font-mono text-sm text-zinc-200">{npub}</p>
            <CopyButton label="Copy npub" text={npub} />
          </div>
        </div>

        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-6 text-zinc-100 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Invite link</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
            <p className="min-w-0 flex-1 break-all font-mono text-sm text-zinc-200">
              {inviteLink}
            </p>
            <CopyButton label="Copy link" text={inviteLink} />
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            QR sharing is not included in this pass. The direct invite link is the primary MVP
            path and works on any device that can open the app.
          </p>
        </div>
      </div>
    </main>
  );
}
