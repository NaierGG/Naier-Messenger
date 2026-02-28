import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { NostrMessage, NostrProfile } from "@/types/nostr";

interface ProfileCacheEntry {
  pubkey: string;
  profile: NostrProfile;
  cachedAt: number;
}

interface MessageCacheDB extends DBSchema {
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

const DB_NAME = "nostr-messenger";
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase<MessageCacheDB>> {
  return openDB<MessageCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("messages")) {
        const messageStore = database.createObjectStore("messages", {
          keyPath: "id"
        });
        messageStore.createIndex("by_conversation", "recipientPubkey");
      }

      if (!database.objectStoreNames.contains("profiles")) {
        database.createObjectStore("profiles", {
          keyPath: "pubkey"
        });
      }
    }
  });
}

export async function saveMessage(msg: NostrMessage): Promise<void> {
  const db = await initDB();
  await db.put("messages", msg);
}

export async function getMessages(conversationPubkey: string): Promise<NostrMessage[]> {
  const db = await initDB();
  const messages = await db.getAllFromIndex("messages", "by_conversation", conversationPubkey);

  return messages.sort((left, right) => left.createdAt - right.createdAt);
}

export async function clearAll(): Promise<void> {
  const db = await initDB();
  await db.clear("messages");
}
