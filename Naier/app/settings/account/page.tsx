"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyDisplay } from "@/components/auth/KeyDisplay";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createProfileEvent } from "@/lib/nostr/events";
import { nostrClient } from "@/lib/nostr/client";
import { saveProfile } from "@/lib/storage/profileCache";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/authStore";
import { profileStore } from "@/store/profileStore";

export default function AccountSettingsPage() {
  const { success, error } = useToast();
  const pubkey = useAuthStore((state) => state.pubkey);
  const privkey = useAuthStore((state) => state.privkey);
  const { profile } = useProfile(pubkey ?? undefined);
  const [showSecret, setShowSecret] = useState(false);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [picture, setPicture] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.displayName ?? profile.name ?? "");
    setAbout(profile.about ?? "");
    setPicture(profile.picture ?? "");
  }, [profile]);

  async function handleSaveProfile() {
    if (!pubkey || !privkey) {
      error("No logged-in keypair is available.");
      return;
    }

    setIsSaving(true);

    const nextProfile = {
      name,
      displayName: name,
      about,
      picture
    };

    try {
      const event = createProfileEvent(nextProfile, privkey);
      const result = await nostrClient.publish(event);

      if (!result.success) {
        throw new Error(result.error ?? "Failed to save profile.");
      }

      const cachedProfile = {
        pubkey,
        ...nextProfile,
        createdAt: Date.now()
      };

      profileStore.getState().setProfile(pubkey, cachedProfile);
      await saveProfile(pubkey, cachedProfile);
      success("Profile saved.");
    } catch (caughtError) {
      error(caughtError instanceof Error ? caughtError.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <div className="grid gap-5">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-zinc-100">Account Management</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Review your keys and publish profile metadata.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
                href="/settings"
              >
                Back to Settings
              </Link>
              <Link
                className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
                href="/chat"
              >
                Back to Chat
              </Link>
            </div>
          </div>
        </div>

        <KeyDisplay showSecret={showSecret} />

        <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-amber-100">Secret Key Visibility</p>
              <p className="mt-1 text-sm text-amber-100/80">
                `nsec` is sensitive. Do not reveal it while screen sharing.
              </p>
            </div>
            <button
              className="rounded-full border border-amber-500/30 bg-zinc-950/60 px-4 py-2 text-sm font-medium text-amber-50"
              onClick={() => setShowSecret((current) => !current)}
              type="button"
            >
              {showSecret ? "Hide nsec" : "Show nsec"}
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-zinc-100">Edit Profile</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Update your metadata fields and publish them to relays.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-200">Name</span>
              <input
                className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition focus:border-sky-500"
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-200">About</span>
              <textarea
                className="min-h-28 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition focus:border-sky-500"
                onChange={(event) => setAbout(event.target.value)}
                value={about}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-200">Picture URL</span>
              <input
                className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition focus:border-sky-500"
                onChange={(event) => setPicture(event.target.value)}
                value={picture}
              />
            </label>

            <button
              className="w-fit rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving}
              onClick={() => {
                void handleSaveProfile();
              }}
              type="button"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        <div>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
