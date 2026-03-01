import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-8 text-center text-zinc-100 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">404</p>
        <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          The page you requested does not exist or may have moved.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
          href="/"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
