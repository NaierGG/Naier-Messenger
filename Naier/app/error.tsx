"use client";

import Link from "next/link";

interface GlobalErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md rounded-[28px] border border-red-500/20 bg-zinc-950/90 p-8 text-center text-zinc-100 shadow-2xl">
        <h1 className="text-2xl font-semibold">문제가 발생했습니다</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {error.message || "예상하지 못한 오류가 발생했습니다."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
            onClick={reset}
            type="button"
          >
            다시 시도
          </button>
          <Link
            className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
            href="/"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
