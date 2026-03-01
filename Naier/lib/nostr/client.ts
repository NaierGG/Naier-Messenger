import type { Event as NostrEvent, Filter } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";
import { DEFAULT_RELAYS, NOSTR_KINDS } from "@/constants";
import { relayManager } from "@/lib/nostr/relayManager";
import { isValidRelayUrl } from "@/lib/utils/validation";

type Unsubscribe = () => void;

export class NostrClient {
  private pool: SimplePool;
  private relayUrls: string[];
  private subscriptions: Map<string, Unsubscribe>;

  constructor(relayUrls: string[]) {
    this.pool = new SimplePool({
      enablePing: true,
      enableReconnect: true,
      onRelayConnectionSuccess: (url: string) => {
        relayManager.noteConnectionSuccess(url);
      },
      onRelayConnectionFailure: (url: string) => {
        relayManager.noteConnectionFailure(url, "Relay connection failed.");
      }
    } as never);
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

      const subscription = relayManager.subscribeWithFailover(this.pool, this.relayUrls, filter, {
        onevent(event) {
          onEvent(event);
        },
        oneose: () => {
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
    relayUrls: string[],
    minSuccess = 1
  ): Promise<{
    success: boolean;
    acks: number;
    attemptedRelays: string[];
    failedRelays: string[];
    error?: string;
  }> {
    const uniqueRelayUrls = [...new Set(relayUrls)].filter((url) => isValidRelayUrl(url));

    if (uniqueRelayUrls.length === 0) {
      return {
        success: false,
        acks: 0,
        attemptedRelays: [],
        failedRelays: [],
        error: "No valid relay URLs are available."
      };
    }

    return relayManager.publishWithRetry(this.pool, event, uniqueRelayUrls, minSuccess);
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
      return await this.pool.get(relayManager.getHealthyRelays(this.relayUrls), {
        kinds: [NOSTR_KINDS.METADATA],
        authors: [pubkey]
      });
    } catch {
      return null;
    }
  }

  async fetchInboxRelays(pubkey: string): Promise<string[]> {
    try {
      const relayListEvent = await this.pool.get(relayManager.getHealthyRelays(this.relayUrls), {
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

  async queryGiftWraps(
    myPubkey: string,
    since: number,
    relayUrls = this.relayUrls
  ): Promise<NostrEvent[]> {
    try {
      const activeRelays = relayManager.getHealthyRelays(relayUrls);
      const startedAt = Date.now();
      relayManager.markConnecting(activeRelays);

      const events = await this.pool.querySync(activeRelays, {
        kinds: [NOSTR_KINDS.DM_GIFT_WRAP],
        "#p": [myPubkey],
        since
      });

      activeRelays.forEach((relayUrl) => {
        relayManager.noteConnectionSuccess(relayUrl, Date.now() - startedAt);
      });

      const deduped = new Map<string, NostrEvent>();
      events.forEach((event) => {
        deduped.set(event.id, event);
      });

      return Array.from(deduped.values());
    } catch (error) {
      relayManager.getHealthyRelays(relayUrls).forEach((relayUrl) => {
        relayManager.noteConnectionFailure(
          relayUrl,
          error instanceof Error ? error.message : "Resync failed."
        );
      });
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
      this.pool.close(this.relayUrls.length > 0 ? this.relayUrls : DEFAULT_RELAYS);
    } catch {}
  }
}

export const nostrClient = new NostrClient(DEFAULT_RELAYS);
