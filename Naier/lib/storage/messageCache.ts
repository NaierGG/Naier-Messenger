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

const DB_NAME = "naier";
const DB_VERSION = 2;

function deriveConversationKey(message: Pick<NostrMessage, "pubkey" | "recipientPubkey">): string {
  return [message.pubkey, message.recipientPubkey].map((value) => value.trim().toLowerCase()).sort().join(":");
}

function derivePeerPubkey(message: Pick<NostrMessage, "pubkey" | "recipientPubkey" | "isMine">): string {
  return message.isMine ? message.recipientPubkey : message.pubkey;
}

export async function initDB(): Promise<IDBPDatabase<MessageCacheDB>> {
  return openDB<MessageCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, _newVersion, transaction) {
      let messageStore;

      if (!database.objectStoreNames.contains("messages")) {
        messageStore = database.createObjectStore("messages", {
          keyPath: "id"
        });
      } else {
        messageStore = transaction.objectStore("messages");
      }

      if (messageStore.indexNames.contains("by_conversation")) {
        messageStore.deleteIndex("by_conversation");
      }

      messageStore.createIndex("by_conversation", "conversationKey");

      if (!database.objectStoreNames.contains("profiles")) {
        database.createObjectStore("profiles", {
          keyPath: "pubkey"
        });
      }

      if (oldVersion < 2) {
        void messageStore.openCursor().then(function iterate(
          cursor
        ): Promise<void | null> | void {
          if (!cursor) {
            return;
          }

          const current = cursor.value as NostrMessage;
          const nextValue: NostrMessage = {
            ...current,
            peerPubkey: current.peerPubkey ?? derivePeerPubkey(current),
            conversationKey: current.conversationKey ?? deriveConversationKey(current)
          };

          cursor.update(nextValue);
          return cursor.continue().then(iterate);
        });
      }
    }
  });
}

export async function saveMessage(msg: NostrMessage): Promise<void> {
  const db = await initDB();
  await db.put("messages", msg);
}

export async function getMessages(conversationKey: string): Promise<NostrMessage[]> {
  const db = await initDB();
  const messages = await db.getAllFromIndex("messages", "by_conversation", conversationKey);

  return messages.sort((left, right) =>
    left.createdAt === right.createdAt
      ? left.id.localeCompare(right.id)
      : left.createdAt - right.createdAt
  );
}

export async function clearAll(): Promise<void> {
  const db = await initDB();
  await db.clear("messages");
}
