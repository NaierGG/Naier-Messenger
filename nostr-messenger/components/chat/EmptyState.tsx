"use client";

import { useRouter } from "next/navigation";

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex max-w-md flex-col items-center rounded-[28px] border border-zinc-800 bg-zinc-950/80 px-6 py-10 text-center text-zinc-100 shadow-2xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
        <svg
          aria-hidden="true"
          className="h-7 w-7 text-zinc-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p className="mt-5 text-base font-semibold">
        Select a conversation or start a new DM.
      </p>
      <button
        className="mt-5 rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
        onClick={() => router.push("/chat/new")}
        type="button"
      >
        Start New DM
      </button>
    </div>
  );
}
