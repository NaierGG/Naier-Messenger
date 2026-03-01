import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { DEFAULT_RELAYS } from "@/constants";
import { loadRelayUrls, saveRelayUrls } from "@/lib/storage/relayStorage";
import type { NostrRelay } from "@/types/nostr";

interface RelayState {
  relays: NostrRelay[];
  hydrate: () => void;
  addRelay: (url: string) => void;
  removeRelay: (url: string) => void;
  resetRelays: () => void;
  updateStatus: (url: string, status: NostrRelay["status"], latency?: number) => void;
  getConnectedRelays: () => string[];
  initRelays: () => void;
}

function buildRelayState(relayUrls: string[]): NostrRelay[] {
  return [...new Set(relayUrls)].map((url) => ({
    url,
    status: "disconnected"
  }));
}

function persistRelays(relays: NostrRelay[]): void {
  saveRelayUrls(relays.map((relay) => relay.url));
}

export const useRelayStore = create<RelayState>()(
  immer((set, get) => ({
    relays: [],
    hydrate: () => {
      const savedRelayUrls = loadRelayUrls();
      const nextRelayUrls = savedRelayUrls.length > 0 ? savedRelayUrls : DEFAULT_RELAYS;

      set((state) => {
        state.relays = buildRelayState(nextRelayUrls);
      });
    },
    addRelay: (url) => {
      set((state) => {
        if (state.relays.some((relay) => relay.url === url)) {
          return;
        }

        state.relays.push({
          url,
          status: "disconnected"
        });
        persistRelays(state.relays);
      });
    },
    removeRelay: (url) => {
      set((state) => {
        state.relays = state.relays.filter((relay) => relay.url !== url);
        persistRelays(state.relays);
      });
    },
    resetRelays: () => {
      set((state) => {
        state.relays = buildRelayState(DEFAULT_RELAYS);
        persistRelays(state.relays);
      });
    },
    updateStatus: (url, status, latency) => {
      set((state) => {
        const relay = state.relays.find((item) => item.url === url);

        if (!relay) {
          return;
        }

        relay.status = status;
        if (latency !== undefined) {
          relay.latency = latency;
        }
      });
    },
    getConnectedRelays: () =>
      get()
        .relays.filter((relay) => relay.status === "connected")
        .map((relay) => relay.url),
    initRelays: () => {
      set((state) => {
        state.relays = buildRelayState(DEFAULT_RELAYS);
        persistRelays(state.relays);
      });
    }
  }))
);

export const relayStore = useRelayStore;
