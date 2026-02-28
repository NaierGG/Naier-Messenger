"use client";

import { useRouter } from "next/navigation";
import { NewDMForm } from "@/components/chat/NewDMForm";

export default function NewChatPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8">
      <button
        className="mb-6 flex w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
        onClick={() => router.back()}
        type="button"
      >
        <span aria-hidden="true">&lt;</span>
        <span>Back</span>
      </button>
      <div className="flex flex-1 items-center">
        <NewDMForm />
      </div>
    </main>
  );
}
