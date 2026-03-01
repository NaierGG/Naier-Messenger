import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { loadContacts, saveContacts } from "@/lib/storage/contactStorage";
import type { Contact, ContactStatus } from "@/types/nostr";

interface ContactState {
  contacts: Contact[];
  hydrate: () => void;
  addContact: (pubkey: string, status?: ContactStatus) => void;
  acceptContact: (pubkey: string) => void;
  dismissContact: (pubkey: string) => void;
  blockContact: (pubkey: string) => void;
  unblockContact: (pubkey: string) => void;
  hasContact: (pubkey: string) => boolean;
  isBlocked: (pubkey: string) => boolean;
  getContact: (pubkey: string) => Contact | undefined;
}

function sortContacts(contacts: Contact[]): Contact[] {
  return [...contacts].sort((left, right) => right.addedAt - left.addedAt);
}

function upsertContact(
  contacts: Contact[],
  pubkey: string,
  status: ContactStatus
): Contact[] {
  const existing = contacts.find((contact) => contact.pubkey === pubkey);

  if (!existing) {
    return [
      ...contacts,
      {
        pubkey,
        addedAt: Date.now(),
        status
      }
    ];
  }

  return contacts.map((contact): Contact =>
    contact.pubkey === pubkey
      ? {
          ...contact,
          addedAt: Date.now(),
          status
        }
      : contact
  );
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
    addContact: (pubkey, status = "accepted") => {
      const normalizedPubkey = pubkey.trim().toLowerCase();

      if (!normalizedPubkey) {
        return;
      }

      set((state) => {
        const existing = state.contacts.find((contact) => contact.pubkey === normalizedPubkey);
        let nextStatus = status;

        if (existing?.status === "blocked") {
          nextStatus = "blocked";
        } else if (status === "pending" && existing?.status === "accepted") {
          nextStatus = "accepted";
        }

        const nextContacts = upsertContact(state.contacts, normalizedPubkey, nextStatus);

        state.contacts = sortContacts(nextContacts);
        saveContacts(state.contacts);
      });
    },
    acceptContact: (pubkey) => {
      const normalizedPubkey = pubkey.trim().toLowerCase();

      if (!normalizedPubkey) {
        return;
      }

      set((state) => {
        const nextContacts = upsertContact(state.contacts, normalizedPubkey, "accepted");

        state.contacts = sortContacts(nextContacts);
        saveContacts(state.contacts);
      });
    },
    dismissContact: (pubkey) => {
      const normalizedPubkey = pubkey.trim().toLowerCase();

      if (!normalizedPubkey) {
        return;
      }

      set((state) => {
        const nextContacts = upsertContact(state.contacts, normalizedPubkey, "dismissed");
        state.contacts = sortContacts(nextContacts);
        saveContacts(state.contacts);
      });
    },
    blockContact: (pubkey) => {
      const normalizedPubkey = pubkey.trim().toLowerCase();

      if (!normalizedPubkey) {
        return;
      }

      set((state) => {
        const nextContacts = upsertContact(state.contacts, normalizedPubkey, "blocked");
        state.contacts = sortContacts(nextContacts);
        saveContacts(state.contacts);
      });
    },
    unblockContact: (pubkey) => {
      const normalizedPubkey = pubkey.trim().toLowerCase();

      if (!normalizedPubkey) {
        return;
      }

      set((state) => {
        const nextContacts = upsertContact(state.contacts, normalizedPubkey, "accepted");
        state.contacts = sortContacts(nextContacts);
        saveContacts(state.contacts);
      });
    },
    hasContact: (pubkey) =>
      get().contacts.some(
        (contact) =>
          contact.pubkey === pubkey.trim().toLowerCase() && contact.status === "accepted"
      ),
    isBlocked: (pubkey) =>
      get().contacts.some(
        (contact) =>
          contact.pubkey === pubkey.trim().toLowerCase() && contact.status === "blocked"
      ),
    getContact: (pubkey) =>
      get().contacts.find((contact) => contact.pubkey === pubkey.trim().toLowerCase())
  }))
);

export const contactStore = useContactStore;
