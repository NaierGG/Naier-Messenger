const DB_NAME = "naier-db";
const DB_VERSION = 1;
const MESSAGE_STORE = "messages";
const PROFILE_STORE = "profiles";

function isIndexedDbAvailable() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

export function openCacheDb(): Promise<IDBDatabase | null> {
  if (!isIndexedDbAvailable()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(MESSAGE_STORE)) {
        const messageStore = database.createObjectStore(MESSAGE_STORE, {
          keyPath: "id"
        });
        messageStore.createIndex("conversationPubkey", "conversationPubkey", {
          unique: false
        });
      }

      if (!database.objectStoreNames.contains(PROFILE_STORE)) {
        database.createObjectStore(PROFILE_STORE, {
          keyPath: "pubkey"
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const IDB_STORES = {
  MESSAGE_STORE,
  PROFILE_STORE
} as const;
