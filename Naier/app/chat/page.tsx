import { EmptyState } from "@/components/chat/EmptyState";

export default function ChatIndexPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl">
        <EmptyState />
      </div>
    </main>
  );
}
