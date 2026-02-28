import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-8 text-center text-zinc-100 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">404</p>
        <h1 className="mt-3 text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          요청한 페이지가 없거나 이동되었을 수 있습니다.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
          href="/"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
