"use client";

interface ProfileBadgeProps {
  nip05: string;
  verified: boolean;
}

export function ProfileBadge({ nip05, verified }: ProfileBadgeProps) {
  return (
    <div className="group relative inline-flex">
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
          verified
            ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
            : "border-zinc-700 bg-zinc-900 text-zinc-400"
        }`}
      >
        {verified ? (
          <svg
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            viewBox="0 0 24 24"
          >
            <path d="m5 12 5 5L20 7" />
          </svg>
        ) : null}
        <span>{verified ? "NIP-05" : "Unverified"}</span>
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 opacity-0 shadow-xl transition group-hover:opacity-100">
        {nip05}
      </span>
    </div>
  );
}
