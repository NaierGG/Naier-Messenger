"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/Modal";
import { authStore } from "@/store/authStore";

export function LogoutButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function confirmLogout(): void {
    authStore.getState().logout();
    setIsOpen(false);
    router.push("/");
  }

  return (
    <>
      <button
        className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Logout
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Logout">
        <div className="space-y-5">
          <p className="text-sm text-zinc-300">
            Logging out removes your local keys. Make sure you backed them up.
          </p>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white"
              onClick={confirmLogout}
              type="button"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
