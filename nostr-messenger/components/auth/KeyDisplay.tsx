"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/common/CopyButton";
import { loadKeys } from "@/lib/storage/keyStorage";
import { truncateNpub } from "@/lib/utils/format";
import { authStore, useAuthStore } from "@/store/authStore";

interface KeyDisplayProps {
  showSecret?: boolean;
}

export function KeyDisplay({ showSecret = false }: KeyDisplayProps) {
  const npub = useAuthStore((state) => state.npub);
  const [nsec, setNsec] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    authStore.getState().hydrate();
    setNsec(loadKeys()?.nsec ?? null);
  }, []);

  const blurredValue = useMemo(() => {
    if (!nsec) {
      return "";
    }

    return revealed ? nsec : `${nsec.slice(0, 8)}${"*".repeat(24)}`;
  }, [nsec, revealed]);

  if (!npub) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-5 text-zinc-100 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">npub</p>
          <p className="mt-1 truncate font-mono text-sm text-zinc-200">
            {truncateNpub(npub)}
          </p>
        </div>
        <CopyButton label="Copy" text={npub} />
      </div>

      {showSecret && nsec ? (
        <div className="mt-5 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-100">
            Warning: `nsec` is sensitive. Reveal it only when necessary and keep it backed up.
          </p>
          <div
            className="mt-3 cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
            onClick={() => setRevealed((current) => !current)}
            onMouseEnter={() => setRevealed(true)}
            onMouseLeave={() => setRevealed(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setRevealed((current) => !current);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">nsec</p>
            <p className="mt-2 break-all font-mono text-sm text-zinc-200 blur-[3px] transition hover:blur-0">
              {blurredValue}
            </p>
          </div>
          <div className="mt-3 flex justify-end">
            <CopyButton label="Copy" text={nsec} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
