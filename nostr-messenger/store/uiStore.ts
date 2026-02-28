import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Toast } from "@/types/ui";

interface UIState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

function createToastId(): string {
  return `${Date.now().toString()}-${Math.random().toString(36).slice(2)}`;
}

export const useUiStore = create<UIState>()(
  immer((set) => ({
    toasts: [],
    isMobileSidebarOpen: false,
    addToast: (toast) => {
      set((state) => {
        state.toasts.push({
          id: createToastId(),
          ...toast
        });
      });
    },
    removeToast: (id) => {
      set((state) => {
        state.toasts = state.toasts.filter((toast) => toast.id !== id);
      });
    },
    toggleMobileSidebar: () => {
      set((state) => {
        state.isMobileSidebarOpen = !state.isMobileSidebarOpen;
      });
    },
    closeMobileSidebar: () => {
      set((state) => {
        state.isMobileSidebarOpen = false;
      });
    }
  }))
);

export const uiStore = useUiStore;
