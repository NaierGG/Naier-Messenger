import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { clearKeys, loadKeys, saveKeys } from "@/lib/storage/keyStorage";
import type { NostrKeyPair } from "@/types/nostr";

interface AuthState {
  isLoggedIn: boolean;
  privkey: string | null;
  pubkey: string | null;
  npub: string | null;
  setKeys: (keyPair: NostrKeyPair) => void;
  logout: () => void;
  hydrate: () => void;
}

const AUTH_COOKIE = "nostr_logged_in=true; path=/; max-age=31536000; SameSite=Lax";
const CLEAR_AUTH_COOKIE = "nostr_logged_in=; path=/; max-age=0; SameSite=Lax";

function setAuthCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = AUTH_COOKIE;
}

function clearAuthCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = CLEAR_AUTH_COOKIE;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    isLoggedIn: false,
    privkey: null,
    pubkey: null,
    npub: null,
    setKeys: (keyPair) => {
      saveKeys(keyPair);
      setAuthCookie();

      set((state) => {
        state.isLoggedIn = true;
        state.privkey = keyPair.privkey;
        state.pubkey = keyPair.pubkey;
        state.npub = keyPair.npub;
      });
    },
    logout: () => {
      clearKeys();
      clearAuthCookie();

      set((state) => {
        state.isLoggedIn = false;
        state.privkey = null;
        state.pubkey = null;
        state.npub = null;
      });
    },
    hydrate: () => {
      const keyPair = loadKeys();

      set((state) => {
        state.isLoggedIn = Boolean(keyPair);
        state.privkey = keyPair?.privkey ?? null;
        state.pubkey = keyPair?.pubkey ?? null;
        state.npub = keyPair?.npub ?? null;
      });
    }
  }))
);

export const authStore = useAuthStore;
