import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { loadContacts, saveContacts } from "@/lib/storage/contactStorage";
import type { Contact } from "@/types/nostr";

interface ContactState {
  contacts: Contact[];
  hydrate: () => void;
  addContact: (pubkey: string) => void;
  hasContact: (pubkey: string) => boolean;
}

function sortContacts(contacts: Contact[]): Contact[] {
  return [...contacts].sort((left, right) => right.addedAt - left.addedAt);
}

export const useContactStore = create<ContactState>()(
  immer((set, get) => ({
    contacts: [],
    hydrate: () => {
      const contacts = loadContacts();

      set((state) => {
        state.contacts = sortContacts(contacts);
      });
    },
    addContact: (pubkey) => {
      const normalizedPubkey = pubkey.trim().toLowerCase();

      if (!normalizedPubkey) {
        return;
      }

      set((state) => {
        const existing = state.contacts.find((contact) => contact.pubkey === normalizedPubkey);
        const nextContacts = existing
          ? state.contacts.map((contact) =>
              contact.pubkey === normalizedPubkey
                ? {
                    ...contact,
                    addedAt: Date.now()
                  }
                : contact
            )
          : [
              ...state.contacts,
              {
                pubkey: normalizedPubkey,
                addedAt: Date.now()
              }
            ];

        state.contacts = sortContacts(nextContacts);
        saveContacts(state.contacts);
      });
    },
    hasContact: (pubkey) =>
      get().contacts.some((contact) => contact.pubkey === pubkey.trim().toLowerCase())
  }))
);

export const contactStore = useContactStore;
