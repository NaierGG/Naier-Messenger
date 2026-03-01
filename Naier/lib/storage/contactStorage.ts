import type { Contact } from "@/types/nostr";

const CONTACTS_STORAGE_KEY = "naier_contacts";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadContacts(): Contact[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CONTACTS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Contact[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (contact) =>
        typeof contact?.pubkey === "string" && typeof contact?.addedAt === "number"
    );
  } catch {
    return [];
  }
}

export function saveContacts(contacts: Contact[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
}
