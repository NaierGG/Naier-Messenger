export default function RootLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4 text-zinc-300">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-sky-500" />
        <p className="text-sm">불러오는 중...</p>
      </div>
    </main>
  );
}
