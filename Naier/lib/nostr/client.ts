import type { Event as NostrEvent, Filter } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";
import { DEFAULT_RELAYS, NOSTR_KINDS } from "@/constants";
import { isValidRelayUrl } from "@/lib/utils/validation";

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

  getRelayUrls(): string[] {
    return [...this.relayUrls];
  }

  subscribeDMs(
    myPubkey: string,
    onEvent: (event: NostrEvent) => void,
    onEose?: () => void
  ): () => void {
    const subId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const filter: Filter = {
        kinds: [NOSTR_KINDS.DM_GIFT_WRAP],
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

  async publishToRelays(
    event: NostrEvent,
    relayUrls: string[]
  ): Promise<{ success: boolean; acks: number; error?: string }> {
    const uniqueRelayUrls = [...new Set(relayUrls)].filter((url) => isValidRelayUrl(url));

    if (uniqueRelayUrls.length === 0) {
      return {
        success: false,
        acks: 0,
        error: "No valid relay URLs are available."
      };
    }

    try {
      const results = await Promise.allSettled(this.pool.publish(uniqueRelayUrls, event));
      const acks = results.filter((result) => result.status === "fulfilled").length;

      return {
        success: acks > 0,
        acks,
        error: acks > 0 ? undefined : "Failed to publish event."
      };
    } catch (error) {
      return {
        success: false,
        acks: 0,
        error: error instanceof Error ? error.message : "Failed to publish event."
      };
    }
  }

  async publish(event: NostrEvent): Promise<{ success: boolean; error?: string }> {
    const result = await this.publishToRelays(event, this.relayUrls);

    return {
      success: result.success,
      error: result.error
    };
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

  async fetchInboxRelays(pubkey: string): Promise<string[]> {
    try {
      const relayListEvent = await this.pool.get(this.relayUrls, {
        kinds: [NOSTR_KINDS.DM_RELAY_LIST],
        authors: [pubkey]
      });

      if (!relayListEvent) {
        return [];
      }

      return relayListEvent.tags
        .filter((tag) => tag[0] === "relay" && typeof tag[1] === "string")
        .map((tag) => tag[1])
        .filter((url) => isValidRelayUrl(url));
    } catch {
      return [];
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
