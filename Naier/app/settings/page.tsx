"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-5xl items-start justify-center px-6 py-10"
      onClick={() => router.push("/chat")}
    >
      <div
        className="w-full max-w-3xl rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-100">Settings</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Manage relays and account information.
            </p>
          </div>
          <button
            className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
            onClick={() => router.push("/chat")}
            type="button"
          >
            Back to Chat
          </button>
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
          Click outside this panel to return to chat.
        </p>
        <div className="mt-6 grid gap-3">
          <Link
            className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 transition hover:border-zinc-700 hover:bg-zinc-800"
            href="/settings/relays"
          >
            Relay Management
          </Link>
          <Link
            className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 transition hover:border-zinc-700 hover:bg-zinc-800"
            href="/settings/account"
          >
            Account Management
          </Link>
        </div>
      </div>
    </main>
  );
}
