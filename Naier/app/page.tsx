"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeySetup } from "@/components/auth/KeySetup";
import { useAuthStore } from "@/store/authStore";

function getSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/chat";
  }

  return value;
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      router.push(getSafeNextPath(searchParams.get("next")));
    }
  }, [isLoggedIn, router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-sky-300">
            Naier
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Direct messaging over Nostr
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Bring your key, connect to relays, and start private conversations.
          </p>
        </div>
        <div className="rounded-[32px] border border-zinc-800 bg-zinc-950/80 p-2 shadow-2xl">
          <div className="rounded-[28px] bg-zinc-950">
            <KeySetup />
          </div>
        </div>
      </div>
    </main>
  );
}
