"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeySetup } from "@/components/auth/KeySetup";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/chat");
    }
  }, [isLoggedIn, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-sky-300">
            Nostr Messenger
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Decentralized P2P Messenger
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign in with your Nostr key and start direct messages immediately.
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
