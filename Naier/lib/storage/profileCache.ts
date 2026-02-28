import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { PROFILE_CACHE_TTL } from "@/constants";
import type { NostrProfile, NostrMessage } from "@/types/nostr";

export interface ProfileCacheEntry {
  pubkey: string;
  profile: NostrProfile;
  cachedAt: number;
}

interface ProfileCacheDB extends DBSchema {
  messages: {
    key: string;
    value: NostrMessage;
    indexes: {
      by_conversation: string;
    };
  };
  profiles: {
    key: string;
    value: ProfileCacheEntry;
  };
}

const DB_NAME = "naier";
const DB_VERSION = 1;
const STORE_NAME = "profiles";

async function initDB(): Promise<IDBPDatabase<ProfileCacheDB>> {
  return openDB<ProfileCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("messages")) {
        const messageStore = database.createObjectStore("messages", {
          keyPath: "id"
        });
        messageStore.createIndex("by_conversation", "recipientPubkey");
      }

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: "pubkey"
        });
      }
    }
  });
}

export async function saveProfile(pubkey: string, profile: NostrProfile): Promise<void> {
  const db = await initDB();
  const entry: ProfileCacheEntry = {
    pubkey,
    profile,
    cachedAt: Date.now()
  };

  await db.put(STORE_NAME, entry);
}

export async function getProfile(pubkey: string): Promise<NostrProfile | null> {
  const db = await initDB();
  const entry = await db.get(STORE_NAME, pubkey);

  if (!entry) {
    return null;
  }

  if (Date.now() - entry.cachedAt > PROFILE_CACHE_TTL) {
    return null;
  }

  return entry.profile;
}

export async function clearAll(): Promise<void> {
  const db = await initDB();
  await db.clear(STORE_NAME);
}
