import type { Event as NostrEvent } from "nostr-tools";
import { nostrClient } from "@/lib/nostr/client";
import type { NostrProfile } from "@/types/nostr";

function emptyProfile(pubkey: string): NostrProfile {
  return {
    pubkey,
    createdAt: Date.now()
  };
}

export function parseProfileEvent(event: NostrEvent): NostrProfile {
  let parsed: Record<string, unknown> = {};

  try {
    parsed = JSON.parse(event.content) as Record<string, unknown>;
  } catch {
    return emptyProfile(event.pubkey);
  }

  return {
    pubkey: event.pubkey,
    name: typeof parsed.name === "string" ? parsed.name : undefined,
    displayName:
      typeof parsed.displayName === "string"
        ? parsed.displayName
        : typeof parsed.display_name === "string"
          ? parsed.display_name
          : undefined,
    about: typeof parsed.about === "string" ? parsed.about : undefined,
    picture: typeof parsed.picture === "string" ? parsed.picture : undefined,
    banner: typeof parsed.banner === "string" ? parsed.banner : undefined,
    nip05: typeof parsed.nip05 === "string" ? parsed.nip05 : undefined,
    nip05Verified:
      typeof parsed.nip05Verified === "boolean" ? parsed.nip05Verified : undefined,
    lud16: typeof parsed.lud16 === "string" ? parsed.lud16 : undefined,
    createdAt: event.created_at
  };
}

export async function fetchProfile(pubkey: string): Promise<NostrProfile | null> {
  try {
    const event = await nostrClient.fetchProfile(pubkey);

    if (!event) {
      return null;
    }

    try {
      JSON.parse(event.content);
    } catch {
      return null;
    }

    return parseProfileEvent(event);
  } catch {
    return null;
  }
}
