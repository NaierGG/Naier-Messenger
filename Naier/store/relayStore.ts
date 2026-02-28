import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { DEFAULT_RELAYS } from "@/constants";
import type { NostrRelay } from "@/types/nostr";

interface RelayState {
  relays: NostrRelay[];
  addRelay: (url: string) => void;
  removeRelay: (url: string) => void;
  updateStatus: (url: string, status: NostrRelay["status"], latency?: number) => void;
  getConnectedRelays: () => string[];
  initRelays: () => void;
}

export const useRelayStore = create<RelayState>()(
  immer((set, get) => ({
    relays: [],
    addRelay: (url) => {
      set((state) => {
        if (state.relays.some((relay) => relay.url === url)) {
          return;
        }

        state.relays.push({
          url,
          status: "disconnected"
        });
      });
    },
    removeRelay: (url) => {
      set((state) => {
        state.relays = state.relays.filter((relay) => relay.url !== url);
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
        state.relays = DEFAULT_RELAYS.map((url) => ({
          url,
          status: "disconnected"
        }));
      });
    }
  }))
);

export const relayStore = useRelayStore;
