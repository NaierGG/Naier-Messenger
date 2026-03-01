import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { DEFAULT_RELAYS } from "@/constants";
import { loadRelayUrls, saveRelayUrls } from "@/lib/storage/relayStorage";
import type { NostrRelay } from "@/types/nostr";

const RELAY_COOLDOWN_MS = 5 * 60 * 1000;

interface RelayState {
  relays: NostrRelay[];
  hydrate: () => void;
  addRelay: (url: string) => void;
  removeRelay: (url: string) => void;
  resetRelays: () => void;
  updateStatus: (url: string, status: NostrRelay["status"], latency?: number) => void;
  recordPublishResult: (url: string, success: boolean, latency?: number, error?: string) => void;
  markFailure: (url: string, error: string, cooldownMs?: number) => void;
  clearExpiredCooldowns: () => void;
  getHealthyRelays: (candidateUrls?: string[]) => string[];
  getConnectedRelays: () => string[];
  initRelays: () => void;
}

function createRelay(url: string): NostrRelay {
  return {
    url,
    status: "disconnected",
    recentErrors: 0,
    publishAttempts: 0,
    publishSuccesses: 0,
    successRate: 0
  };
}

function buildRelayState(relayUrls: string[]): NostrRelay[] {
  return [...new Set(relayUrls)].map((url) => createRelay(url));
}

function updateDerivedMetrics(relay: NostrRelay): void {
  relay.successRate =
    relay.publishAttempts === 0
      ? 0
      : Math.round((relay.publishSuccesses / relay.publishAttempts) * 100);
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

        state.relays.push(createRelay(url));
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
        relay.lastCheckedAt = Date.now();
        if (latency !== undefined) {
          relay.latency = latency;
        }
        if (status === "connected") {
          relay.lastError = undefined;
          relay.recentErrors = 0;
          relay.cooldownUntil = undefined;
        }
      });
    },
    recordPublishResult: (url, success, latency, error) => {
      set((state) => {
        const relay = state.relays.find((item) => item.url === url);

        if (!relay) {
          return;
        }

        relay.publishAttempts += 1;
        relay.lastCheckedAt = Date.now();

        if (latency !== undefined) {
          relay.latency = latency;
        }

        if (success) {
          relay.publishSuccesses += 1;
          relay.status = "connected";
          relay.lastError = undefined;
          relay.recentErrors = 0;
          relay.cooldownUntil = undefined;
        } else {
          relay.status = "error";
          relay.lastError = error;
          relay.recentErrors += 1;

          if (relay.recentErrors >= 2) {
            relay.cooldownUntil = Date.now() + RELAY_COOLDOWN_MS;
          }
        }

        updateDerivedMetrics(relay);
      });
    },
    markFailure: (url, error, cooldownMs = RELAY_COOLDOWN_MS) => {
      set((state) => {
        const relay = state.relays.find((item) => item.url === url);

        if (!relay) {
          return;
        }

        relay.status = "error";
        relay.lastError = error;
        relay.lastCheckedAt = Date.now();
        relay.recentErrors += 1;

        if (relay.recentErrors >= 2) {
          relay.cooldownUntil = Date.now() + cooldownMs;
        }
      });
    },
    clearExpiredCooldowns: () => {
      set((state) => {
        const now = Date.now();

        state.relays.forEach((relay) => {
          if (relay.cooldownUntil && relay.cooldownUntil <= now) {
            relay.cooldownUntil = undefined;
            relay.status = "disconnected";
          }
        });
      });
    },
    getHealthyRelays: (candidateUrls) => {
      get().clearExpiredCooldowns();

      const candidateSet = candidateUrls ? new Set(candidateUrls) : null;
      return get()
        .relays.filter((relay) => {
          if (candidateSet && !candidateSet.has(relay.url)) {
            return false;
          }

          return !relay.cooldownUntil || relay.cooldownUntil <= Date.now();
        })
        .map((relay) => relay.url);
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
