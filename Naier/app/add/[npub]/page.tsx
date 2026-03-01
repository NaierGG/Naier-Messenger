"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { npubToPubkey, pubkeyToNpub } from "@/lib/nostr/keys";
import { truncateNpub } from "@/lib/utils/format";
import { isValidNpub } from "@/lib/utils/validation";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/authStore";
import { useContactStore } from "@/store/contactStore";

interface AddInvitePageProps {
  params: {
    npub: string;
  };
}

export default function AddInvitePage({ params }: AddInvitePageProps) {
  const router = useRouter();
  const { success } = useToast();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const myNpub = useAuthStore((state) => state.npub);
  const addContact = useContactStore((state) => state.addContact);
  const hasContact = useContactStore((state) => state.hasContact);

  const normalizedNpub = decodeURIComponent(params.npub ?? "").trim();
  const isValidInvite = isValidNpub(normalizedNpub);
  const invitePubkey = useMemo(
    () => (isValidInvite ? npubToPubkey(normalizedNpub) : ""),
    [isValidInvite, normalizedNpub]
  );
  const alreadyAdded = invitePubkey ? hasContact(invitePubkey) : false;
  const isOwnInvite = Boolean(myNpub && myNpub === normalizedNpub);

  function handleConfirm(): void {
    if (!invitePubkey) {
      return;
    }

    addContact(invitePubkey);
    success(alreadyAdded ? "Chat opened." : "Friend added.");
    router.push(`/chat/${invitePubkey}`);
  }

  if (!isValidInvite) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <div className="w-full rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-6 text-zinc-100 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">Invite Link</p>
          <h1 className="mt-3 text-2xl font-semibold">Invalid invite link</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            This Naier invite link does not contain a valid npub. Ask your friend to send the
            link again.
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

  if (!isLoggedIn) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <div className="w-full rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-6 text-zinc-100 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Invite Link</p>
          <h1 className="mt-3 text-2xl font-semibold">Sign in to add this friend</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Finish setting up your Naier key first. After you sign in, the app will bring you
            back here so you can confirm the invite and jump into chat.
          </p>
          <div className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Invite</p>
            <p className="mt-2 font-mono text-sm text-zinc-200">
              {truncateNpub(normalizedNpub)}
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <Link
              className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
              href={`/?next=${encodeURIComponent(`/add/${normalizedNpub}`)}`}
            >
              Continue to Sign In
            </Link>
            <Link
              className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
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
          <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Invite Link</p>
          <h1 className="mt-3 text-3xl font-semibold">
            {isOwnInvite ? "This is your own invite" : "Add this friend to Naier"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {isOwnInvite
              ? "You opened your own invite link. Share it with someone else to start a conversation."
              : "Confirm this contact to save them locally and open a direct message thread immediately."}
          </p>
        </div>

        <ProfileCard compact pubkey={invitePubkey} />

        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-6 text-zinc-100 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">npub</p>
          <p className="mt-2 break-all font-mono text-sm text-zinc-200">
            {pubkeyToNpub(invitePubkey)}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isOwnInvite ? (
              <Link
                className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
                href="/invite"
              >
                Open Invite Page
              </Link>
            ) : (
              <button
                className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
                onClick={handleConfirm}
                type="button"
              >
                {alreadyAdded ? "Open Chat" : "Add Friend"}
              </button>
            )}
            <Link
              className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
              href="/chat"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
