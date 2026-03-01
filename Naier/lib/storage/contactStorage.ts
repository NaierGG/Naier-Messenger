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

    const parsed = JSON.parse(raw) as Array<Partial<Contact>>;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((contact) => {
      if (typeof contact?.pubkey !== "string" || typeof contact?.addedAt !== "number") {
        return [];
      }

      const status =
        contact.status === "pending" ||
        contact.status === "dismissed" ||
        contact.status === "blocked"
          ? contact.status
          : "accepted";

      return [
        {
          pubkey: contact.pubkey,
          addedAt: contact.addedAt,
          status
        }
      ];
    });
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
