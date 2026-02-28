"use client";

import { useEffect } from "react";
import { getProfile as getCachedProfile, saveProfile } from "@/lib/storage/profileCache";
import { fetchProfile } from "@/lib/nostr/profile";
import type { NostrProfile } from "@/types/nostr";
import { profileStore, useProfileStore } from "@/store/profileStore";

export function useProfile(pubkey: string | undefined): {
  profile: NostrProfile | undefined;
  isLoading: boolean;
  refresh: () => void;
} {
  const profile = useProfileStore((state) =>
    pubkey ? state.getProfile(pubkey) : undefined
  );
  const isLoading = useProfileStore((state) =>
    pubkey ? state.isLoading(pubkey) : false
  );

  function refresh(): void {
    if (!pubkey) {
      return;
    }

    profileStore.getState().setLoading(pubkey, true);

    void (async () => {
      try {
        const freshProfile = await fetchProfile(pubkey);

        if (!freshProfile) {
          return;
        }

        profileStore.getState().setProfile(pubkey, freshProfile);
        await saveProfile(pubkey, freshProfile);
      } finally {
        profileStore.getState().setLoading(pubkey, false);
      }
    })();
  }

  useEffect(() => {
    if (!pubkey) {
      return;
    }

    const existing = profileStore.getState().getProfile(pubkey);

    if (existing) {
      return;
    }

    profileStore.getState().setLoading(pubkey, true);

    void (async () => {
      try {
        const cachedProfile = await getCachedProfile(pubkey);

        if (cachedProfile) {
          profileStore.getState().setProfile(pubkey, cachedProfile);
          return;
        }

        const fetchedProfile = await fetchProfile(pubkey);

        if (!fetchedProfile) {
          return;
        }

        profileStore.getState().setProfile(pubkey, fetchedProfile);
        await saveProfile(pubkey, fetchedProfile);
      } finally {
        profileStore.getState().setLoading(pubkey, false);
      }
    })();
  }, [pubkey]);

  return {
    profile,
    isLoading,
    refresh
  };
}
