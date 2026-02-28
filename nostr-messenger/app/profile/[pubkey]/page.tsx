"use client";

import { useRouter } from "next/navigation";
import { ProfileCard } from "@/components/profile/ProfileCard";

interface ProfilePageProps {
  params: {
    pubkey: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const pubkey = params.pubkey;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <ProfileCard pubkey={pubkey} />
      <div className="mt-6 flex justify-end">
        <button
          className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
          onClick={() => router.push(`/chat/${pubkey}`)}
          type="button"
        >
          Send DM
        </button>
      </div>
    </main>
  );
}
