import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { NostrProfile } from "@/types/nostr";

interface ProfileState {
  profiles: Record<string, NostrProfile>;
  loadingPubkeys: string[];
  setProfile: (pubkey: string, profile: NostrProfile) => void;
  getProfile: (pubkey: string) => NostrProfile | undefined;
  setLoading: (pubkey: string, loading: boolean) => void;
  isLoading: (pubkey: string) => boolean;
}

export const useProfileStore = create<ProfileState>()(
  immer((set, get) => ({
    profiles: {},
    loadingPubkeys: [],
    setProfile: (pubkey, profile) => {
      set((state) => {
        state.profiles[pubkey] = profile;
      });
    },
    getProfile: (pubkey) => get().profiles[pubkey],
    setLoading: (pubkey, loading) => {
      set((state) => {
        const exists = state.loadingPubkeys.includes(pubkey);

        if (loading && !exists) {
          state.loadingPubkeys.push(pubkey);
        }

        if (!loading && exists) {
          state.loadingPubkeys = state.loadingPubkeys.filter((item) => item !== pubkey);
        }
      });
    },
    isLoading: (pubkey) => get().loadingPubkeys.includes(pubkey)
  }))
);

export const profileStore = useProfileStore;
