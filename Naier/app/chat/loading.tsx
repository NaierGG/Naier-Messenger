function ChatBubbleSkeleton({ mine = false }: { mine?: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] ${mine ? "" : "flex items-end gap-3"}`}>
        {!mine ? (
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-zinc-800" />
        ) : null}
        <div
          className={`animate-pulse rounded-3xl px-4 py-3 ${
            mine ? "bg-sky-900/50" : "bg-zinc-800"
          }`}
        >
          <div className="h-3 w-40 rounded-full bg-white/10" />
          <div className="mt-2 h-3 w-28 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function ChatLoading() {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-4">
        <div className="h-10 w-56 animate-pulse rounded-full bg-zinc-800" />
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 py-6">
        <ChatBubbleSkeleton />
        <ChatBubbleSkeleton mine />
        <ChatBubbleSkeleton />
      </div>
      <div className="border-t border-zinc-800 p-4">
        <div className="h-14 animate-pulse rounded-[28px] bg-zinc-900" />
      </div>
    </main>
  );
}
