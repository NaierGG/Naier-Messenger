import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
        <h1 className="text-3xl font-semibold text-zinc-100">Settings</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Manage relays and account information.
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
