"use client";

import { useEffect, useMemo, useState } from "react";
import { RelayItem } from "@/components/relay/RelayItem";
import { nostrClient } from "@/lib/nostr/client";
import { isValidRelayUrl } from "@/lib/utils/validation";
import { useRelayStore } from "@/store/relayStore";

export function RelayList() {
  const relays = useRelayStore((state) => state.relays);
  const addRelay = useRelayStore((state) => state.addRelay);
  const removeRelay = useRelayStore((state) => state.removeRelay);
  const initRelays = useRelayStore((state) => state.initRelays);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (relays.length === 0) {
      initRelays();
    }
  }, [initRelays, relays.length]);

  const connectedCount = useMemo(
    () => relays.filter((relay) => relay.status === "connected").length,
    [relays]
  );

  function syncRelays(nextUrls: string[]) {
    nostrClient.updateRelays(nextUrls);
  }

  function handleAdd() {
    const trimmed = url.trim();

    if (!isValidRelayUrl(trimmed)) {
      setError("Enter a valid ws:// or wss:// URL.");
      return;
    }

    if (relays.some((relay) => relay.url === trimmed)) {
      setError("That relay is already added.");
      return;
    }

    addRelay(trimmed);
    syncRelays([...relays.map((relay) => relay.url), trimmed]);
    setUrl("");
    setError("");
  }

  function handleRemove(targetUrl: string) {
    removeRelay(targetUrl);
    syncRelays(relays.filter((relay) => relay.url !== targetUrl).map((relay) => relay.url));
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-300">
        Connected relays:{" "}
        <span className="font-semibold text-zinc-100">
          {connectedCount}/{relays.length}
        </span>
      </div>

      <div className="grid gap-3">
        {relays.map((relay) => (
          <RelayItem key={relay.url} onRemove={handleRemove} relay={relay} />
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
            onChange={(event) => {
              setUrl(event.target.value);
              setError("");
            }}
            placeholder="wss://relay.example.com"
            value={url}
          />
          <button
            className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400"
            onClick={handleAdd}
            type="button"
          >
            Add
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}
