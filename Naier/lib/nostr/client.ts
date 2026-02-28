import type { Event as NostrEvent, Filter } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";
import { DEFAULT_RELAYS, NOSTR_KINDS } from "@/constants";

type Unsubscribe = () => void;

export class NostrClient {
  private pool: SimplePool;
  private relayUrls: string[];
  private subscriptions: Map<string, Unsubscribe>;

  constructor(relayUrls: string[]) {
    this.pool = new SimplePool();
    this.relayUrls = [...new Set(relayUrls)];
    this.subscriptions = new Map<string, Unsubscribe>();
  }

  updateRelays(urls: string[]): void {
    this.relayUrls = [...new Set(urls)];
  }

  subscribeDMs(
    myPubkey: string,
    onEvent: (event: NostrEvent) => void,
    onEose?: () => void
  ): () => void {
    const subId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const filter: Filter = {
        kinds: [NOSTR_KINDS.DM],
        "#p": [myPubkey]
      };

      const subscription = this.pool.subscribe(this.relayUrls, filter, {
        onevent(event) {
          onEvent(event);
        },
        oneose() {
          onEose?.();
        }
      });

      const unsubscribe = () => {
        try {
          if (subscription && typeof subscription.close === "function") {
            subscription.close();
          }
        } catch {}

        this.subscriptions.delete(subId);
      };

      this.subscriptions.set(subId, unsubscribe);
      return unsubscribe;
    } catch {
      const noop = () => undefined;
      this.subscriptions.set(subId, noop);
      return () => {
        this.subscriptions.delete(subId);
      };
    }
  }

  async publish(event: NostrEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const results = this.pool.publish(this.relayUrls, event);
      await Promise.any(results);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to publish event."
      };
    }
  }

  async fetchProfile(pubkey: string): Promise<NostrEvent | null> {
    try {
      return await this.pool.get(this.relayUrls, {
        kinds: [NOSTR_KINDS.METADATA],
        authors: [pubkey]
      });
    } catch {
      return null;
    }
  }

  disconnect(): void {
    this.subscriptions.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch {}
    });

    this.subscriptions.clear();

    try {
      this.pool.close(this.relayUrls);
    } catch {}
  }
}

export const nostrClient = new NostrClient(DEFAULT_RELAYS);
