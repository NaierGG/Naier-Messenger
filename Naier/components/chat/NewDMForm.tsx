"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { verifyNip05 } from "@/lib/nostr/nip05";
import { npubToPubkey } from "@/lib/nostr/keys";
import { isValidNip05, isValidNpub } from "@/lib/utils/validation";
import { useContactStore } from "@/store/contactStore";

async function resolveNip05Pubkey(nip05: string): Promise<string | null> {
  const match = nip05.trim().match(/^([^@\s]+)@([^@\s]+\.[^@\s]+)$/);

  if (!match) {
    return null;
  }

  const [, user, domain] = match;

  try {
    const response = await fetch(
      `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(user)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      names?: Record<string, string>;
    };

    return data.names?.[user] ?? null;
  } catch {
    return null;
  }
}

export function NewDMForm() {
  const router = useRouter();
  const acceptContact = useContactStore((state) => state.acceptContact);
  const [value, setValue] = useState("");
  const [resolvedPubkey, setResolvedPubkey] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const normalizedInput = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!normalizedInput) {
        setResolvedPubkey("");
        setIsValid(false);
        return;
      }

      if (isValidNpub(normalizedInput)) {
        const pubkey = npubToPubkey(normalizedInput);
        if (!cancelled) {
          setResolvedPubkey(pubkey);
          setIsValid(true);
        }
        return;
      }

      if (!isValidNip05(normalizedInput)) {
        setResolvedPubkey("");
        setIsValid(false);
        return;
      }

      setIsResolving(true);
      const pubkey = await resolveNip05Pubkey(normalizedInput);
      const verified = pubkey ? await verifyNip05(normalizedInput, pubkey) : false;

      if (!cancelled) {
        setResolvedPubkey(verified && pubkey ? pubkey : "");
        setIsValid(Boolean(verified && pubkey));
        setIsResolving(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [normalizedInput]);

  return (
    <div className="grid gap-6 rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-6 text-zinc-100 shadow-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Start a new DM</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enter an npub or a NIP-05 address to open a conversation.
        </p>
      </div>

      <div className="grid gap-3">
        <input
          className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-sky-500"
          onChange={(event) => setValue(event.target.value)}
          placeholder="npub1... or user@domain.com"
          value={value}
        />
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              normalizedInput
                ? isValid
                  ? "bg-emerald-400"
                  : isResolving
                    ? "bg-amber-400"
                    : "bg-red-400"
                : "bg-zinc-700"
            }`}
          />
          <span
            className={`${
              isValid
                ? "text-emerald-300"
                : isResolving
                  ? "text-amber-300"
                  : "text-zinc-500"
            }`}
          >
            {!normalizedInput
              ? "Enter npub or NIP-05"
              : isResolving
                ? "Resolving NIP-05..."
                : isValid
                  ? "Valid recipient"
                  : "Invalid recipient"}
          </span>
        </div>
      </div>

      {resolvedPubkey ? <ProfileCard compact pubkey={resolvedPubkey} /> : null}

      <button
        className="w-fit rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!resolvedPubkey}
        onClick={() => {
          acceptContact(resolvedPubkey);
          router.push(`/chat/${resolvedPubkey}`);
        }}
        type="button"
      >
        Start DM
      </button>
    </div>
  );
}
