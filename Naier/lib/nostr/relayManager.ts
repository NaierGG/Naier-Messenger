import type { Event as NostrEvent, Filter } from "nostr-tools";
import { DEFAULT_RELAYS } from "@/constants";
import { relayStore } from "@/store/relayStore";

const PUBLISH_TIMEOUT_MS = 8000;

interface PoolSubscriptionParams {
  onevent?: (event: NostrEvent) => void;
  oneose?: () => void;
  onclose?: (reasons: string[]) => void;
}

interface PoolCloser {
  close: (reason?: string) => void;
}

interface RelayPoolLike {
  publish: (relayUrls: string[], event: NostrEvent, params?: { maxWait?: number }) => Promise<string>[];
  subscribe: (relayUrls: string[], filter: Filter, params: PoolSubscriptionParams) => PoolCloser;
}

function getReasonLabel(reason: unknown): string {
  if (reason instanceof Error && reason.message) {
    return reason.message;
  }

  if (typeof reason === "string" && reason.trim().length > 0) {
    return reason;
  }

  return "Relay request failed.";
}

function uniqueUrls(relayUrls: string[]): string[] {
  return [...new Set(relayUrls)];
}

export class RelayManager {
  getHealthyRelays(relayUrls: string[]): string[] {
    const candidates = relayUrls.length > 0 ? relayUrls : DEFAULT_RELAYS;
    const healthy = relayStore.getState().getHealthyRelays(candidates);

    return healthy.length > 0 ? healthy : uniqueUrls(candidates);
  }

  getRetryRelays(relayUrls: string[], exclude: string[]): string[] {
    const excluded = new Set(exclude);
    return this.getHealthyRelays(relayUrls).filter((relayUrl) => !excluded.has(relayUrl));
  }

  markConnecting(relayUrls: string[]): void {
    uniqueUrls(relayUrls).forEach((relayUrl) => {
      relayStore.getState().updateStatus(relayUrl, "connecting");
    });
  }

  noteConnectionSuccess(relayUrl: string, latency?: number): void {
    relayStore.getState().updateStatus(relayUrl, "connected", latency);
  }

  noteConnectionFailure(relayUrl: string, reason: string): void {
    relayStore.getState().markFailure(relayUrl, reason);
  }

  async publishWithRetry(
    pool: RelayPoolLike,
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
    const primaryRelays = this.getHealthyRelays(relayUrls);
    const retryRelays = this.getRetryRelays([...relayUrls, ...DEFAULT_RELAYS], primaryRelays);
    const relayBatches = [primaryRelays, retryRelays].filter((batch) => batch.length > 0);
    const attemptedRelays = new Set<string>();
    const failedRelays = new Set<string>();
    let ackCount = 0;
    let lastError: string | undefined;

    for (const relayBatch of relayBatches) {
      if (ackCount >= minSuccess) {
        break;
      }

      const startedAt = Date.now();
      this.markConnecting(relayBatch);
      const results = await Promise.allSettled(
        pool.publish(relayBatch, event, { maxWait: PUBLISH_TIMEOUT_MS })
      );

      results.forEach((result, index) => {
        const relayUrl = relayBatch[index];
        const latency = Date.now() - startedAt;

        attemptedRelays.add(relayUrl);

        if (result.status === "fulfilled") {
          ackCount += 1;
          relayStore.getState().recordPublishResult(relayUrl, true, latency);
          return;
        }

        const reason = getReasonLabel(result.reason);
        relayStore.getState().recordPublishResult(relayUrl, false, latency, reason);
        failedRelays.add(relayUrl);
        lastError = reason;
      });
    }

    return {
      success: ackCount >= minSuccess,
      acks: ackCount,
      attemptedRelays: Array.from(attemptedRelays),
      failedRelays: Array.from(failedRelays),
      error: ackCount >= minSuccess ? undefined : lastError ?? "Failed to publish event."
    };
  }

  subscribeWithFailover(
    pool: RelayPoolLike,
    relayUrls: string[],
    filter: Filter,
    params: PoolSubscriptionParams
  ): PoolCloser {
    const activeRelays = this.getHealthyRelays(relayUrls);
    const startedAt = Date.now();

    this.markConnecting(activeRelays);

    return pool.subscribe(activeRelays, filter, {
      ...params,
      onevent: (event) => {
        const latency = Date.now() - startedAt;
        activeRelays.forEach((relayUrl) => {
          this.noteConnectionSuccess(relayUrl, latency);
        });
        params.onevent?.(event);
      },
      oneose: () => {
        activeRelays.forEach((relayUrl) => {
          this.noteConnectionSuccess(relayUrl, Date.now() - startedAt);
        });
        params.oneose?.();
      },
      onclose: (reasons) => {
        activeRelays.forEach((relayUrl, index) => {
          const reason = reasons[index] ?? reasons[0] ?? "Subscription closed.";
          this.noteConnectionFailure(relayUrl, reason);
        });
        params.onclose?.(reasons);
      }
    });
  }
}

export const relayManager = new RelayManager();
