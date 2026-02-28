import Link from "next/link";
import { RelayList } from "@/components/relay/RelayList";

export default function RelaySettingsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-100">Relay Management</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Review relay endpoints and connection status.
          </p>
        </div>
        <Link
          className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
          href="/settings"
        >
          Back to Settings
        </Link>
      </div>
      <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
        <RelayList />
      </div>
    </main>
  );
}
